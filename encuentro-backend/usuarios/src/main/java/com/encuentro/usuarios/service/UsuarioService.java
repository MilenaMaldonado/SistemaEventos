package com.encuentro.usuarios.service;

import com.encuentro.usuarios.DTO.NotificacionesDTO;
import com.encuentro.usuarios.model.Usuario;


import com.encuentro.usuarios.producer.NotificacionProducer;
import com.encuentro.usuarios.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private NotificacionProducer notificacionProducer;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorCedula(String cedula) {
        return usuarioRepository.findById(cedula);
    }

    public Usuario guardar(Usuario usuario) {
        log.info("Guardando usuario {}", usuario);
        NotificacionesDTO notificacionesDTO = new NotificacionesDTO();
        notificacionesDTO.setMensaje("Usuario "+usuario.getNombre() +"con CI "+usuario.getCedula() +" guardado con exito");
        notificacionesDTO.setTipo("USUARIO");
        notificacionProducer.enviarNotificacion(notificacionesDTO);
        return usuarioRepository.save(usuario);
    }

    public void eliminar(String cedula) {
        NotificacionesDTO notificacionesDTO = new NotificacionesDTO();
        notificacionesDTO.setMensaje("Usuario con CI "+cedula+" eliminado con exito");
        notificacionesDTO.setTipo("USUARIO");
        notificacionProducer.enviarNotificacion(notificacionesDTO);
        usuarioRepository.deleteById(cedula);
    }
}