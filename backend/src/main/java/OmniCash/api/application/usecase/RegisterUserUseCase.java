package OmniCash.api.application.usecase;

import OmniCash.api.domain.exception.EmailAlreadyExistsException;
import OmniCash.api.domain.model.User;
import OmniCash.api.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterUserUseCase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User execute(String name, String email, String password) {
        OmniCash.api.infrastructure.security.PasswordPolicy.validate(password);
        if (userRepository.findByEmail(email).isPresent()) {
            throw new EmailAlreadyExistsException("E-mail já cadastrado!");
        }

        String encodedPassword = passwordEncoder.encode(password);
        User newUser = new User(null, name, email, encodedPassword);
        return userRepository.save(newUser);
    }
}
