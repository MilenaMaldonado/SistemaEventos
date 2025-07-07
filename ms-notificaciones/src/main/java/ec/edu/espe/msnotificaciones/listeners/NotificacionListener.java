package ec.edu.espe.msnotificaciones.listeners;

import com.fasterxml.jackson.databind.ObjectMapper;

import ec.edu.espe.msnotificaciones.DTO.NotificacionesDTO;
import ec.edu.espe.msnotificaciones.service.NotificacionService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class NotificacionListener {
    @Autowired
    private NotificacionService notificacionService;
    @Autowired
    private ObjectMapper mapper;

    @RabbitListener(queues = "notificaciones.cola")
    public void recibitMensajes(String mensaje) {
        try{
            NotificacionesDTO dto = mapper.readValue(mensaje,NotificacionesDTO.class);
            notificacionService.guardarNotificacion(dto);
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
