package ec.edu.espe.autenticacion.constroller;

import ec.edu.espe.autenticacion.DTO.AuthenticatorUserDTO;
import ec.edu.espe.autenticacion.DTO.ResponseDto;
import ec.edu.espe.autenticacion.DTO.UsuarioDTO;
import ec.edu.espe.autenticacion.service.AuthenticatorUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para registro y login de usuarios")
public class AuthenticatorUserController {

    @Autowired
    private AuthenticatorUserService authenticatorUserService;

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
}
