package ec.edu.espe.autenticacion.utils;

import ec.edu.espe.autenticacion.entity.AuthenticatorUser;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {
    private final String SECRET_KEY = "soyUnaClave123456789123456789123456789"; // mínimo 32 caracteres

    private final long EXPIRATION = 1000 * 60 * 60; // 1 hora

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(AuthenticatorUser authenticatorUser) {
        Map<String, Object> claims = new HashMap<>();
        log.info(authenticatorUser.getID_ROLE().getNombreRole());
        claims.put("role", "ROLE_" + authenticatorUser.getID_ROLE().getNombreRole().toUpperCase());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(authenticatorUser.getID_CEDULA_USUARIO())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public UserDetails extractUserDetails(String token) {
        String username = extractUsername(token);
        String role = extractRole(token);
        log.info("username {} role {}", username, role);

        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("El token no contiene un rol válido.");
        }

        return User.withUsername(username)
                .password("") // sin contraseña porque usamos JWT
                .authorities("ROLE_" + role.toUpperCase()) // Spring espera "ROLE_ADMINISTRADOR", etc.
                .build();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            log.error("Token inválido: {}", e.getMessage()); // ← esto te mostrará "Invalid signature"
            return false;
        }
    }
}
