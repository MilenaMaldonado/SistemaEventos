package ec.edu.espe.autenticacion.constroller;

import ec.edu.espe.autenticacion.DTO.ResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@Tag(name = "Test", description = "Endpoints de prueba para verificar funcionamiento")
public class TestController {

    @GetMapping("/health")
    @Operation(summary = "Health Check", description = "Verifica que el microservicio está funcionando")
    public ResponseEntity<ResponseDto> healthCheck() {
        return ResponseEntity.ok(new ResponseDto("Microservicio de Autenticación funcionando correctamente", "OK"));
    }
    
    @GetMapping("/swagger")
    @Operation(summary = "Swagger Test", description = "Endpoint de prueba para verificar Swagger")
    public ResponseEntity<ResponseDto> swaggerTest() {
        return ResponseEntity.ok(new ResponseDto("Swagger está configurado correctamente", "SWAGGER_OK"));
    }
}