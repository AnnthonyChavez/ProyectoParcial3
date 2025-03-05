package ec.edu.espe.websocketsserver.config;

import ec.edu.espe.websocketsserver.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class JwtWebSocketInterceptor implements HandshakeInterceptor {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";
    private static final String TOKEN_PARAM = "token";
    private static final List<String> ALLOWED_ROLES = Arrays.asList("COMPRADOR", "VENDEDOR", "ADMIN");
    private final AuthService authService;

    public JwtWebSocketInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            System.out.println("Iniciando handshake WebSocket...");
            System.out.println("Headers recibidos: " + request.getHeaders());
            System.out.println("URL recibida: " + request.getURI());
            
            String token = getJwtToken(request);
            if (token != null) {
                System.out.println("Token JWT encontrado");
                Claims claims = validateJwt(token);
                if (claims != null && claims.get("role") != null) {
                    String role = claims.get("role", String.class);
                    System.out.println("Role encontrado en token: " + role);
                    if (ALLOWED_ROLES.contains(role)) {
                        System.out.println("Role válido, permitiendo conexión");
                        attributes.put("username", claims.getSubject());
                        attributes.put("role", role);
                        return true;
                    }
                    System.out.println("Role no permitido: " + role);
                } else {
                    System.out.println("Claims nulos o role no encontrado en token");
                }
            } else {
                System.out.println("No se encontró token JWT en headers ni en URL");
            }
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        } catch (Exception e) {
            System.out.println("Error durante el handshake: " + e.getMessage());
            e.printStackTrace();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            System.out.println("Error después del handshake: " + exception.getMessage());
        }
    }

    private String getJwtToken(ServerHttpRequest request) {
        // Primero intentamos obtener el token del header
        String authenticationHeader = request.getHeaders().getFirst(HEADER);
        if (authenticationHeader != null && authenticationHeader.startsWith(PREFIX)) {
            System.out.println("Token encontrado en header");
            return authenticationHeader.replace(PREFIX, "");
        }
        
        // Si no está en el header, intentamos obtenerlo de los parámetros de la URL
        String tokenParam = UriComponentsBuilder.fromUri(request.getURI())
                .build()
                .getQueryParams()
                .getFirst(TOKEN_PARAM);
                
        if (tokenParam != null && !tokenParam.isEmpty()) {
            System.out.println("Token encontrado en parámetro URL");
            return tokenParam;
        }
        
        return null;
    }

    private Claims validateJwt(String jwtToken) {
        try {
            System.out.println("Intentando validar token: " + jwtToken.substring(0, Math.min(20, jwtToken.length())) + "...");
            Claims claims = Jwts.parser()
                    .verifyWith(AuthService.getSecretKey())
                    .build()
                    .parseSignedClaims(jwtToken)
                    .getPayload();
            System.out.println("Token validado exitosamente");
            return claims;
        } catch (Exception e) {
            System.out.println("Error validando token: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}