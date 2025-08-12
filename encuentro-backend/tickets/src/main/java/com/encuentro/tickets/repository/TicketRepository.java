package com.encuentro.tickets.repository;

import com.encuentro.tickets.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> { }

