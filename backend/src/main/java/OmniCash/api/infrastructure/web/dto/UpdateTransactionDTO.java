package OmniCash.api.infrastructure.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateTransactionDTO(
        @jakarta.validation.constraints.Size(max = 255)
        @jakarta.validation.constraints.Pattern(regexp = "(?s).*\\S.*", message = "A descrição não pode ficar em branco") String description,
        @jakarta.validation.constraints.DecimalMin("0.01")
        @jakarta.validation.constraints.Digits(integer = 12, fraction = 2) BigDecimal amount,
        @jakarta.validation.constraints.Pattern(regexp = "INCOME|EXPENSE") String type,
        LocalDate date
) {}
