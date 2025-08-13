package ec.edu.espe.msnotificaciones.repository;


import ec.edu.espe.msnotificaciones.entity.Notificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionesRepository extends JpaRepository<Notificacion, Long> {
    
    List<Notificacion> findTop10ByOrderByIdDesc();
    
    Page<Notificacion> findAllByOrderByIdDesc(Pageable pageable);
}
