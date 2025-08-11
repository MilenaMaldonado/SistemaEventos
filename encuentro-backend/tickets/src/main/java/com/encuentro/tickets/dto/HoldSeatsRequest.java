package com.encuentro.tickets.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record HoldSeatsRequest(
        @NotNull Long idEvento,
        @NotEmpty List<@Min(1) Integer> asientos
) {}
