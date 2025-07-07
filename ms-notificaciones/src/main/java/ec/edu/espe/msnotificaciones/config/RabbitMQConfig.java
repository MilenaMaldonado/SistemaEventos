package ec.edu.espe.msnotificaciones.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RabbitMQConfig {
    @Bean
    public Queue JwtCola(){
        return QueueBuilder.durable("notificaciones.cola").build();
    }
}
