package ec.edu.espe.autenticacion.productores;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.autenticacion.DTO.TokenResponseDTO;
import ec.edu.espe.autenticacion.entity.AuthenticatorUser;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class JwtSendProductor {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public void enviarJWT(String token, AuthenticatorUser authenticatorUser) {
        try{
            TokenResponseDTO tokenResponseDTO = new TokenResponseDTO(token, authenticatorUser);
            String json = objectMapper.writeValueAsString(tokenResponseDTO);
            rabbitTemplate.convertAndSend("jwt.cola", json);
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }

}
