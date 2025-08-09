package ec.edu.espe.msnotificaciones.security;

import ec.edu.espe.msnotificaciones.utils.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Autowired
    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        AntPathMatcher pathMatcher = new AntPathMatcher();
        List<String> excludedPaths = List.of(
                "/api/auth/**",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/v3/api-docs/**",
                "/v3/api-docs",
                "/swagger-resources/**",
                "/webjars/**",
                "/actuator/**"
        );

        boolean isExcluded = excludedPaths.stream()
                .anyMatch(pattern -> pathMatcher.match(pattern, path));

        if (isExcluded) {
            log.debug("Path excluido del filtro JWT: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        // Buscar token en header o cookie
        String token = extractToken(request);

        log.info("Token extraído: {}", token != null ? "presente" : "ausente");
        log.debug("Valor del token: {}", token);

        if (token == null || token.trim().isEmpty()) {
            log.warn("Token ausente para la ruta: {}", path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Acceso no autorizado: token ausente\"}");
            return;
        }

        if (!jwtService.isTokenValid(token)) {
            log.warn("Token inválido para la ruta: {}", path);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Acceso no autorizado: token inválido\"}");
            return;
        }

        try {
            // Extraer datos del token
            String username = jwtService.extractUsername(token);
            String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));

            log.debug("Username extraído: {}", username);
            log.debug("Role extraído: {}", role);

            if (username != null && role != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        Collections.singletonList(authority)
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                log.debug("Autenticación establecida para usuario: {} con rol: {}", username, role);
            }
        } catch (Exception e) {
            log.error("Error al procesar el token JWT: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Acceso no autorizado: token corrupto\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // Primero intentar obtener del header Authorization
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            log.debug("Token encontrado en header Authorization");
            return authHeader.substring(7);
        }

        // Si no está en el header, buscar en las cookies
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    log.debug("Token encontrado en cookie: {}", cookie.getName());
                    return cookie.getValue();
                }
            }
        }

        log.debug("No se encontró token en header ni en cookies");
        return null;
    }
}