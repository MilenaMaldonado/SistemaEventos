package com.encuentro.tickets.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class TicketCliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)private Long id;
    private LocalDate fechaEmision;
    private String cedula;
    private String metodoPago;
    private double precioUnitarioTicket;
    private int cantidad;
    private double subtotal;
    private double iva;
    private double total;
}
