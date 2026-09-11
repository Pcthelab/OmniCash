package OmniCash.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AuthHttpTests {
    @Autowired MockMvc mvc;

    @Test void registerAndLoginIssueTokenAfterAuthenticationErasesCredentials() throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        mvc.perform(post("/OmniCash/cadastro").contentType("application/json")
                .content("{\"name\":\"Teste\",\"email\":\"" + email + "\",\"password\":\"SenhaForte123\"}"))
                .andExpect(status().isCreated());
        mvc.perform(post("/OmniCash/login").contentType("application/json")
                .content("{\"email\":\"" + email + "\",\"password\":\"errada\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/OmniCash/login").contentType("application/json")
                .content("{\"email\":\"" + email + "\",\"password\":\"SenhaForte123\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test void publicEndpointsRejectWeakPasswordsAndInvalidTokens() throws Exception {
        mvc.perform(post("/OmniCash/cadastro").contentType("application/json")
                .content("{\"name\":\"Teste\",\"email\":\"weak@example.test\",\"password\":\"abc\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/OmniCash/redefinir-senha").contentType("application/json")
                .content("{\"token\":\"invalid\",\"password\":\"SenhaForte123\"}"))
                .andExpect(status().isUnprocessableContent());
        mvc.perform(get("/OmniCash/auth-options"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.passwordRecovery").value(false));
    }
}
