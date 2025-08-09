package com.encuentro.usuarios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuarios")
public class Usuario {

    @Id
    @Column(length = 10)
    private String cedula;

    private String nombre;
    private String apellido;
    private int edad;

    @Temporal(TemporalType.DATE)
    private Date fechaNacimiento;

    private String direccion;

    @Column(length = 10)
    private String telefono;

    private String correo;
}