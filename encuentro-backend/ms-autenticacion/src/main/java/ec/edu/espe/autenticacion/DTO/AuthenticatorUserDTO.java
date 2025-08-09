package ec.edu.espe.autenticacion.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticatorUserDTO {
    @NotBlank(message = "La cédula es obligatoria")
    private String cedula;
    @NotBlank(message = "Contraseña Obligatoria")
    private String password;
    private int rol=2;
}

