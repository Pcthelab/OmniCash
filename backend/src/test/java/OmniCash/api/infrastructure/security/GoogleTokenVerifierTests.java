package OmniCash.api.infrastructure.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.*;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import java.security.*;
import java.security.interfaces.*;
import java.time.Instant;
import java.util.Date;
import static org.assertj.core.api.Assertions.*;

class GoogleTokenVerifierTests {
    @Test void verifiesSignatureAndRejectsWrongIssuerAudienceExpiryAndUnverifiedEmail() throws Exception {
        var generator = KeyPairGenerator.getInstance("RSA"); generator.initialize(2048);
        var key = generator.generateKeyPair();
        var verifier = new GoogleTokenVerifier("our-client", NimbusJwtDecoder.withPublicKey((RSAPublicKey) key.getPublic()).build());
        assertThat(verifier.verify(sign(key, "accounts.google.com", "our-client", true, 300)).getSubject()).isEqualTo("google-sub");
        for (String invalid : new String[] {
                sign(key, "https://attacker.test", "our-client", true, 300),
                sign(key, "accounts.google.com", "other-client", true, 300),
                sign(key, "accounts.google.com", "our-client", false, 300),
                sign(key, "accounts.google.com", "our-client", true, -300),
                sign(generator.generateKeyPair(), "accounts.google.com", "our-client", true, 300) }) {
            assertThatThrownBy(() -> verifier.verify(invalid)).isInstanceOf(IllegalArgumentException.class);
        }
    }

    private String sign(KeyPair key, String issuer, String audience, boolean verified, long seconds) throws Exception {
        var claims = new JWTClaimsSet.Builder().subject("google-sub").issuer(issuer).audience(audience)
                .issueTime(Date.from(Instant.now().minusSeconds(600)))
                .expirationTime(Date.from(Instant.now().plusSeconds(seconds)))
                .claim("email", "person@example.test").claim("email_verified", verified).build();
        var token = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claims);
        token.sign(new RSASSASigner((RSAPrivateKey) key.getPrivate()));
        return token.serialize();
    }
}
