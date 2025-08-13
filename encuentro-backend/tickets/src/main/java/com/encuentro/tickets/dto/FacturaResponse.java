package com.encuentro.tickets.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FacturaResponse(
        UUID facturaId,
        Long idEvento,
        List<Integer> asientos,
        BigDecimal precioUnitario,
        BigDecimal subtotal,
        BigDecimal iva,
        BigDecimal total,
        Instant createdAt
) {}