package com.encuentro.usuarios.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {


    private String cedula;

    private String nombre;

    private String apellido;

    private int edad;

    private Date fechaNacimiento;

    private String direccion;

    private String telefono;

   private String correo;

   private String password;
}