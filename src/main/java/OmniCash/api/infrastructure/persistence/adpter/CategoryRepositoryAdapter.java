package OmniCash.api.infrastructure.persistence.adpter;

import OmniCash.api.domain.gateway.CategoryRepositoryGateway;
import OmniCash.api.domain.model.Category;
import OmniCash.api.infrastructure.persistence.entity.CategoryEntityMapper;
import OmniCash.api.infrastructure.persistence.repository.SpringDataCategoryRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class CategoryRepositoryAdapter implements CategoryRepositoryGateway {

    private final SpringDataCategoryRepository springDataCategoryRepository;
    private final CategoryEntityMapper mapper;

    public CategoryRepositoryAdapter(SpringDataCategoryRepository springDataCategoryRepository, CategoryEntityMapper mapper) {
        this.springDataCategoryRepository = springDataCategoryRepository;
        this.mapper = mapper;
    }

    @Override
    public Category save(Category category) {
        var entity = mapper.toEntity(category);
        var savedEntity = springDataCategoryRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public List<Category> findAll() {
        return springDataCategoryRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Category> findById(Long id) {
        return springDataCategoryRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public void deleteById(Long id) {
        springDataCategoryRepository.deleteById(id);
    }
}