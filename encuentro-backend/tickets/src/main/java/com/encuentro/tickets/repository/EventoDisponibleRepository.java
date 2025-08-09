package com.encuentro.tickets.repository;

import com.encuentro.tickets.model.EventoDisponible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoDisponibleRepository extends JpaRepository<EventoDisponible, Long> {}
