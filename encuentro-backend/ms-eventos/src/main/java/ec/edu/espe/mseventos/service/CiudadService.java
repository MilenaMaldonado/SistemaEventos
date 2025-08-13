package ec.edu.espe.mseventos.service;

import ec.edu.espe.mseventos.dto.CiudadDTO;
import ec.edu.espe.mseventos.dto.NotificacionesDTO;
import ec.edu.espe.mseventos.model.Ciudad;
import ec.edu.espe.mseventos.repository.CiudadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CiudadService {

    private final CiudadRepository ciudadRepository;
    @Autowired
    NotificacionProducer notificacionProducer;

    public CiudadDTO crearCiudad(CiudadDTO dto) {
        Ciudad ciudad = new Ciudad();
        ciudad.setNombre(dto.getNombre());

        Ciudad guardada = ciudadRepository.save(ciudad);

        log.info("Ciudad "+guardada.getNombre()+" creada correctamente");
        NotificacionesDTO notificacionesDTO = new NotificacionesDTO();
        notificacionesDTO.setMensaje(dto.getNombre()+" creado");
        notificacionesDTO.setTipo("CIUDAD");
        notificacionProducer.enviarNotificacion(notificacionesDTO);
        return mapToDTO(guardada);
    }

    public List<CiudadDTO> listarCiudades() {
        return ciudadRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CiudadDTO ciudadPorId(Long id) {
        Ciudad ciudad = ciudadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe ciudad con ID: " + id));
        return mapToDTO(ciudad);
    }

    public String eliminarCiudad(Long id) {
        Ciudad ciudad = ciudadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe ciudad con ID: " + id));
        ciudadRepository.delete(ciudad);
        log.info("Ciudad "+ciudad.getNombre()+" eliminado correctamente");
        NotificacionesDTO notificacionesDTO = new NotificacionesDTO();
        notificacionesDTO.setMensaje(ciudad.getNombre()+" eliminado");
        notificacionesDTO.setTipo("CIUDAD");
        return "Ciudad eliminada correctamente";
    }

    public CiudadDTO actualizarCiudad(Long id, CiudadDTO dto) {
        Ciudad ciudad = ciudadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe ciudad con ID: " + id));
        ciudad.setNombre(dto.getNombre());

        Ciudad actualizada = ciudadRepository.save(ciudad);
        log.info("Ciudad "+actualizada.getNombre()+" actualizada correctamente");
        NotificacionesDTO notificacionesDTO = new NotificacionesDTO();
        notificacionesDTO.setMensaje(dto.getNombre()+" actualizado");
        notificacionesDTO.setTipo("CIUDAD");
        notificacionProducer.enviarNotificacion(notificacionesDTO);
        return mapToDTO(actualizada);
    }

    private CiudadDTO mapToDTO(Ciudad ciudad) {
        CiudadDTO dto = new CiudadDTO();
        dto.setId(ciudad.getId());
        dto.setNombre(ciudad.getNombre());
        return dto;
    }
}
