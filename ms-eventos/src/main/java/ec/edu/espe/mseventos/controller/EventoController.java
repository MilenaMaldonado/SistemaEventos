package ec.edu.espe.mseventos.controller;

import ec.edu.espe.mseventos.dto.EventoDTO;
import ec.edu.espe.mseventos.service.EventoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService eventoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventoDTO crearEvento(@RequestBody EventoDTO eventoDTO) {
        return eventoService.crearEvento(eventoDTO);
    }

    @GetMapping
    public List<EventoDTO> listarEventos() {
        return eventoService.listarEventos();
    }

    @GetMapping("/{id}")
    public EventoDTO eventoPorId(@PathVariable Long id) {
        return eventoService.eventoPorId(id);
    }

    @GetMapping("/ciudad/{idCiudad}")
    public List<EventoDTO> eventosPorCiudad(@PathVariable Long idCiudad) {
        return eventoService.eventosPorCiudad(idCiudad);
    }

    @PutMapping("/{id}")
    public EventoDTO actualizarEvento(@PathVariable Long id, @RequestBody EventoDTO eventoDTO) {
        return eventoService.actualizarEvento(id, eventoDTO);
    }

    @DeleteMapping("/{id}")
    public String eliminarEvento(@PathVariable Long id) {
        return eventoService.eliminarEvento(id);
    }
}
