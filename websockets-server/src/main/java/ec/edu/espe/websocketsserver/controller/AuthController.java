package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.dto.LoginRequestDTO;
import ec.edu.espe.websocketsserver.dto.LoginResponseDTO;
import ec.edu.espe.websocketsserver.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }
    
    @GetMapping("/test-token")
    public ResponseEntity<Map<String, Object>> testToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Autenticación exitosa");
        response.put("usuario", auth.getName());
        response.put("roles", auth.getAuthorities());
        return ResponseEntity.ok(response);
    }
} 