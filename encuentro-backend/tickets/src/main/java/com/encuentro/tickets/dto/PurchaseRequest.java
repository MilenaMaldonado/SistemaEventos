package com.encuentro.tickets.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record PurchaseRequest(
        @NotNull Long idEvento,
        @NotEmpty List<@Min(1) Integer> asientos,
        @NotBlank String nombre,
        @NotBlank String apellido,
        @NotBlank String cedula,
        @NotNull @DecimalMin("0.00") BigDecimal precioUnitario
) {}