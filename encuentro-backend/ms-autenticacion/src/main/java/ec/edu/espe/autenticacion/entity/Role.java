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
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Integer idRole;

    @Size(min = 4, max = 20, message = "El nombre del rol debe tener entre 4 y 20 caracteres")
    @Column(nullable = false, unique = true)
    private String nombreRole;
}