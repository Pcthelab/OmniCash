package OmniCash.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.mock.web.MockHttpServletRequest;

@SpringBootTest
@ActiveProfiles("test")
class CorsConfigTests {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void allowsNetlifyOriginAndRequiredHttpMethods() {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/OmniCash/login");
        CorsConfiguration configuration = corsConfigurationSource.getCorsConfiguration(request);

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins()).contains("https://omnicash.netlify.app");
        assertThat(configuration.getAllowedMethods()).contains("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        assertThat(configuration.getAllowedHeaders()).contains("Authorization", "Content-Type", "Accept");
    }
}
