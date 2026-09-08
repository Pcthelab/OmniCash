package OmniCash.api.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class User {

    private Long id;
    private String name;
    private String email;
    private String password;
}