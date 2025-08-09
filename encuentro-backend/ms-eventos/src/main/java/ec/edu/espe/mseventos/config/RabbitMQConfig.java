package ec.edu.espe.mseventos.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    @Bean
    public Queue eventosCola() {
        return QueueBuilder.durable("eventos.cola").build();
    }

}
