package ec.edu.espe.autenticacion.constroller;

import ec.edu.espe.autenticacion.DTO.AuthenticatorUserDTO;
import ec.edu.espe.autenticacion.DTO.ResponseDto;
import ec.edu.espe.autenticacion.DTO.UsuarioDTO;
import ec.edu.espe.autenticacion.service.AuthenticatorUserService;
import ec.edu.espe.autenticacion.utils.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para registro y login de usuarios")
public class AuthenticatorUserController {

    @Autowired
    private AuthenticatorUserService authenticatorUserService;
    
    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", description = "Registra un nuevo usuario en el sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos o usuario ya existe")
    })
    public ResponseEntity<ResponseDto> register(@Valid @RequestBody  UsuarioDTO usuarioDTO,BindingResult result) {
        return authenticatorUserService.register(usuarioDTO,result);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y genera un token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login exitoso, token generado"),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public  ResponseEntity<ResponseDto> login(@Valid @RequestBody AuthenticatorUserDTO authenticatorUserDTO, BindingResult result, HttpServletResponse response) {
        return authenticatorUserService.login(authenticatorUserDTO,result,response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión", description = "Invalida el token JWT y cierra la sesión del usuario")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout exitoso"),
        @ApiResponse(responseCode = "400", description = "Error al procesar logout")
    })
    public ResponseEntity<ResponseDto> logout(HttpServletRequest request, HttpServletResponse response) {
        return authenticatorUserService.logout(request, response);
    }

    @PostMapping("/validate-token")
    @Operation(summary = "Validar token JWT", description = "Valida si un token JWT es válido y no ha expirado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token válido"),
        @ApiResponse(responseCode = "401", description = "Token inválido o expirado")
    })
    public ResponseEntity<ResponseDto> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDto("Token no proporcionado o formato inválido", false));
            }

            String token = authHeader.substring(7);
            boolean isValid = jwtService.isTokenValid(token);

            if (isValid) {
                return ResponseEntity.ok(new ResponseDto("Token válido", true));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ResponseDto("Token inválido o expirado", false));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDto("Error al validar token: " + e.getMessage(), false));
        }
    }
}
