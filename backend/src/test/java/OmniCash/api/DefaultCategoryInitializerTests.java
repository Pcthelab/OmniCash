package OmniCash.api;

import OmniCash.api.infrastructure.persistence.DefaultCategoryInitializer;
import OmniCash.api.infrastructure.persistence.entity.CategoryEntity;
import OmniCash.api.infrastructure.persistence.repository.SpringDataCategoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DefaultCategoryInitializerTests {
    @Autowired DefaultCategoryInitializer initializer;
    @Autowired SpringDataCategoryRepository repository;

    @Test
    void initializesBothTypesWithoutDuplicatesOrOverwritingExistingCategories() {
        repository.deleteAll();
        repository.flush();
        var existing = repository.save(new CategoryEntity(null, "Salário", "INCOME"));
        initializer.run(null);
        initializer.run(null);
        assertThat(repository.count()).isEqualTo(13);
        assertThat(repository.findById(existing.getId())).isPresent();
        assertThat(repository.findAll()).extracting(CategoryEntity::getType).contains("INCOME", "EXPENSE");
    }
}
