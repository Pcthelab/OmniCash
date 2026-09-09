package OmniCash.api.infrastructure.persistence.entity;

import OmniCash.api.domain.model.TransactionType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Construtores
    public TransactionEntity() {}

    public TransactionEntity(OmniCash.api.domain.model.Transaction domain) {
        this.id = domain.getId();
        this.description = domain.getDescription();
        this.amount = domain.getAmount();
        this.type = domain.getType();
        this.date = domain.getDate();
        this.userId = domain.getUserId();
    }

    // Método para converter de volta para o modelo de Domínio
    public OmniCash.api.domain.model.Transaction toDomain() {
        return new OmniCash.api.domain.model.Transaction(
                this.id,
                this.description,
                this.amount,
                this.type,
                this.date,
                this.userId
        );
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}