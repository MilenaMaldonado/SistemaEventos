package com.encuentro.tickets.consumer;

import com.encuentro.tickets.dto.EventoColaDTO;
import com.encuentro.tickets.model.EventoDisponible;
import com.encuentro.tickets.services.EventoDisponibleService;
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

    @RabbitListener(queues = "eventos.cola")
    public void procesarEvento(String mensaje) {
        log.info("📥 Mensaje recibido de eventos.cola: {}", mensaje);
        
        try {
            // Deserializar el mensaje JSON
            EventoColaDTO eventoColaDTO = objectMapper.readValue(mensaje, EventoColaDTO.class);
            log.info("🔄 Procesando evento: ID={}, Capacidad={}", 
                    eventoColaDTO.getIdEvento(), eventoColaDTO.getCapacidad());
            
            // Verificar si ya existe el evento
            EventoDisponible existente = eventoDisponibleService.findById(eventoColaDTO.getIdEvento());
            
            if (existente != null) {
                log.info("📝 Actualizando evento disponible existente: ID={}, Capacidad anterior={}, Capacidad nueva={}", 
                        eventoColaDTO.getIdEvento(), existente.getCapacidad(), eventoColaDTO.getCapacidad());
                existente.setCapacidad(eventoColaDTO.getCapacidad());
                EventoDisponible actualizado = eventoDisponibleService.save(existente);
                log.info("✅ Evento disponible actualizado: ID={}, Nueva capacidad={}", 
                        actualizado.getIdEvento(), actualizado.getCapacidad());
            } else {
                log.info("➕ Creando nuevo evento disponible: ID={}, Capacidad={}", 
                        eventoColaDTO.getIdEvento(), eventoColaDTO.getCapacidad());
                EventoDisponible nuevo = new EventoDisponible();
                nuevo.setIdEvento(eventoColaDTO.getIdEvento());
                nuevo.setCapacidad(eventoColaDTO.getCapacidad());
                EventoDisponible creado = eventoDisponibleService.save(nuevo);
                log.info("✅ Evento disponible creado: ID={}, Capacidad={}", 
                        creado.getIdEvento(), creado.getCapacidad());
            }
                    
        } catch (Exception e) {
            log.error("❌ Error procesando mensaje de eventos.cola: {}", mensaje, e);
            // Aquí podrías agregar lógica de retry o dead letter queue
            throw new RuntimeException("Error procesando mensaje: " + mensaje, e);
        }
    }
}