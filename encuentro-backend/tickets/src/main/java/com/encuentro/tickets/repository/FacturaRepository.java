package com.encuentro.tickets.repository;
import com.encuentro.tickets.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface FacturaRepository extends JpaRepository<Factura, UUID> {
    
    @Query("SELECT f FROM Factura f JOIN FETCH f.evento JOIN FETCH f.tickets t JOIN FETCH t.asiento WHERE f.cedula = :cedula ORDER BY f.createdAt DESC")
    List<Factura> findByCedulaWithDetails(@Param("cedula") String cedula);
    
    @Query("SELECT COUNT(t) FROM Ticket t JOIN t.factura f WHERE f.createdAt >= :startDate AND f.createdAt < :endDate")
    Long countTicketsByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    @Query("SELECT COALESCE(SUM(f.total), 0) FROM Factura f WHERE f.createdAt >= :startDate AND f.createdAt < :endDate")
    BigDecimal sumTotalByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    @Query("SELECT COUNT(f) FROM Factura f WHERE f.createdAt >= :startDate AND f.createdAt < :endDate")
    Long countFacturasByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    @Query("SELECT COUNT(t) FROM Ticket t")
    Long countAllTickets();
    
    @Query("SELECT COALESCE(SUM(f.total), 0) FROM Factura f")
    BigDecimal sumAllTotals();
}