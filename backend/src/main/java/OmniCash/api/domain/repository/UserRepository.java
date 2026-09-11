package OmniCash.api.domain.repository;

import OmniCash.api.domain.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    List<User> findAll();
    User save(User user);
    User updateName(Long id, String name);
    Optional<User> findByEmail(String email);
    void delete(User user); // ou void deleteById(Long id);
}
