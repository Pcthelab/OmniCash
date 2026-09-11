package OmniCash.api.infrastructure.persistence.repository;

import OmniCash.api.infrastructure.persistence.entity.GoogleIdentityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoogleIdentityRepository extends JpaRepository<GoogleIdentityEntity, String> {}
