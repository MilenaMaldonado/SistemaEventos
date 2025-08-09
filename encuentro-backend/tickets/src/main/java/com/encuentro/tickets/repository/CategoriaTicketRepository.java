package com.encuentro.tickets.repository;

import com.encuentro.tickets.model.CategoriaTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaTicketRepository extends JpaRepository<CategoriaTicket, Long> {}
