package com.encuentro.tickets.repository;
import com.encuentro.tickets.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FacturaRepository extends JpaRepository<Factura, UUID> {
    
    @Query("SELECT f FROM Factura f JOIN FETCH f.evento JOIN FETCH f.tickets t JOIN FETCH t.asiento WHERE f.cedula = :cedula ORDER BY f.createdAt DESC")
    List<Factura> findByCedulaWithDetails(@Param("cedula") String cedula);
}