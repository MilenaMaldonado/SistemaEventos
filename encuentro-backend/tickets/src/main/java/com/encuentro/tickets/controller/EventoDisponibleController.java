package com.encuentro.tickets.controller;

import com.encuentro.tickets.dto.EventoDisponibleDTO;
import com.encuentro.tickets.dto.ResponseDto;
import com.encuentro.tickets.model.EventoDisponible;
import com.encuentro.tickets.services.EventoDisponibleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos-disponibles")
public class EventoDisponibleController {

    private final EventoDisponibleService service;

    public EventoDisponibleController(EventoDisponibleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ResponseDto> getAll() {
        List<EventoDisponible> eventos = service.findAll();
        return ResponseEntity.ok(new ResponseDto("Eventos disponibles obtenidos exitosamente", eventos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto> getById(@PathVariable Long id) {
        EventoDisponible evento = service.findById(id);
        if (evento != null) {
            return ResponseEntity.ok(new ResponseDto("Evento disponible encontrado", evento));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Evento disponible no encontrado", null));
        }
    }

    @PostMapping
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody EventoDisponibleDTO eventoDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        
        EventoDisponible evento = new EventoDisponible();
        evento.setIdEvento(eventoDTO.getIdEvento());
        evento.setCapacidad(eventoDTO.getCapacidad());
        
        EventoDisponible creado = service.save(evento);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDto("Evento disponible creado exitosamente", creado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> update(@PathVariable Long id, @Valid @RequestBody EventoDisponibleDTO eventoDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        
        EventoDisponible evento = new EventoDisponible();
        evento.setIdEvento(id);
        evento.setCapacidad(eventoDTO.getCapacidad());
        
        EventoDisponible actualizado = service.save(evento);
        return ResponseEntity.ok(new ResponseDto("Evento disponible actualizado exitosamente", actualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(new ResponseDto("Evento disponible eliminado exitosamente", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Evento disponible no encontrado para eliminar", null));
        }
    }
}
