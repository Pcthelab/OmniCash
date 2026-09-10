package OmniCash.api.application.usecase;

import OmniCash.api.domain.gateway.CategoryRepositoryGateway;
import OmniCash.api.domain.model.Category;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ListCategoriesUseCase {

    private final CategoryRepositoryGateway gateway;

    public ListCategoriesUseCase(CategoryRepositoryGateway gateway) {
        this.gateway = gateway;
    }

    public List<Category> execute() {
        return gateway.findAll();
    }
}