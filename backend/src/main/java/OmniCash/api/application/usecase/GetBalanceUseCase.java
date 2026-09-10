package OmniCash.api.application.usecase;

import OmniCash.api.domain.gateway.TransactionRepositoryGateway;
import OmniCash.api.domain.model.BalanceSummary;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class GetBalanceUseCase {

    private final TransactionRepositoryGateway transactionRepository;

    public GetBalanceUseCase(TransactionRepositoryGateway transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public BalanceSummary execute(Long userId) {
        BigDecimal totalIncome = transactionRepository.sumIncomesByUserId(userId);
        BigDecimal totalExpense = transactionRepository.sumExpensesByUserId(userId);
        BigDecimal balance = totalIncome.subtract(totalExpense);

        return new BalanceSummary(totalIncome, totalExpense, balance);
    }
}