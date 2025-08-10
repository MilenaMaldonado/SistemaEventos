package ec.edu.espe.mseventos.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        // Diferenciar “token ausente” vs “token inválido”
        String authHeader = request.getHeader("Authorization");
        String msg;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            msg = "Acceso no autorizado: token ausente";
        } else {
            msg = "Acceso no autorizado: token inválido";
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new HashMap<>();
        body.put("estado", 401);
        body.put("error", "UNAUTHORIZED");
        body.put("mensaje", msg);

        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }
}
