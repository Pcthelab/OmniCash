package OmniCash.api.infrastructure.web.exception;
import OmniCash.api.domain.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<StandardError> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        StandardError err = new StandardError();
        err.setTimestamp(Instant.now());
        err.setStatus(status.value());
        err.setError("Erro interno");
        err.setMessage("Não foi possível concluir a operação. Tente novamente em instantes.");
        err.setPath(request.getRequestURI());
        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler({IllegalArgumentException.class, OmniCash.api.domain.exception.EmailAlreadyExistsException.class})
    public ResponseEntity<StandardError> handleBusinessException(RuntimeException e, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, e.getMessage(), request);
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<StandardError> handleAuthenticationException(RuntimeException e, HttpServletRequest request) {
        return error(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos.", request);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<StandardError> handleConflict(RuntimeException e, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, "Não foi possível salvar: os dados já existem ou estão em uso. Atualize e tente novamente.", request);
    }

    private ResponseEntity<StandardError> error(HttpStatus status, String message, HttpServletRequest request) {
        StandardError err = new StandardError();
        err.setTimestamp(Instant.now()); err.setStatus(status.value()); err.setError(status.getReasonPhrase());
        err.setMessage(message); err.setPath(request.getRequestURI());
        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<StandardError> handleValidationException(MethodArgumentNotValidException e, HttpServletRequest request) {
        HttpStatus status = HttpStatus.UNPROCESSABLE_CONTENT; // Substituído aqui para evitar o aviso de deprecated
        StandardError err = new StandardError();
        err.setTimestamp(Instant.now());
        err.setStatus(status.value());
        err.setError("Erro de Validação");

        // Pega a primeira mensagem de erro de validação do campo
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .findFirst()
                .orElse("Dados inválidos");

        err.setMessage(message);
        err.setPath(request.getRequestURI());
        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<StandardError> handleResourceNotFound(ResourceNotFoundException e, HttpServletRequest request) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        StandardError err = new StandardError();
        err.setTimestamp(Instant.now());
        err.setStatus(status.value());
        err.setError("Recurso não encontrado");
        err.setMessage(e.getMessage());
        err.setPath(request.getRequestURI());
        return ResponseEntity.status(status).body(err);
    }
}
