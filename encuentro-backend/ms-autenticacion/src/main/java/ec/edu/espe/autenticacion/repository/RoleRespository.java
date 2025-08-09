package ec.edu.espe.autenticacion.repository;

import ec.edu.espe.autenticacion.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface RoleRespository extends JpaRepository<Role, Integer> {

}
