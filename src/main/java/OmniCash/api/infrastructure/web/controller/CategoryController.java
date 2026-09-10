package OmniCash.api.infrastructure.web.controller;

import OmniCash.api.application.usecase.ListCategoriesUseCase;
import OmniCash.api.domain.model.Category;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final ListCategoriesUseCase listCategoriesUseCase;

    public CategoryController(ListCategoriesUseCase listCategoriesUseCase) {
        this.listCategoriesUseCase = listCategoriesUseCase;
    }

    @GetMapping
    public ResponseEntity<List<Category>> listCategories() {
        List<Category> categories = listCategoriesUseCase.execute();
        return ResponseEntity.ok(categories);
    }
}