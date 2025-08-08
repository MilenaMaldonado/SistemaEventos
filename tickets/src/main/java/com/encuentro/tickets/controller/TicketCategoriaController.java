package com.encuentro.tickets.controller;

import com.encuentro.tickets.dto.ResponseDto;
import com.encuentro.tickets.dto.TicketCategoriaDTO;
import com.encuentro.tickets.model.TicketCategoria;
import com.encuentro.tickets.model.TicketCategoriaId;
import com.encuentro.tickets.services.TicketCategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets-categorias")
public class TicketCategoriaController {

    private final TicketCategoriaService service;

    public TicketCategoriaController(TicketCategoriaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ResponseDto> getAll() {
        List<TicketCategoria> ticketCategorias = service.findAll();
        return ResponseEntity.ok(new ResponseDto("Ticket categorías obtenidos exitosamente", ticketCategorias));
    }

    @GetMapping("/buscar")
    public ResponseEntity<ResponseDto> getById(@RequestParam Long idTicketCliente, @RequestParam Long idCategoria) {
        TicketCategoriaId id = new TicketCategoriaId(idTicketCliente, idCategoria);
        TicketCategoria ticketCategoria = service.findById(id);
        if (ticketCategoria != null) {
            return ResponseEntity.ok(new ResponseDto("Ticket categoría encontrado", ticketCategoria));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Ticket categoría no encontrado", null));
        }
    }

    @PostMapping
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody TicketCategoriaDTO ticketCategoriaDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        
        TicketCategoria ticketCategoria = new TicketCategoria();
        ticketCategoria.setIdTicketCliente(ticketCategoriaDTO.getIdTicketCliente());
        ticketCategoria.setIdCategoria(ticketCategoriaDTO.getIdCategoria());
        ticketCategoria.setAsiento(ticketCategoriaDTO.getAsiento());
        
        TicketCategoria creado = service.save(ticketCategoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDto("Ticket categoría creado exitosamente", creado));
    }

    @DeleteMapping
    public ResponseEntity<ResponseDto> delete(@RequestParam Long idTicketCliente, @RequestParam Long idCategoria) {
        try {
            TicketCategoriaId id = new TicketCategoriaId(idTicketCliente, idCategoria);
            service.delete(id);
            return ResponseEntity.ok(new ResponseDto("Ticket categoría eliminado exitosamente", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Ticket categoría no encontrado para eliminar", null));
        }
    }
}
