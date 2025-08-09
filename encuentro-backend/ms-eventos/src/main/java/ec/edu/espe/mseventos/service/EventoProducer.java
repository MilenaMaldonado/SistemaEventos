package ec.edu.espe.mseventos.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.mseventos.dto.EventoColaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EventoProducer {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    private static final String COLA_EVENTOS = "eventos.cola";

    public void enviarEvento(EventoColaDTO eventoColaDTO) {
        try {
            String json = objectMapper.writeValueAsString(eventoColaDTO);
            rabbitTemplate.convertAndSend(COLA_EVENTOS, json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
