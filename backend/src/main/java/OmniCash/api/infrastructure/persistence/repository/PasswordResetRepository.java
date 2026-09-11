package OmniCash.api.infrastructure.persistence.repository;

import OmniCash.api.infrastructure.persistence.entity.PasswordResetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordResetEntity, Long> {
    Optional<PasswordResetEntity> findByTokenHash(String tokenHash);
}
