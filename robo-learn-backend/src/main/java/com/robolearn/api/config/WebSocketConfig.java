package com.robolearn.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String allowedOrigins = System.getenv("ALLOWED_ORIGINS");
        String[] origins;
        
        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            origins = java.util.Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .toArray(String[]::new);
        } else {
            origins = new String[]{
                "http://localhost:5173", 
                "http://127.0.0.1:5173", 
                "https://robo-learn.netlify.app"
            };
        }

        registry.addEndpoint("/ws-arena")
                .setAllowedOriginPatterns(origins)
                .withSockJS();
    }
}