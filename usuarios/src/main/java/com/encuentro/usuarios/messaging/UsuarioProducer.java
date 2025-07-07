package com.encuentro.usuarios.messaging;

import com.encuentro.usuarios.model.Usuario;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UsuarioProducer {
    @Autowired
    private AmqpTemplate amqpTemplate;

    public void enviarUsuario(Usuario usuario) {
        amqpTemplate.convertAndSend(RabbitMQConfig.USUARIO_COLA, usuario);
    }

}
