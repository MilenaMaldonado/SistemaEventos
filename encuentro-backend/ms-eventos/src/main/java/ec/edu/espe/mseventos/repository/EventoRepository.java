package ec.edu.espe.mseventos.repository;

import ec.edu.espe.mseventos.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    // También puedes agregar consultas personalizadas si lo requieres
}