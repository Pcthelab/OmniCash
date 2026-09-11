package OmniCash.api.infrastructure.security;

import java.nio.charset.StandardCharsets;

public final class PasswordPolicy {
    public static final String MESSAGE = "Use pelo menos 10 caracteres, com letra maiúscula, minúscula e número (máximo de 72 bytes).";

    private PasswordPolicy() {}

    public static void validate(String password) {
        if (password == null || password.codePointCount(0, password.length()) < 10
                || password.getBytes(StandardCharsets.UTF_8).length > 72
                || !password.matches("(?s).*[A-Z].*")
                || !password.matches("(?s).*[a-z].*")
                || !password.matches("(?s).*[0-9].*")) {
            throw new IllegalArgumentException(MESSAGE);
        }
    }
}
