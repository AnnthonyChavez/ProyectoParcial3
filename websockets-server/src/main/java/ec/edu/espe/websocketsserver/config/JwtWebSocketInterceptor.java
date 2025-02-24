package ec.edu.espe.websocketsserver.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.util.Map;

@Component
public class JwtWebSocketInterceptor implements HandshakeInterceptor {

    private static final String HEADER = "Authorization";

    private static final String PREFIX = "Bearer ";

    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (checkJwtToken(request)){
            Claims claims = validateJwt(request);
            if (claims.get("authority") != null && claims.get("authority").equals("ROLE+CLIENT")) {
                attributes.put("username", claims.getSubject());
                return true;
            }
        }
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return false;
    }

    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, @Nullable Exception exception) {

    }

    private boolean checkJwtToken(ServerHttpRequest request) {
        String authenticationHeader = request.getHeaders().getFirst(HEADER);
        return authenticationHeader != null && authenticationHeader.startsWith(PREFIX);
    }


    private Claims validateJwt(ServerHttpRequest request) {
        String jwtToken = request.getHeaders().getFirst(HEADER).replace(PREFIX, "");
        return Jwts.parser().setSigningKey(generateKeyFromSecret()).build().parseClaimsJws(jwtToken).getBody();
    }

    private SecretKey generateKeyFromSecret() {
        try {
            String secret = "CONTRASENIA-1234";
            MessageDigest sha = MessageDigest.getInstance("SHA-512");
            byte[] keyBites = sha.digest(secret.getBytes());
            return new SecretKeySpec(keyBites, "HmacSHA512");
        } catch (Exception exception){
            throw new RuntimeException("Error getting key: " + exception);
        }

    }


}