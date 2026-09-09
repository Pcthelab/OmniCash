package OmniCash.api.application.usecase;

import OmniCash.api.domain.model.Transaction;
import OmniCash.api.domain.model.TransactionType;
import OmniCash.api.domain.model.User;
import OmniCash.api.domain.repository.TransactionRepository;
import OmniCash.api.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class CreateTransactionUseCase {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public CreateTransactionUseCase(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public Transaction execute(String userEmail, String description, BigDecimal amount, TransactionType type, LocalDate date) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Transaction transaction = new Transaction(
                null, // ID gerado pelo banco
                description,
                amount,
                type,
                date,
                user.getId() // Amarrado automaticamente ao ID do usuário logado
        );

        return transactionRepository.save(transaction);
    }
}