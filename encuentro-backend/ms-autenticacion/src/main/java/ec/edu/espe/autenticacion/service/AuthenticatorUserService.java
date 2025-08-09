package ec.edu.espe.autenticacion.service;

import ec.edu.espe.autenticacion.DTO.AuthenticatorUserDTO;
import ec.edu.espe.autenticacion.DTO.ResponseDto;
import ec.edu.espe.autenticacion.DTO.UsuarioDTO;
import ec.edu.espe.autenticacion.entity.AuthenticatorUser;
import ec.edu.espe.autenticacion.entity.Role;
import ec.edu.espe.autenticacion.productores.NotificacionProducer;
import ec.edu.espe.autenticacion.productores.NuevoUsuarioProductor;
import ec.edu.espe.autenticacion.repository.AuthenticatorUserRepositoy;
import ec.edu.espe.autenticacion.utils.CedulaEcuatoriana;
import ec.edu.espe.autenticacion.utils.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AuthenticatorUserService {
    @Autowired
    private AuthenticatorUserRepositoy authenticatorUserRepositoy;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtUtil;
    @Autowired
    NuevoUsuarioProductor  nuevoUsuarioProductor;
    @Autowired
    NotificacionProducer  notificacionProducer;

    private final CedulaEcuatoriana cedulaEcuatoriana = new CedulaEcuatoriana();


    public ResponseEntity<ResponseDto> register(UsuarioDTO usuarioDTO,BindingResult result) {
        try {
            //valida Usuario
            ResponseEntity<ResponseDto> validationError = validateRequest(result);
            if (validationError != null) return validationError;
            //Valida Cedula
            cedulaEcuatoriana.validarCedula(usuarioDTO.getCedula());
            // Verificar si ya existe
            if (authenticatorUserRepositoy.existsById(usuarioDTO.getCedula())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ResponseDto("El usuario ya está registrado", null));
            }
            // Preparar el usuario y rol
            AuthenticatorUser authenticatorUser = new AuthenticatorUser();
            String passwordEncriptada = passwordEncoder.encode(usuarioDTO.getPassword());

            authenticatorUser.setPASSWORD(passwordEncriptada);
            authenticatorUser.setID_CEDULA_USUARIO(usuarioDTO.getCedula());

            Role role = new Role();
            role.setIdRole(2);  // ID del rol por defecto
            role.setNombreRole("ROLE_USER");
            authenticatorUser.setID_ROLE(role);

            // Guardar en la base de datos
            AuthenticatorUser saved = authenticatorUserRepositoy.save(authenticatorUser);
            //Aquí debe ir la info para el microservicio Usuario
            nuevoUsuarioProductor.enviarUsuario(usuarioDTO);
            log.info("Registrado exitosamente");
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new ResponseDto("Nuevo Cliente Registrado", saved));

        } catch (Exception e) {
            // Atrapa cualquier excepción (validación o errores inesperados)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDto(e.getMessage(), null));
        }
    }

    public ResponseEntity<ResponseDto> login(AuthenticatorUserDTO  authenticatorUserDTO, BindingResult result, HttpServletResponse response) {
        try{
            ResponseEntity<ResponseDto> validationError = validateRequest(result);
            if (validationError != null) return validationError;
            //Valida Cedula
            cedulaEcuatoriana.validarCedula(authenticatorUserDTO.getCedula());
            if (!authenticatorUserRepositoy.existsById(authenticatorUserDTO.getCedula())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseDto("Usuario no encontrado", "Cedula: " + authenticatorUserDTO.getCedula()));
            }
            AuthenticatorUser authenticatorUser = authenticatorUserRepositoy.findById(authenticatorUserDTO.getCedula()).get();
            if (!passwordEncoder.matches(authenticatorUserDTO.getPassword(), authenticatorUser.getPASSWORD())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseDto("Contraseña Incorrecto", null));
            }
            log.info("Login exitosamente");
            notificacionProducer.enviarNotificacion(authenticatorUserDTO);
            String token = jwtUtil.generateToken(authenticatorUser);
            Cookie jwtCookie = new Cookie("token", token);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(3600);
            response.addCookie(jwtCookie);
            return ResponseEntity.ok(new ResponseDto("Inicio de sesión exitoso",token));
        }
        catch (Exception e){
            // Atrapa cualquier excepción (validación o errores inesperados)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDto(e.getMessage(), null));
        }
    }

    private ResponseEntity<ResponseDto> validateRequest(BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errors = result.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            FieldError::getField,
                            FieldError::getDefaultMessage,
                            (mensaje1, mensaje2) -> mensaje1
                    ));
            return buildResponse(HttpStatus.BAD_REQUEST, "Errores de validación", errors);
        }
        return null;
    }
    private ResponseEntity<ResponseDto> buildResponse(HttpStatus status, String message, Object data) {
        return ResponseEntity.status(status).body(new ResponseDto(message, data));
    }
}
