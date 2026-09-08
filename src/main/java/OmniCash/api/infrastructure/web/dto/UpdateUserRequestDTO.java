package OmniCash.api.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateUserRequestDTO {

    @NotBlank
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}