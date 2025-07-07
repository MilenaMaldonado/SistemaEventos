package ec.edu.espe.autenticacion.exeptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoHandlerFoundException ex, HttpServletRequest request) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "URL no existe: " + request.getRequestURI());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
}