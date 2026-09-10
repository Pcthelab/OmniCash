package OmniCash.api.domain.exception; // Ou infrastructure/web/exception

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}