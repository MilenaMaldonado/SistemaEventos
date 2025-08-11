package com.encuentro.tickets.repository;

import com.encuentro.tickets.model.Asiento;
import com.encuentro.tickets.model.SeatStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;

@Repository
public interface AsientoRepository extends JpaRepository<Asiento, UUID> {

    List<Asiento> findByEventoIdEventoOrderByNumero(Long idEvento);

    Optional<Asiento> findByEventoIdEventoAndNumero(Long idEvento, Integer numero);

    @Modifying
    @Query("update Asiento a set a.estado='AVAILABLE', a.holdUntil=null where a.estado='HOLD' and a.holdUntil < :now")
    int releaseExpired(Instant now);

    long countByEventoIdEventoAndEstado(Long idEvento, SeatStatus estado);
}