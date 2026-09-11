package OmniCash.api.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.core.*;

@Service
public class GoogleTokenVerifier {
    private final String clientId;
    private final NimbusJwtDecoder decoder;

    @org.springframework.beans.factory.annotation.Autowired
    public GoogleTokenVerifier(@Value("${api.google.client-id:}") String clientId) {
        this(clientId, NimbusJwtDecoder.withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").build());
    }

    GoogleTokenVerifier(String clientId, NimbusJwtDecoder decoder) {
        this.clientId = clientId;
        this.decoder = decoder;
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), jwt -> {
            String issuer = jwt.getClaimAsString("iss");
            boolean valid = ("https://accounts.google.com".equals(issuer) || "accounts.google.com".equals(issuer))
                    && jwt.getAudience().contains(clientId) && jwt.getExpiresAt() != null
                    && jwt.getSubject() != null && !jwt.getSubject().isBlank()
                    && Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))
                    && jwt.getClaimAsString("email") != null;
            return valid ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
        }));
    }

    public Jwt verify(String credential) {
        if (clientId.isBlank()) throw new IllegalArgumentException("O login com Google está indisponível no momento.");
        try { return decoder.decode(credential); }
        catch (JwtException exception) { throw new IllegalArgumentException("Não foi possível validar sua conta Google. Tente novamente."); }
    }
}
