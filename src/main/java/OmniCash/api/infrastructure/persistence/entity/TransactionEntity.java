package OmniCash.api.infrastructure.persistence.entity;

import OmniCash.api.domain.model.Category;
import OmniCash.api.domain.model.Transaction;
import OmniCash.api.domain.model.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryEntity category;

    public TransactionEntity(Transaction domain) {
        this.id = domain.getId();
        this.description = domain.getDescription();
        this.amount = domain.getAmount();
        this.type = domain.getType();
        this.date = domain.getDate();
        this.userId = domain.getUserId();
        if (domain.getCategory() != null) {
            this.category = new CategoryEntity(
                    domain.getCategory().getId(),
                    domain.getCategory().getName(),
                    domain.getCategory().getType()
            );
        }
    }

    public Transaction toDomain() {
        Category categoryDomain = null;
        if (this.category != null) {
            categoryDomain = new Category(
                    this.category.getId(),
                    this.category.getName(),
                    this.category.getType()
            );
        }

        return new Transaction(
                this.id,
                this.description,
                this.amount,
                this.type,
                this.date,
                this.userId,
                categoryDomain
        );
    }
}