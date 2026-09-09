package OmniCash.api.infrastructure.persistence.repository;

import OmniCash.api.infrastructure.persistence.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface SpringTransactionRepository extends JpaRepository<TransactionEntity, Long> {

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM TransactionEntity t WHERE t.user.id = :userId AND t.type = 'INCOME'")
    BigDecimal sumIncomesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM TransactionEntity t WHERE t.user.id = :userId AND t.type = 'EXPENSE'")
    BigDecimal sumExpensesByUserId(@Param("userId") Long userId);
}