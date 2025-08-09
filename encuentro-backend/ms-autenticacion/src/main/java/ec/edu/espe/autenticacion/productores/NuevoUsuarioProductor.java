package ec.edu.espe.autenticacion.productores;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.autenticacion.DTO.TokenResponseDTO;
import ec.edu.espe.autenticacion.DTO.UsuarioDTO;
import ec.edu.espe.autenticacion.entity.AuthenticatorUser;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NuevoUsuarioProductor {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public void enviarUsuario(UsuarioDTO usuarioDTO) {
        try{
            String json = objectMapper.writeValueAsString(usuarioDTO);
            rabbitTemplate.convertAndSend("usuario.cola", json);
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }
}
