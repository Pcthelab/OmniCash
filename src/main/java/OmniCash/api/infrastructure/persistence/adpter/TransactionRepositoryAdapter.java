package OmniCash.api.infrastructure.persistence.adpter;

import OmniCash.api.domain.gateway.TransactionRepositoryGateway;
import OmniCash.api.domain.model.Transaction;
import OmniCash.api.infrastructure.persistence.entity.TransactionEntity;
import OmniCash.api.infrastructure.persistence.repository.SpringDataTransactionRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class TransactionRepositoryAdapter implements TransactionRepositoryGateway {

    private final SpringDataTransactionRepository repository;

    public TransactionRepositoryAdapter(SpringDataTransactionRepository repository) {
        this.repository = repository;
    }

    @Override
    public Transaction save(Transaction transaction) {
        TransactionEntity entity = new TransactionEntity(transaction);
        TransactionEntity savedEntity = repository.save(entity);
        return savedEntity.toDomain();
    }

    @Override
    public List<Transaction> findByUserId(Long userId) {
        return repository.findByUserId(userId).stream()
                .map(TransactionEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Transaction> findByIdAndUserId(Long id, Long userId) {
        return repository.findByIdAndUserId(id, userId)
                .map(TransactionEntity::toDomain);
    }

    @Override
    public void delete(Transaction transaction) {
        repository.deleteById(transaction.getId());
    }

    @Override
    public BigDecimal sumIncomesByUserId(Long userId) {
        return repository.sumIncomesByUserId(userId);
    }

    @Override
    public BigDecimal sumExpensesByUserId(Long userId) {
        return repository.sumExpensesByUserId(userId);
    }
}