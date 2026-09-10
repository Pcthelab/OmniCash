package OmniCash.api.domain.gateway;

import OmniCash.api.domain.model.Category;
import java.util.List;
import java.util.Optional;

public interface CategoryRepositoryGateway {
    Category save(Category category);
    List<Category> findAll();
    Optional<Category> findById(Long id);
    void deleteById(Long id);
}