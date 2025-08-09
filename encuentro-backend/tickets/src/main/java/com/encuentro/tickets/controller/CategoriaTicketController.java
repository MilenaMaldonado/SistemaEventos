package com.encuentro.tickets.controller;

import com.encuentro.tickets.dto.CategoriaTicketDTO;
import com.encuentro.tickets.dto.ResponseDto;
import com.encuentro.tickets.model.CategoriaTicket;
import com.encuentro.tickets.services.CategoriaTicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias-tickets")
public class CategoriaTicketController {

    private final CategoriaTicketService service;

    public CategoriaTicketController(CategoriaTicketService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ResponseDto> getAll() {
        List<CategoriaTicket> categorias = service.findAll();
        return ResponseEntity.ok(new ResponseDto("Categorías obtenidas exitosamente", categorias));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto> getById(@PathVariable Long id) {
        CategoriaTicket categoria = service.findById(id);
        if (categoria != null) {
            return ResponseEntity.ok(new ResponseDto("Categoría encontrada", categoria));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Categoría no encontrada", null));
        }
    }

    @PostMapping
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody CategoriaTicketDTO categoriaDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        
        CategoriaTicket categoria = new CategoriaTicket();
        categoria.setNombreCategoria(categoriaDTO.getNombreCategoria());
        categoria.setCapacidadCategoria(categoriaDTO.getCapacidadCategoria());
        categoria.setIdEvento(categoriaDTO.getIdEvento());
        
        CategoriaTicket creada = service.save(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDto("Categoría creada exitosamente", creada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> update(@PathVariable Long id, @Valid @RequestBody CategoriaTicketDTO categoriaDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        
        CategoriaTicket categoria = new CategoriaTicket();
        categoria.setIdCategoria(id);
        categoria.setNombreCategoria(categoriaDTO.getNombreCategoria());
        categoria.setCapacidadCategoria(categoriaDTO.getCapacidadCategoria());
        categoria.setIdEvento(categoriaDTO.getIdEvento());
        
        CategoriaTicket actualizada = service.save(categoria);
        return ResponseEntity.ok(new ResponseDto("Categoría actualizada exitosamente", actualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(new ResponseDto("Categoría eliminada exitosamente", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Categoría no encontrada para eliminar", null));
        }
    }
}
