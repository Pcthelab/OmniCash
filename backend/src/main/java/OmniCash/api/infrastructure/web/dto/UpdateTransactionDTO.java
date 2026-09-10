package OmniCash.api.infrastructure.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateTransactionDTO(
        String description,
        BigDecimal amount,
        String type,
        LocalDate date
) {}