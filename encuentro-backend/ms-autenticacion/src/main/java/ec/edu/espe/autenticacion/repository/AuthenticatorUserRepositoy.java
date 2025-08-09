package ec.edu.espe.autenticacion.repository;


import ec.edu.espe.autenticacion.entity.AuthenticatorUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface AuthenticatorUserRepositoy extends JpaRepository<AuthenticatorUser,String> {

}
