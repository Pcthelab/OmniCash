package OmniCash.api.application.usecase;

import OmniCash.api.domain.model.Transaction;
import OmniCash.api.domain.model.TransactionType;
import OmniCash.api.domain.repository.TransactionRepository;
import OmniCash.api.domain.repository.UserRepository;
import OmniCash.api.infrastructure.web.dto.UpdateTransactionDTO;
import org.springframework.stereotype.Service;

@Service
public class UpdateTransactionUseCase {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public UpdateTransactionUseCase(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public Transaction execute(Long id, String userEmail, UpdateTransactionDTO dto) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (dto.description() != null) {
            transaction.setDescription(dto.description());
        }
        if (dto.amount() != null) {
            transaction.setAmount(dto.amount());
        }
        if (dto.type() != null) {
            transaction.setType(TransactionType.valueOf(dto.type()));
        }
        if (dto.date() != null) {
            transaction.setDate(dto.date());
        }

        return transactionRepository.save(transaction);
    }
}