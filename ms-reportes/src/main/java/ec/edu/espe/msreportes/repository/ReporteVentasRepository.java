package ec.edu.espe.msreportes.repository;


import ec.edu.espe.msreportes.model.ReporteVentas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ReporteVentasRepository extends JpaRepository<ReporteVentas, Long> {

    Optional<ReporteVentas> findByFechaEvento(LocalDate fechaEvento);
}
