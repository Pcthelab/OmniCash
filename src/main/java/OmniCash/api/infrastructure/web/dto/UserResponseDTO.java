package OmniCash.api.infrastructure.web.dto;

import OmniCash.api.domain.model.User;

public class UserResponseDTO {

    private Long id; // ou String, dependendo do tipo do ID do seu User
    private String name;
    private String email;

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}