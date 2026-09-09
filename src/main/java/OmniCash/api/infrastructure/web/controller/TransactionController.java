package OmniCash.api.infrastructure.web.controller;

import OmniCash.api.application.usecase.CreateTransactionUseCase;
import OmniCash.api.application.usecase.GetBalanceUseCase;
import OmniCash.api.application.usecase.UpdateTransactionUseCase;
import OmniCash.api.domain.model.BalanceSummary;
import OmniCash.api.domain.model.Transaction;
import OmniCash.api.domain.repository.TransactionRepository;
import OmniCash.api.domain.repository.UserRepository;
import OmniCash.api.infrastructure.web.dto.BalanceResponseDTO;
import OmniCash.api.infrastructure.web.dto.TransactionRequestDTO;
import OmniCash.api.infrastructure.web.dto.TransactionResponseDTO;
import OmniCash.api.domain.model.User;
import OmniCash.api.infrastructure.web.dto.UpdateTransactionDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/lancamento")
public class TransactionController {

    private final GetBalanceUseCase getBalanceUseCase;
    private final CreateTransactionUseCase createTransactionUseCase;
    private final UpdateTransactionUseCase updateTransactionUseCase;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionController(GetBalanceUseCase getBalanceUseCase, CreateTransactionUseCase createTransactionUseCase,
                                 UpdateTransactionUseCase updateTransactionUseCase,
                                 TransactionRepository transactionRepository,
                                 UserRepository userRepository) {
        this.getBalanceUseCase = getBalanceUseCase;
        this.createTransactionUseCase = createTransactionUseCase;
        this.updateTransactionUseCase = updateTransactionUseCase;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    // 1. CADASTRAR LANÇAMENTO
    @PostMapping
    public ResponseEntity<TransactionResponseDTO> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid TransactionRequestDTO request
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Transaction transaction = createTransactionUseCase.execute(
                userDetails.getUsername(),
                request.getDescription(),
                request.getAmount(),
                request.getType(),
                request.getDate()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(new TransactionResponseDTO(transaction));
    }

    // 2. LISTAR LANÇAMENTOS DO USUÁRIO LOGADO
    @GetMapping
    public ResponseEntity<List<TransactionResponseDTO>> listAll(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<TransactionResponseDTO> transactions = transactionRepository.findByUserId(user.getId())
                .stream()
                .map(TransactionResponseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/balance")
    public ResponseEntity<BalanceResponseDTO> getBalance(Authentication authentication) {
        User authenticatedUser = (User) authentication.getPrincipal();

        BalanceSummary summary = getBalanceUseCase.execute(authenticatedUser.getId());

        BalanceResponseDTO response = new BalanceResponseDTO(
                summary.getTotalIncome(),
                summary.getTotalExpense(),
                summary.getBalance()
        );

        return ResponseEntity.ok(response);
    }

    // 3. ATUALIZAÇÃO PARCIAL (PATCH)
    @PatchMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> patchTransaction(
            @PathVariable Long id,
            @RequestBody UpdateTransactionDTO dto,
            Principal principal) {

        Transaction updated = updateTransactionUseCase.execute(id, principal.getName(), dto);
        return ResponseEntity.ok(new TransactionResponseDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Lançamento não encontrado ou não pertence ao usuário"));

        transactionRepository.delete(transaction);

        return ResponseEntity.noContent().build();
    }
}