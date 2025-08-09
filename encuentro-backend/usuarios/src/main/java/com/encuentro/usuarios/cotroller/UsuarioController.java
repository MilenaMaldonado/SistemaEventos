package com.encuentro.usuarios.cotroller;

import com.encuentro.usuarios.DTO.NotificacionesDTO;
import com.encuentro.usuarios.model.Usuario;
import com.encuentro.usuarios.producer.NotificacionProducer;
import com.encuentro.usuarios.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private NotificacionProducer notificacionProducer;

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarTodos();
    }

    @GetMapping("/{cedula}")
    public ResponseEntity<Usuario> obtenerUsuario(@PathVariable String cedula) {
        return usuarioService.buscarPorCedula(cedula)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Usuario> crearUsuario(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.guardar(usuario));
    }

    @PutMapping("/{cedula}")
    public ResponseEntity<Usuario> actualizarUsuario(@PathVariable String cedula, @RequestBody Usuario usuario) {
        return usuarioService.buscarPorCedula(cedula).map(u -> {
            usuario.setCedula(cedula);
            NotificacionesDTO  notificacionesDTO = new NotificacionesDTO();
            notificacionesDTO.setMensaje("Usuario con el CI "+ usuario.getCedula()+" actualizado con exito");
            notificacionesDTO.setTipo("USUARIO");
            notificacionProducer.enviarNotificacion(notificacionesDTO);
            return ResponseEntity.ok(usuarioService.guardar(usuario));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{cedula}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable String cedula) {
        return usuarioService.buscarPorCedula(cedula).map(u -> {
            usuarioService.eliminar(cedula);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}