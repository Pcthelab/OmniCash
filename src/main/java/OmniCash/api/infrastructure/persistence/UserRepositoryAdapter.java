package OmniCash.api.infrastructure.persistence;

import OmniCash.api.domain.model.User;
import OmniCash.api.domain.repository.UserRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class UserRepositoryAdapter implements UserRepository {

    private final SpringDataUserRepository springDataUserRepository;
    private final UserEntityMapper userEntityMapper = new UserEntityMapper();

    public UserRepositoryAdapter(SpringDataUserRepository springDataUserRepository) {
        this.springDataUserRepository = springDataUserRepository;
    }

    @Override
    public User save(User user) {
        UserEntity entity = new UserEntity(user.getId(), user.getName(), user.getEmail(), user.getPassword());
        UserEntity saved = springDataUserRepository.save(entity);
        return userEntityMapper.toDomain(saved);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return springDataUserRepository.findByEmail(email)
                .map(userEntityMapper::toDomain);
    }

    @Override
    public List<User> findAll() {
        return springDataUserRepository.findAll().stream()
                .map(userEntityMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(User user) {
        springDataUserRepository.deleteById(user.getId());
    }
}