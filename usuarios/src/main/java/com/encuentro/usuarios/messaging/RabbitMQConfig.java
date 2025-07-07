package com.encuentro.usuarios.messaging;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.core.Queue;

@Configuration
public class RabbitMQConfig {
    public static final String USUARIO_COLA = "usuario.cola";

    @Bean
    public Queue queue() {
        return new Queue(USUARIO_COLA, false) {
        };
    }
}
