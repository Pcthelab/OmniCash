package OmniCash.api.infrastructure.web.dto;

import OmniCash.api.domain.model.Transaction;
import OmniCash.api.domain.model.TransactionType;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class TransactionResponseDTO {
    private final Long id;
    private final String description;
    private final BigDecimal amount;
    private final TransactionType type;
    private final LocalDate date;
    private final Long categoryId;
    private final String categoryName;

    public TransactionResponseDTO(Transaction transaction) {
        this.id = transaction.getId();
        this.description = transaction.getDescription();
        this.amount = transaction.getAmount();
        this.type = transaction.getType();
        this.date = transaction.getDate();
        if (transaction.getCategory() != null) {
            this.categoryId = transaction.getCategory().getId();
            this.categoryName = transaction.getCategory().getName();
        } else {
            this.categoryId = null;
            this.categoryName = null;
        }
    }
}