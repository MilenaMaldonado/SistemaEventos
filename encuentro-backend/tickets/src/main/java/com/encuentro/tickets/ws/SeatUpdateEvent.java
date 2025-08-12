package com.encuentro.tickets.ws;

import com.encuentro.tickets.model.SeatStatus;
import java.time.Instant;

public record SeatUpdateEvent(
        Long idEvento,
        Integer asiento,
        SeatStatus estado,
        Instant holdUntil
) {}