package OmniCash.api.infrastructure.persistence.entity;

import OmniCash.api.domain.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryEntityMapper {

    public Category toDomain(CategoryEntity entity) {
        if (entity == null) return null;
        return new Category(entity.getId(), entity.getName(), entity.getType());
    }

    public CategoryEntity toEntity(Category domain) {
        if (domain == null) return null;
        return new CategoryEntity(domain.getId(), domain.getName(), domain.getType());
    }
}