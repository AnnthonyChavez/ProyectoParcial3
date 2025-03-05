package ec.edu.espe.websocketsserver.config;

import ec.edu.espe.websocketsserver.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";
    private static final String TOKEN_PARAM = "token";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = getJwtToken(request);
            if (token != null) {
                Claims claims = validateToken(token);
                if (claims.get("role") != null) {
                    setUpSpringAuthentication(claims);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } else {
                SecurityContextHolder.clearContext();
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        }
    }

    private Claims validateToken(String jwtToken) {
        return Jwts.parser()
                .verifyWith(AuthService.getSecretKey())
                .build()
                .parseSignedClaims(jwtToken)
                .getPayload();
    }

    private void setUpSpringAuthentication(Claims claims) {
        String username = claims.getSubject();
        String role = claims.get("role", String.class);
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private String getJwtToken(HttpServletRequest request) {
        // Primero intentamos obtener el token del header
        String authenticationHeader = request.getHeader(HEADER);
        if (authenticationHeader != null && authenticationHeader.startsWith(PREFIX)) {
            return authenticationHeader.replace(PREFIX, "");
        }
        
        // Si no está en el header, intentamos obtenerlo de los parámetros de la URL
        String tokenParam = request.getParameter(TOKEN_PARAM);
        if (tokenParam != null && !tokenParam.isEmpty()) {
            return tokenParam;
        }
        
        return null;
    }
} 