package ec.edu.espe.autenticacion.constroller;

import ec.edu.espe.autenticacion.DTO.AuthenticatorUserDTO;
import ec.edu.espe.autenticacion.DTO.ResponseDto;
import ec.edu.espe.autenticacion.DTO.UsuarioDTO;
import ec.edu.espe.autenticacion.service.AuthenticatorUserService;
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
public class AuthenticatorUserController {

    @Autowired
    private AuthenticatorUserService authenticatorUserService;

    @PostMapping("/register")
    public ResponseEntity<ResponseDto> register(@Valid @RequestBody  UsuarioDTO usuarioDTO,BindingResult result) {
        return authenticatorUserService.register(usuarioDTO,result);
    }

    @PostMapping("/login")
    public  ResponseEntity<ResponseDto> login(@Valid @RequestBody AuthenticatorUserDTO authenticatorUserDTO, BindingResult result, HttpServletResponse response) {
        return authenticatorUserService.login(authenticatorUserDTO,result,response);
    }
}
