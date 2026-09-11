package OmniCash.api;

import OmniCash.api.infrastructure.security.*;
import OmniCash.api.infrastructure.persistence.entity.UserEntity;
import OmniCash.api.infrastructure.persistence.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.jwt.Jwt;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentCaptor;

@SpringBootTest(properties = "spring.jpa.show-sql=false")
@ActiveProfiles("test")
class AccountSecurityTests {
    @Autowired PasswordRecoveryService recovery;
    @Autowired SpringDataUserRepository users;
    @Autowired PasswordResetRepository resets;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtService tokens;
    @Autowired GoogleLoginService google;
    @Autowired OmniCash.api.domain.repository.UserRepository domainUsers;
    @MockitoBean RecoveryMailer mailer;
    @MockitoBean GoogleTokenVerifier verifier;

    private UserEntity account() {
        return users.saveAndFlush(new UserEntity(null, "Teste", UUID.randomUUID() + "@example.test", encoder.encode("SenhaAntiga123")));
    }

    private String request(UserEntity user) {
        when(mailer.enabled()).thenReturn(true);
        recovery.request(user.getEmail());
        var token = ArgumentCaptor.forClass(String.class);
        verify(mailer).send(eq(user.getEmail()), token.capture());
        return token.getValue();
    }

    @Test void resetChangesPasswordConsumesTokenAndRevokesSession() {
        var user = account();
        var details = User.withUsername(user.getEmail()).password(user.getPassword()).authorities("USER").build();
        String jwt = tokens.generateToken(details);
        assertThat(tokens.isTokenValid(jwt, details)).isTrue();
        String token = request(user);
        assertThat(resets.findById(user.getId()).orElseThrow().getTokenHash()).isNotEqualTo(token);
        recovery.reset(token, "MinhaNovaSenha123");
        var updated = users.findById(user.getId()).orElseThrow();
        assertThat(encoder.matches("MinhaNovaSenha123", updated.getPassword())).isTrue();
        assertThat(tokens.isTokenValid(jwt, User.withUsername(user.getEmail()).password(updated.getPassword()).authorities("USER").build())).isFalse();
        assertThatThrownBy(() -> recovery.reset(token, "OutraSenha123")).isInstanceOf(IllegalArgumentException.class);
    }

    @Test void expiredAndWeakPasswordDoNotChangeAccount() {
        var user = account();
        String token = request(user);
        assertThatThrownBy(() -> recovery.reset(token, "abc")).isInstanceOf(IllegalArgumentException.class);
        var reset = resets.findById(user.getId()).orElseThrow();
        reset.setExpiresAt(Instant.now().minusSeconds(1));
        resets.saveAndFlush(reset);
        assertThatThrownBy(() -> recovery.reset(token, "MinhaNovaSenha123")).hasMessageContaining("expirado");
        assertThat(users.findById(user.getId()).orElseThrow().getPassword()).isEqualTo(user.getPassword());
    }

    @Test void requestsForUnknownUsersDoNotSendMailAndKnownUsersHaveCooldown() {
        when(mailer.enabled()).thenReturn(true);
        recovery.request("missing@example.test");
        verify(mailer, never()).send(anyString(), anyString());
        var user = account();
        request(user);
        recovery.request(user.getEmail());
        verify(mailer, times(1)).send(eq(user.getEmail()), anyString());
    }

    @Test void providerFailureRollsBackTokenWithoutExposingProviderResponse() {
        var user = account();
        when(mailer.enabled()).thenReturn(true);
        doThrow(new org.springframework.web.client.RestClientException("private provider details")).when(mailer).send(anyString(), anyString());
        assertThatCode(() -> recovery.request(user.getEmail())).doesNotThrowAnyException();
        assertThat(resets.findById(user.getId())).isEmpty();
    }

    @Test void concurrentResetOnlySucceedsOnce() throws Exception {
        String token = request(account());
        try (var executor = Executors.newFixedThreadPool(2)) {
            var start = new CountDownLatch(1);
            Callable<Boolean> reset = () -> { start.await(); try { recovery.reset(token, "MinhaNovaSenha123"); return true; }
                catch (IllegalArgumentException e) { return false; } };
            var first = executor.submit(reset); var second = executor.submit(reset); start.countDown();
            assertThat(java.util.List.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder(true, false);
        }
    }

    @Test void googleUsesSubjectAndNeverAutomaticallyLinksExistingEmail() {
        var user = account();
        when(verifier.verify("existing")).thenReturn(claims("new-subject", user.getEmail()));
        assertThatThrownBy(() -> google.login("existing")).hasMessageContaining("Já existe uma conta");
        String subject = UUID.randomUUID().toString();
        String email = UUID.randomUUID() + "@example.test";
        when(verifier.verify("new")).thenReturn(claims(subject, email));
        String first = google.login("new");
        when(verifier.verify("return")).thenReturn(claims(subject, "changed@example.test"));
        assertThat(tokens.extractUsername(google.login("return"))).isEqualTo(tokens.extractUsername(first));
    }

    private Jwt claims(String subject, String email) {
        return Jwt.withTokenValue("verified-by-mock").header("alg", "RS256").subject(subject)
                .claim("email", email).claim("name", "Conta Google").build();
    }

    @Test void passwordPolicyRejectsWeakAndOversizedUtf8Passwords() {
        for (String value : java.util.List.of("curta", "minusculas123", "MAIUSCULAS123", "SemNumeroLonga", "Aa1" + "🔒".repeat(18)))
            assertThatThrownBy(() -> PasswordPolicy.validate(value)).isInstanceOf(IllegalArgumentException.class);
        assertThatCode(() -> PasswordPolicy.validate("Uma frase longa 123")).doesNotThrowAnyException();
    }

    @Test void profileUpdateCannotRestorePasswordFromBeforeRecovery() {
        var user = account();
        String token = request(user);
        recovery.reset(token, "MinhaNovaSenha123");
        domainUsers.updateName(user.getId(), "Novo nome");
        var updated = users.findById(user.getId()).orElseThrow();
        assertThat(updated.getName()).isEqualTo("Novo nome");
        assertThat(encoder.matches("MinhaNovaSenha123", updated.getPassword())).isTrue();
    }
}
