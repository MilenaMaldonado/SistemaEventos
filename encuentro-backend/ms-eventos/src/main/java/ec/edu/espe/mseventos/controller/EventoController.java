package ec.edu.espe.mseventos.controller;

import ec.edu.espe.mseventos.dto.EventoDTO;
import ec.edu.espe.mseventos.dto.ResponseDto;
import ec.edu.espe.mseventos.service.EventoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService eventoService;

    @PostMapping
    public ResponseEntity<ResponseDto> crearEvento(@Valid @RequestBody EventoDTO eventoDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        EventoDTO creado = eventoService.crearEvento(eventoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDto("Evento creado exitosamente", creado));
    }

    @GetMapping
    public ResponseEntity<ResponseDto> listarEventos() {
        List<EventoDTO> eventos = eventoService.listarEventos();
        return ResponseEntity.ok(new ResponseDto("Eventos obtenidos exitosamente", eventos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto> eventoPorId(@PathVariable Long id) {
        EventoDTO evento = eventoService.eventoPorId(id);
        return ResponseEntity.ok(new ResponseDto("Evento encontrado", evento));
    }

    @GetMapping("/ciudad/{idCiudad}")
    public ResponseEntity<ResponseDto> eventosPorCiudad(@PathVariable Long idCiudad) {
        List<EventoDTO> eventos = eventoService.eventosPorCiudad(idCiudad);
        return ResponseEntity.ok(new ResponseDto("Eventos de la ciudad obtenidos exitosamente", eventos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> actualizarEvento(@PathVariable Long id, @Valid @RequestBody EventoDTO eventoDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        EventoDTO actualizado = eventoService.actualizarEvento(id, eventoDTO);
        return ResponseEntity.ok(new ResponseDto("Evento actualizado exitosamente", actualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> eliminarEvento(@PathVariable Long id) {
        String mensaje = eventoService.eliminarEvento(id);
        return ResponseEntity.ok(new ResponseDto("Evento eliminado exitosamente", mensaje));
    }
}
