package ec.edu.espe.mseventos.controller;

import ec.edu.espe.mseventos.dto.CiudadDTO;
import ec.edu.espe.mseventos.service.CiudadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ciudades")
@RequiredArgsConstructor
public class CiudadController {

    private final CiudadService ciudadService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CiudadDTO crearCiudad(@RequestBody CiudadDTO ciudadDTO) {
        return ciudadService.crearCiudad(ciudadDTO);
    }

    @GetMapping
    public List<CiudadDTO> listarCiudades() {
        return ciudadService.listarCiudades();
    }

    @GetMapping("/{id}")
    public CiudadDTO ciudadPorId(@PathVariable Long id) {
        return ciudadService.ciudadPorId(id);
    }

    @PutMapping("/{id}")
    public CiudadDTO actualizarCiudad(@PathVariable Long id, @RequestBody CiudadDTO ciudadDTO) {
        return ciudadService.actualizarCiudad(id, ciudadDTO);
    }

    @DeleteMapping("/{id}")
    public String eliminarCiudad(@PathVariable Long id) {
        return ciudadService.eliminarCiudad(id);
    }
}
