package OmniCash.api.infrastructure.security;

import OmniCash.api.infrastructure.persistence.entity.PasswordResetEntity;
import OmniCash.api.infrastructure.persistence.repository.PasswordResetRepository;
import OmniCash.api.infrastructure.persistence.repository.SpringDataUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.security.SecureRandom;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class PasswordRecoveryService {
    private final SpringDataUserRepository users;
    private final PasswordResetRepository resets;
    private final PasswordEncoder encoder;
    private final RecoveryMailer mailer;
    private final SecureRandom random = new SecureRandom();

    public PasswordRecoveryService(SpringDataUserRepository users, PasswordResetRepository resets,
                                   PasswordEncoder encoder, RecoveryMailer mailer) {
        this.users = users; this.resets = resets; this.encoder = encoder; this.mailer = mailer;
    }

    @Transactional
    public void request(String email) {
        if (!mailer.enabled()) throw new IllegalArgumentException("A recuperação de senha está indisponível no momento.");
        var found = users.findByEmail(email.trim());
        if (found.isEmpty()) return;
        var user = users.findLockedById(found.get().getId()).orElseThrow();
        var previous = resets.findById(user.getId());
        Instant now = Instant.now();
        if (previous.isPresent() && previous.get().getRequestedAt().plus(Duration.ofMinutes(2)).isAfter(now)) return;
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        var reset = previous.orElseGet(PasswordResetEntity::new);
        reset.setUserId(user.getId());
        reset.setTokenHash(hash(token));
        reset.setRequestedAt(now);
        reset.setExpiresAt(now.plus(Duration.ofMinutes(30)));
        resets.saveAndFlush(reset);
        try {
            mailer.send(user.getEmail(), token);
        } catch (org.springframework.web.client.RestClientException exception) {
            // Never expose provider responses, recipient addresses or the link.
            org.slf4j.LoggerFactory.getLogger(getClass()).warn("Password recovery email delivery failed");
            org.springframework.transaction.interceptor.TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        }
    }

    @Transactional
    public void reset(String token, String password) {
        PasswordPolicy.validate(password);
        String digest = hash(token);
        var candidate = resets.findByTokenHash(digest).orElseThrow(PasswordRecoveryService::invalid);
        var user = users.findLockedById(candidate.getUserId()).orElseThrow(PasswordRecoveryService::invalid);
        // Re-read after acquiring the user lock: concurrent requests cannot reuse a token.
        var reset = resets.findByTokenHash(digest).orElseThrow(PasswordRecoveryService::invalid);
        if (!reset.getExpiresAt().isAfter(Instant.now())) throw invalid();
        user.setPassword(encoder.encode(password));
        users.save(user);
        resets.delete(reset);
        resets.flush();
    }

    private static IllegalArgumentException invalid() {
        return new IllegalArgumentException("Link inválido ou expirado. Solicite um novo e-mail de recuperação.");
    }

    public static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
    }
}
