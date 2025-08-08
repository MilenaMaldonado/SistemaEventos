package ec.edu.espe.mseventos.controller;

import ec.edu.espe.mseventos.dto.CiudadDTO;
import ec.edu.espe.mseventos.dto.ResponseDto;
import ec.edu.espe.mseventos.service.CiudadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ciudades")
@RequiredArgsConstructor
public class CiudadController {

    private final CiudadService ciudadService;

    @PostMapping
    public ResponseEntity<ResponseDto> crearCiudad(@Valid @RequestBody CiudadDTO ciudadDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        CiudadDTO creada = ciudadService.crearCiudad(ciudadDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDto("Ciudad creada exitosamente", creada));
    }

    @GetMapping
    public ResponseEntity<ResponseDto> listarCiudades() {
        List<CiudadDTO> ciudades = ciudadService.listarCiudades();
        return ResponseEntity.ok(new ResponseDto("Ciudades obtenidas exitosamente", ciudades));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto> ciudadPorId(@PathVariable Long id) {
        CiudadDTO ciudad = ciudadService.ciudadPorId(id);
        return ResponseEntity.ok(new ResponseDto("Ciudad encontrada", ciudad));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> actualizarCiudad(@PathVariable Long id, @Valid @RequestBody CiudadDTO ciudadDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        CiudadDTO actualizada = ciudadService.actualizarCiudad(id, ciudadDTO);
        return ResponseEntity.ok(new ResponseDto("Ciudad actualizada exitosamente", actualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> eliminarCiudad(@PathVariable Long id) {
        String mensaje = ciudadService.eliminarCiudad(id);
        return ResponseEntity.ok(new ResponseDto("Ciudad eliminada exitosamente", mensaje));
    }
}
