package ec.edu.espe.msnotificaciones.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime fecha;
    private String tipo;
    private String mensaje;

    @PrePersist
    public void prePersist() {
        this.fecha = LocalDateTime.now();
    }
}
