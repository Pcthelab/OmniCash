package OmniCash.api.infrastructure.web.controller;

import OmniCash.api.infrastructure.security.PasswordRecoveryService;
import OmniCash.api.infrastructure.security.RecoveryMailer;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/OmniCash")
public class PasswordRecoveryController {
    private final PasswordRecoveryService recovery;
    private final RecoveryMailer mailer;
    private final String googleClientId;

    public PasswordRecoveryController(PasswordRecoveryService recovery, RecoveryMailer mailer,
            @org.springframework.beans.factory.annotation.Value("${api.google.client-id:}") String googleClientId) {
        this.recovery = recovery; this.mailer = mailer; this.googleClientId = googleClientId;
    }

    @GetMapping("/auth-options")
    public Map<String, Object> options() {
        return Map.of("passwordRecovery", mailer.enabled(), "googleClientId", googleClientId);
    }

    public record ForgotRequest(@NotBlank @Email @Size(max = 255) String email) {}
    public record ResetRequest(@NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{43}") String token,
                               @NotBlank @Size(max = 72) String password) {}

    @PostMapping("/esqueci-senha")
    public Map<String, String> forgot(@RequestBody @Valid ForgotRequest body) {
        recovery.request(body.email());
        return Map.of("message", "Se houver uma conta com esse e-mail, enviaremos um link para redefinir sua senha. Confira também o spam.");
    }

    @PostMapping("/redefinir-senha")
    public Map<String, String> reset(@RequestBody @Valid ResetRequest body) {
        recovery.reset(body.token(), body.password());
        return Map.of("message", "Senha atualizada! Entre com sua nova senha.");
    }
}
