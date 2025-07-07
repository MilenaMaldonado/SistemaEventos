package com.encuentro.tickets.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String COLA_EVENTOS = "evento.cola";

    @Bean
    public Queue eventoQueue() {
        return new Queue(COLA_EVENTOS, true);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange("eventos.exchange");
    }

    @Bean
    public Binding binding(Queue eventoQueue, TopicExchange exchange) {
        return BindingBuilder.bind(eventoQueue).to(exchange).with("eventos.routingkey");
    }
}

