package ec.edu.espe.websocketsserver.config;

import ec.edu.espe.websocketsserver.handler.AppWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new AppWebSocketHandler(),"/endpoint")
                .addInterceptors(new JwtWebSocketInterceptor())
                .setAllowedOrigins("*");
    }
}
