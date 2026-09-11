package OmniCash.api.infrastructure.web.dto;

import OmniCash.api.domain.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequestDTO {

    @NotBlank(message = "A descrição é obrigatória")
    @jakarta.validation.constraints.Size(max = 255)
    private String description;

    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    @jakarta.validation.constraints.Digits(integer = 12, fraction = 2)
    private BigDecimal amount;

    @NotNull(message = "O tipo da transação é obrigatório (INCOME ou EXPENSE)")
    private TransactionType type;

    @NotNull(message = "A data é obrigatória")
    private LocalDate date;

    @NotNull(message = "A categoria é obrigatória")
    private Long categoryId;
}
