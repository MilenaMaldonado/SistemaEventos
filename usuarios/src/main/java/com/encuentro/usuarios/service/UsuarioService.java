package com.encuentro.usuarios.service;
import com.encuentro.usuarios.messaging.UsuarioProducer;
import com.encuentro.usuarios.model.Usuario;


import com.encuentro.usuarios.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired private UsuarioRepository repo;
    @Autowired private PasswordEncoder encoder;
    @Autowired private UsuarioProducer productor;

    public Usuario registrar(Usuario u) {
        u.setContrasena(encoder.encode(u.getContrasena()));
        Usuario guardado = repo.save(u);
        productor.enviarUsuario(guardado); // Enviar a la cola
        return guardado;
    }

    public Usuario autenticar(String correo, String rawPassword) {
        Usuario u = repo.findByCorreo(correo).orElseThrow(() -> new RuntimeException("No encontrado"));
        if (!encoder.matches(rawPassword, u.getContrasena())) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        return u;
    }
}
