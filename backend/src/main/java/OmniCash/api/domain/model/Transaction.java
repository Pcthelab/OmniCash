package OmniCash.api.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Transaction {

    private Long id;

    private String description;
    private BigDecimal amount;

    private TransactionType type;

    private LocalDate date;
    private Long userId;

    private Category category;
}
