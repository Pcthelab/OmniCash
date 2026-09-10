package OmniCash.api.application.usecase;

import OmniCash.api.domain.exception.ResourceNotFoundException;
import OmniCash.api.domain.gateway.CategoryRepositoryGateway;
import OmniCash.api.domain.gateway.TransactionRepositoryGateway;
import OmniCash.api.domain.model.Category;
import OmniCash.api.domain.model.Transaction;
import OmniCash.api.domain.model.TransactionType;
import OmniCash.api.domain.model.User;
import OmniCash.api.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class CreateTransactionUseCase {

    private final TransactionRepositoryGateway transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepositoryGateway categoryRepository;

    public CreateTransactionUseCase(
            TransactionRepositoryGateway transactionRepository,
            UserRepository userRepository,
            CategoryRepositoryGateway categoryRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public Transaction execute(
            String userEmail,
            String description,
            BigDecimal amount,
            TransactionType type,
            LocalDate date,
            Long categoryId
    ) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        Transaction transaction = new Transaction(
                null,
                description,
                amount,
                type,
                date,
                user.getId(),
                category
        );

        return transactionRepository.save(transaction);
    }
}