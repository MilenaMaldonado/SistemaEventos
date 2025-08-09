package ec.edu.espe.autenticacion.productores;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.autenticacion.DTO.AuthenticatorUserDTO;
import ec.edu.espe.autenticacion.DTO.NotificacionesDTO;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificacionProducer {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public void enviarNotificacion(AuthenticatorUserDTO authenticatorUserDTO) {
        try{
            NotificacionesDTO notificacionesDTO = new NotificacionesDTO();
            notificacionesDTO.setMensaje("ID "+authenticatorUserDTO.getCedula()+" inicia sesion");
            notificacionesDTO.setTipo("LOGIN");
            String json = objectMapper.writeValueAsString(notificacionesDTO);
            rabbitTemplate.convertAndSend("notificaciones.cola", json);
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }
}
