package com.encuentro.tickets.dto;

import com.encuentro.tickets.model.SeatStatus;
import java.time.Instant;
import java.util.UUID;

public record SeatView(
        UUID asientoId,
        Integer numero,
        SeatStatus estado,
        Instant holdUntil
) {}