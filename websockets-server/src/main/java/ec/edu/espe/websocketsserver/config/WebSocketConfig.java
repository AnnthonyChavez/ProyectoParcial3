package ec.edu.espe.websocketsserver.config;

import ec.edu.espe.websocketsserver.handler.AppWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final AppWebSocketHandler appWebSocketHandler;
    private final JwtWebSocketInterceptor jwtWebSocketInterceptor;

    public WebSocketConfig(AppWebSocketHandler appWebSocketHandler, JwtWebSocketInterceptor jwtWebSocketInterceptor) {
        this.appWebSocketHandler = appWebSocketHandler;
        this.jwtWebSocketInterceptor = jwtWebSocketInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(appWebSocketHandler, "/ws/subastas")
                .addInterceptors(jwtWebSocketInterceptor)
                .setAllowedOrigins("*")
                .setAllowedOriginPatterns("*");
    }
}
