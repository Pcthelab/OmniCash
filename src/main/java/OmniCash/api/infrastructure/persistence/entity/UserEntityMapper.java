package OmniCash.api.infrastructure.persistence.entity;

import OmniCash.api.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserEntityMapper {

    public User toDomain(UserEntity entity) {
        if (entity == null) return null;
        return new User(entity.getId(), entity.getName(), entity.getEmail(), entity.getPassword());
    }

    public UserEntity toEntity(User domain) {
        if (domain == null) return null;
        return new UserEntity(domain.getId(), domain.getName(), domain.getEmail(), domain.getPassword());
    }
}