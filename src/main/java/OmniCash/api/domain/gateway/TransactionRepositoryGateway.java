package OmniCash.api.domain.gateway;

import OmniCash.api.domain.model.Transaction;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TransactionRepositoryGateway {
    Transaction save(Transaction transaction);
    List<Transaction> findByUserId(Long userId);
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);
    void delete(Transaction transaction);
    BigDecimal sumIncomesByUserId(Long userId);
    BigDecimal sumExpensesByUserId(Long userId);
}