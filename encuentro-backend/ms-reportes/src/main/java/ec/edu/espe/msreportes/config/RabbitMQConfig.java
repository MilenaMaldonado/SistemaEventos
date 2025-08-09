package ec.edu.espe.msreportes.config;


import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String COLA_EVENTOS = "eventos.cola";
    public static final String COLA_TICKETS = "tickets.cola";

    @Bean
    public Queue eventosQueue() {
        return new Queue(COLA_EVENTOS, true); // durable = true
    }

    @Bean
    public Queue ticketsQueue() {
        return new Queue(COLA_TICKETS, true);
    }
}
