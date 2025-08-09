package ec.edu.espe.autenticacion.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticatorUser {
    @Id
    @Column(nullable = false, unique = true)
    @Size(min = 10, max = 13, message = "La cédula debe tener 10 caracteres")
    private String ID_CEDULA_USUARIO;

    @Column(nullable = false, unique = true)
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String PASSWORD;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="id_role",nullable = false)
    private Role ID_ROLE;

}
