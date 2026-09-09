package OmniCash.api.infrastructure.web.dto;

import OmniCash.api.domain.model.Transaction;
import OmniCash.api.domain.model.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionResponseDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDate date;

    public TransactionResponseDTO(Transaction transaction) {
        this.id = transaction.getId();
        this.description = transaction.getDescription();
        this.amount = transaction.getAmount();
        this.type = transaction.getType();
        this.date = transaction.getDate();
    }

    // Getters
    public Long getId() { return id; }
    public String getDescription() { return description; }
    public BigDecimal amount() { return amount; }
    public TransactionType getType() { return type; }
    public LocalDate getDate() { return date; }
}