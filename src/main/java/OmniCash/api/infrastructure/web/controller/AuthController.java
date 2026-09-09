package OmniCash.api.infrastructure.web.controller;

import OmniCash.api.application.usecase.RegisterUserUseCase;
import OmniCash.api.domain.model.User;
import OmniCash.api.infrastructure.security.JwtService;
import OmniCash.api.infrastructure.web.dto.AuthResponseDTO;
import OmniCash.api.infrastructure.web.dto.LoginRequestDTO;
import OmniCash.api.infrastructure.web.dto.RegisterRequestDTO;
import OmniCash.api.infrastructure.web.dto.UserResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/OmniCash")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(RegisterUserUseCase registerUserUseCase,
                          AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.registerUserUseCase = registerUserUseCase;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UserResponseDTO> register(@RequestBody @Valid RegisterRequestDTO request) {
        User registeredUser = registerUserUseCase.execute(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );

        UserResponseDTO responseDTO = new UserResponseDTO(
                registeredUser.getId(),
                registeredUser.getName(),
                registeredUser.getEmail()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody @Valid LoginRequestDTO request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponseDTO(token));
    }
}