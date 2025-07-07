package ec.edu.espe.msnotificaciones.repository;


import ec.edu.espe.msnotificaciones.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacionesRepository extends JpaRepository<Notificacion, Long> {
}
