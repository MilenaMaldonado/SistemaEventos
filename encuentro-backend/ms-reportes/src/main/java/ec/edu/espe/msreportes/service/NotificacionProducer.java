package ec.edu.espe.msreportes.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.msreportes.dto.NotificacionesDTO;
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