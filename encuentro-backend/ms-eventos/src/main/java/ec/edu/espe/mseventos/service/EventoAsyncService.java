package ec.edu.espe.mseventos.service;

import ec.edu.espe.mseventos.dto.EventoColaDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventoAsyncService {

    private final EventoProducer eventoProductor;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void enviarEventoAColaDespuesDeTransaccion(EventoColaDTO eventoColaDTO) {
        try {
            log.info("Enviando evento a cola después de transacción confirmada: ID={}, Capacidad={}", 
                    eventoColaDTO.getIdEvento(), eventoColaDTO.getCapacidad());
            eventoProductor.enviarEvento(eventoColaDTO);
            log.info("✅ Mensaje enviado exitosamente a la cola");
        } catch (Exception e) {
            log.error("❌ Error enviando mensaje a la cola", e);
        }
    }
}