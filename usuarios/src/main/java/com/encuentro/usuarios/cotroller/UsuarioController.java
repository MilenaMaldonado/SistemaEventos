package com.encuentro.usuarios.cotroller;
import com.encuentro.usuarios.model.Usuario;
import com.encuentro.usuarios.security.JwtUtil;
import com.encuentro.usuarios.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired private UsuarioService service;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrar(@RequestBody Usuario u) {
        return ResponseEntity.ok(service.registrar(u));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        Usuario u = service.autenticar(body.get("correo"), body.get("contraseña"));
        String token = jwtUtil.generarToken(u);
        return ResponseEntity.ok(Map.of("token", token));
    }
}
