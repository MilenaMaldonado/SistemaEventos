package com.encuentro.usuarios.producer;

import com.encuentro.usuarios.DTO.NotificacionesDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificacionProducer {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public void enviarNotificacion(NotificacionesDTO notificacionesDTO) {
        try{
            String json = objectMapper.writeValueAsString(notificacionesDTO);
            rabbitTemplate.convertAndSend("notificaciones.cola", json);
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }
}
