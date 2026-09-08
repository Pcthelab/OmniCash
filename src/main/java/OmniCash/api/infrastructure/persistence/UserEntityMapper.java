package OmniCash.api.infrastructure.persistence;

import OmniCash.api.domain.model.User;

public class UserEntityMapper {

    public User toDomain(UserEntity entity) {
        if (entity == null) return null;
        return new User(entity.getId(), entity.getName(), entity.getEmail(), entity.getPassword());
    }

    public UserEntity toEntity(User user) {
        if (user == null) return null;
        return new UserEntity(user.getId(), user.getName(), user.getEmail(), user.getPassword());
    }
}