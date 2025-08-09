package ec.edu.espe.autenticacion.service;

import ec.edu.espe.autenticacion.entity.Role;
import ec.edu.espe.autenticacion.repository.RoleRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class RoleService {
    @Autowired
    RoleRespository roleRespository;

    public Role findById(Integer idRole){
        return roleRespository.findById(idRole).get();
    }
    public List<Role> findAll(){
        return roleRespository.findAll();
    }
    public Role save(Role role){
        return roleRespository.save(role);
    }
    public void deleteById(Integer idRole){
        roleRespository.deleteById(idRole);
    }
    public Role update(Role role){
        return roleRespository.save(role);
    }

}
