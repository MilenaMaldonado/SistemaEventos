package ec.edu.espe.mseventos.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ciudades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ciudad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;
}