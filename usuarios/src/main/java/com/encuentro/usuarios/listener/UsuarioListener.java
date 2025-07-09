package com.encuentro.usuarios.listener;

import com.encuentro.usuarios.DTO.NotificacionesDTO;
import com.encuentro.usuarios.DTO.UsuarioDTO;
import com.encuentro.usuarios.model.Usuario;
import com.encuentro.usuarios.producer.NotificacionProducer;
import com.encuentro.usuarios.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UsuarioListener {
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private NotificacionProducer notificacionProducer;

    @RabbitListener(queues = "usuario.cola")
    public void colaUsuario(String mensaje) {
        try{
            UsuarioDTO usuarioDTO = objectMapper.readValue(mensaje, UsuarioDTO.class);
            Usuario usuario = new Usuario();
            usuario.setNombre(usuarioDTO.getNombre());
            usuario.setCorreo(usuarioDTO.getCorreo());
            usuario.setApellido(usuarioDTO.getApellido());
            usuario.setTelefono(usuarioDTO.getTelefono());
            usuario.setCedula(usuarioDTO.getCedula());
            usuario.setFechaNacimiento(usuarioDTO.getFechaNacimiento());
            usuario.setDireccion(usuarioDTO.getDireccion());
            usuario.setEdad(usuarioDTO.getEdad());
            log.info("Nuevo usuario: " + usuario +"creado con exito");
            NotificacionesDTO  notificacionesDTO = new NotificacionesDTO();
            notificacionesDTO.setMensaje("Usuario "+usuarioDTO.getNombre()+"con CI "+usuarioDTO.getCedula() +" creado con exito");
            notificacionesDTO.setTipo("USUARIO");
            notificacionProducer.enviarNotificacion(notificacionesDTO);
            usuarioService.guardar(usuario);
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
