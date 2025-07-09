package com.encuentro.tickets.config;

import com.encuentro.tickets.dto.EventoDto;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
public class EventoConsumer {
    @RabbitListener(queues = RabbitMQConfig.COLA_EVENTOS)
    public void recibirEvento(@Payload EventoDto evento) {
        System.out.println("Recibido evento desde la cola: " + evento.getNombre());
        // Guardar o procesar en base local si hace falta
    }
}
