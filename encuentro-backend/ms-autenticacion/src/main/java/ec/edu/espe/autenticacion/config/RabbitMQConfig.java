package ec.edu.espe.autenticacion.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RabbitMQConfig {
    /*
    @Bean
    public Queue JwtCola(){return QueueBuilder.durable("jwt.cola").build();}
    */

    @Bean
    public Queue nuevoUsuario(){
        return QueueBuilder.durable("usuario.cola").build();
    }

}
