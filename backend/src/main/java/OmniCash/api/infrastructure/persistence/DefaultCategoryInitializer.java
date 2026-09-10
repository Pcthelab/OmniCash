package OmniCash.api.infrastructure.persistence;

import OmniCash.api.infrastructure.persistence.entity.CategoryEntity;
import OmniCash.api.infrastructure.persistence.repository.SpringDataCategoryRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

/** Catálogo inicial compartilhado; preserva categorias já cadastradas. */
@Component
public class DefaultCategoryInitializer implements ApplicationRunner {
    private final SpringDataCategoryRepository repository;

    public DefaultCategoryInitializer(SpringDataCategoryRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var names = new HashSet<String>();
        repository.findAll().forEach(category -> names.add(category.getName()));
        for (String name : List.of("Salário", "Freelance", "Investimentos", "Outras receitas")) {
            if (names.add(name)) repository.save(new CategoryEntity(null, name, "INCOME"));
        }
        for (String name : List.of("Alimentação", "Moradia", "Transporte", "Saúde", "Educação", "Lazer", "Assinaturas", "Compras", "Outras despesas")) {
            if (names.add(name)) repository.save(new CategoryEntity(null, name, "EXPENSE"));
        }
    }
}
