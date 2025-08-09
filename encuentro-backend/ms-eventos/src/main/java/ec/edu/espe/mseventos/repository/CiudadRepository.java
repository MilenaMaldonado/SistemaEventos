package ec.edu.espe.mseventos.repository;


import ec.edu.espe.mseventos.model.Ciudad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CiudadRepository extends JpaRepository<Ciudad, Long> {
    // Aquí puedes agregar métodos personalizados si los necesitas
}
