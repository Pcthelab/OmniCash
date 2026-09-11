package OmniCash.api.infrastructure.persistence.repository;

import OmniCash.api.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SpringDataUserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from UserEntity u where u.id = :id")
    Optional<UserEntity> findLockedById(@org.springframework.data.repository.query.Param("id") Long id);
}
