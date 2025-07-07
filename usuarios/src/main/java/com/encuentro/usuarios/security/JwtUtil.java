package com.encuentro.usuarios.security;
import java.util.Date;
import com.encuentro.usuarios.model.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secreto}")
    private String secreto;

    @Value("${jwt.expiracion}")
    private Long expiracion;

    public String generarToken(Usuario usuario) {
        return Jwts.builder()
                .setSubject(usuario.getCorreo())
                .claim("rol", usuario.getRol())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiracion))
                .signWith(SignatureAlgorithm.HS256, secreto)
                .compact();
    }

    public String extraerCorreo(String token) {
        return Jwts.parser()
                .setSigningKey(secreto)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
