package OmniCash.api.infrastructure.web.controller;

import OmniCash.api.infrastructure.security.GoogleLoginService;
import OmniCash.api.infrastructure.web.dto.AuthResponseDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/OmniCash")
public class GoogleLoginController {
    private final GoogleLoginService google;
    public GoogleLoginController(GoogleLoginService google) { this.google = google; }
    public record GoogleRequest(@NotBlank @Size(max = 8192) String credential) {}
    @PostMapping("/google")
    public AuthResponseDTO login(@RequestBody @Valid GoogleRequest body) {
        return new AuthResponseDTO(google.login(body.credential()));
    }
}
