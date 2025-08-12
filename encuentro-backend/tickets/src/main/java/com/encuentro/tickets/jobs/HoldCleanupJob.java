package com.encuentro.tickets.jobs;


import com.encuentro.tickets.services.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class HoldCleanupJob {

    private final TicketService service;

    @Scheduled(fixedDelay = 30000) // cada 30s
    public void cleanup() {
        int released = service.releaseExpiredHolds();
        if (released > 0) log.info("Holds expirados liberados: {}", released);
    }
}