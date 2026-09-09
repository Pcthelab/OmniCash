package OmniCash.api.infrastructure.persistence.adpter;

import OmniCash.api.domain.model.User;
import OmniCash.api.infrastructure.persistence.repository.SpringDataUserRepository;
import OmniCash.api.domain.repository.UserRepository;
import OmniCash.api.infrastructure.persistence.entity.UserEntity;
import OmniCash.api.infrastructure.persistence.entity.UserEntityMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class UserRepositoryAdapter implements UserRepository {

    private final SpringDataUserRepository springDataUserRepository;
    private final UserEntityMapper mapper;

    public UserRepositoryAdapter(SpringDataUserRepository springDataUserRepository, UserEntityMapper mapper) {
        this.springDataUserRepository = springDataUserRepository;
        this.mapper = mapper;
    }

    @Override
    public List<User> findAll() {
        return springDataUserRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public User save(User user) {
        UserEntity entity = mapper.toEntity(user);
        UserEntity savedEntity = springDataUserRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return springDataUserRepository.findByEmail(email)
                .map(mapper::toDomain);
    }

    @Override
    public void delete(User user) {
        springDataUserRepository.delete(mapper.toEntity(user));
    }
}