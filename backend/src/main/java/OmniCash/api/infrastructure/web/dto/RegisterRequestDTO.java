package OmniCash.api.infrastructure.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDTO {

    @NotBlank(message = "O nome é obrigatório")
    @jakarta.validation.constraints.Size(max = 100)
    private String name;

    @Email(message = "E-mail inválido")
    @NotBlank(message = "O e-mail é obrigatório")
    @jakarta.validation.constraints.Size(max = 255)
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    private String password;
}
