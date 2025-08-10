package com.encuentro.tickets.consumer;

import com.encuentro.tickets.dto.EventoColaDTO;
import com.encuentro.tickets.dto.NotificacionesDTO;
import com.encuentro.tickets.model.EventoDisponible;
import com.encuentro.tickets.services.EventoDisponibleService;
import com.encuentro.tickets.services.NotificacionProducer;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventoConsumer {

    private final EventoDisponibleService eventoDisponibleService;
    private final ObjectMapper objectMapper;
    private final NotificacionProducer notificacionProducer;

    @RabbitListener(queues = "eventos.cola")
    public void procesarEvento(String mensaje) {
        log.info("📥 Mensaje recibido de eventos.cola: {}", mensaje);
        
        try {
            // Deserializar el mensaje JSON
            EventoColaDTO eventoColaDTO = objectMapper.readValue(mensaje, EventoColaDTO.class);
            log.info("🔄 Procesando evento: ID={}, Capacidad={}, Operación={}", 
                    eventoColaDTO.getIdEvento(), eventoColaDTO.getCapacidad(), eventoColaDTO.getOperacion());
            
            String operacion = eventoColaDTO.getOperacion() != null ? eventoColaDTO.getOperacion().toUpperCase() : "CREAR";
            
            switch (operacion) {
                case "ELIMINAR":
                    manejarEliminacion(eventoColaDTO.getIdEvento());
                    break;
                case "CREAR":
                case "ACTUALIZAR":
                default:
                    manejarCrearOActualizar(eventoColaDTO);
                    break;
            }
                    
        } catch (Exception e) {
            log.error("❌ Error procesando mensaje de eventos.cola: {}", mensaje, e);
            throw new RuntimeException("Error procesando mensaje: " + mensaje, e);
        }
    }
    
    private void manejarCrearOActualizar(EventoColaDTO eventoColaDTO) {
        // Verificar si ya existe el evento
        EventoDisponible existente = eventoDisponibleService.findById(eventoColaDTO.getIdEvento());
        
        if (existente != null) {
            log.info("📝 Actualizando evento disponible existente: ID={}, Capacidad anterior={}, Capacidad nueva={}", 
                    eventoColaDTO.getIdEvento(), existente.getCapacidad(), eventoColaDTO.getCapacidad());
            existente.setCapacidad(eventoColaDTO.getCapacidad());
            EventoDisponible actualizado = eventoDisponibleService.save(existente);
            log.info("✅ Evento disponible actualizado: ID={}, Nueva capacidad={}", 
                    actualizado.getIdEvento(), actualizado.getCapacidad());
            
            NotificacionesDTO notificacion = new NotificacionesDTO(
                    "Evento disponible actualizado: ID " + actualizado.getIdEvento() + ", Nueva capacidad: " + actualizado.getCapacidad(),
                    "TICKETS"
            );
            notificacionProducer.enviarNotificacion(notificacion);
        } else {
            log.info("➕ Creando nuevo evento disponible: ID={}, Capacidad={}", 
                    eventoColaDTO.getIdEvento(), eventoColaDTO.getCapacidad());
            EventoDisponible nuevo = new EventoDisponible();
            nuevo.setIdEvento(eventoColaDTO.getIdEvento());
            nuevo.setCapacidad(eventoColaDTO.getCapacidad());
            EventoDisponible creado = eventoDisponibleService.save(nuevo);
            log.info("✅ Evento disponible creado: ID={}, Capacidad={}", 
                    creado.getIdEvento(), creado.getCapacidad());
            
            NotificacionesDTO notificacion = new NotificacionesDTO(
                    "Nuevo evento disponible creado: ID " + creado.getIdEvento() + ", Capacidad: " + creado.getCapacidad(),
                    "TICKETS"
            );
            notificacionProducer.enviarNotificacion(notificacion);
        }
    }
    
    private void manejarEliminacion(Long idEvento) {
        EventoDisponible existente = eventoDisponibleService.findById(idEvento);
        
        if (existente != null) {
            log.info("🗑️ Eliminando evento disponible: ID={}", idEvento);
            eventoDisponibleService.deleteById(idEvento);
            log.info("✅ Evento disponible eliminado: ID={}", idEvento);
            
            NotificacionesDTO notificacion = new NotificacionesDTO(
                    "Evento disponible eliminado: ID " + idEvento,
                    "TICKETS"
            );
            notificacionProducer.enviarNotificacion(notificacion);
        } else {
            log.warn("⚠️ No se encontró evento disponible para eliminar: ID={}", idEvento);
        }
    }
}