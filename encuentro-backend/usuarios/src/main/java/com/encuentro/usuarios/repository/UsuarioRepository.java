package com.encuentro.usuarios.repository;
import com.encuentro.usuarios.model.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
}