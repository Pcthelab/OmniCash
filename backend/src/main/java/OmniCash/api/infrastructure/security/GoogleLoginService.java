package OmniCash.api.infrastructure.security;

import OmniCash.api.infrastructure.persistence.entity.*;
import OmniCash.api.infrastructure.persistence.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.UUID;

@Service
public class GoogleLoginService {
    private final GoogleTokenVerifier verifier;
    private final GoogleIdentityRepository identities;
    private final SpringDataUserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService tokens;

    public GoogleLoginService(GoogleTokenVerifier verifier, GoogleIdentityRepository identities,
                              SpringDataUserRepository users, PasswordEncoder encoder, JwtService tokens) {
        this.verifier = verifier; this.identities = identities; this.users = users;
        this.encoder = encoder; this.tokens = tokens;
    }

    @Transactional
    public String login(String credential) {
        var claims = verifier.verify(credential);
        var identity = identities.findById(claims.getSubject());
        UserEntity user;
        if (identity.isPresent()) {
            user = identity.get().getUser();
        } else {
            String email = claims.getClaimAsString("email");
            // An email match is not authorization to link an existing financial account.
            if (users.findByEmail(email).isPresent()) {
                throw new IllegalArgumentException("Já existe uma conta com esse e-mail. Entre com sua senha ou use Esqueci minha senha.");
            }
            String name = claims.getClaimAsString("name");
            user = users.saveAndFlush(new UserEntity(null,
                    name == null || name.isBlank() ? "Minha conta" : name.substring(0, Math.min(name.length(), 100)),
                    email, encoder.encode(UUID.randomUUID().toString())));
            identities.saveAndFlush(new GoogleIdentityEntity(claims.getSubject(), user));
        }
        return tokens.generateToken(org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail()).password(user.getPassword()).authorities("USER").build());
    }
}
