package ec.edu.espe.mseventos.service;

import ec.edu.espe.mseventos.dto.EventoColaDTO;
import ec.edu.espe.mseventos.dto.EventoDTO;
import ec.edu.espe.mseventos.dto.NotificacionesDTO;
import ec.edu.espe.mseventos.model.Ciudad;
import ec.edu.espe.mseventos.model.Evento;
import ec.edu.espe.mseventos.repository.CiudadRepository;
import ec.edu.espe.mseventos.repository.EventoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository eventoRepository;
    private final CiudadRepository ciudadRepository;
    private final EventoProducer eventoProductor;

    @Autowired
    NotificacionProducer notificacionProducer;

    public EventoDTO crearEvento(EventoDTO dto) {
        Ciudad ciudad = ciudadRepository.findById(dto.getIdCiudad())
                .orElseThrow(() -> new RuntimeException("No existe ciudad con ID: " + dto.getIdCiudad()));

        Evento evento = new Evento();
        evento.setNombre(dto.getNombre());
        evento.setCiudad(ciudad);
        evento.setEstablecimiento(dto.getEstablecimiento());
        evento.setFecha(dto.getFecha());
        evento.setHora(dto.getHora());
        evento.setCapacidad(dto.getCapacidad());
        evento.setImagenUrl(dto.getImagenUrl());

        Evento guardado = eventoRepository.save(evento);

        eventoProductor.enviarEvento(new EventoColaDTO(
                guardado.getIdEvento(),
                guardado.getNombre(),
                ciudad.getNombre(),
                guardado.getEstablecimiento(),
                guardado.getFecha(),
                guardado.getHora(),
                guardado.getCapacidad(),
                "CREAR"
        ));
        log.info("Evento creado");
        NotificacionesDTO  notificacionesDTO = new NotificacionesDTO();
        notificacionesDTO.setMensaje(dto.getNombre()+" creado");
        notificacionesDTO.setTipo("EVENTO");
        notificacionProducer.enviarNotificacion(notificacionesDTO);
        return mapToDTO(guardado);
    }

    public List<EventoDTO> listarEventos() {
        return eventoRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EventoDTO eventoPorId(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe evento con ID: " + id));
        return mapToDTO(evento);
    }

    public List<EventoDTO> eventosPorCiudad(Long idCiudad) {
        return eventoRepository.findAll().stream()
                .filter(e -> e.getCiudad().getId().equals(idCiudad))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public String eliminarEvento(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe evento con ID: " + id));

        // Obtenemos la ciudad asociada
        Ciudad ciudad = evento.getCiudad();

        // Enviar a la cola toda la información antes de eliminar
        eventoProductor.enviarEvento(new EventoColaDTO(
                evento.getIdEvento(),
                evento.getNombre(),
                ciudad != null ? ciudad.getNombre() : "Desconocida",
                evento.getEstablecimiento(),
                evento.getFecha(),
                evento.getHora(),
                evento.getCapacidad(),
                "ELIMINAR"
        ));

        log.info("Evento eliminado");
        NotificacionesDTO  notificacionesDTO = new NotificacionesDTO();
        notificacionesDTO.setMensaje(evento.getNombre()+" eliminado");
        notificacionesDTO.setTipo("EVENTO");
        notificacionProducer.enviarNotificacion(notificacionesDTO);
        // Luego eliminamos
        eventoRepository.delete(evento);

        return "Evento eliminado correctamente";
    }

    public EventoDTO actualizarEvento(Long id, EventoDTO dto) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No existe evento con ID: " + id));

        Ciudad ciudad = ciudadRepository.findById(dto.getIdCiudad())
                .orElseThrow(() -> new RuntimeException("No existe ciudad con ID: " + dto.getIdCiudad()));

        // Actualizar campos
        evento.setNombre(dto.getNombre());
        evento.setCiudad(ciudad);
        evento.setEstablecimiento(dto.getEstablecimiento());
        evento.setFecha(dto.getFecha());
        evento.setHora(dto.getHora());
        evento.setCapacidad(dto.getCapacidad());
        evento.setImagenUrl(dto.getImagenUrl());

        // Guardar
        Evento actualizado = eventoRepository.save(evento);

        // Enviar evento actualizado por la cola
        eventoProductor.enviarEvento(new EventoColaDTO(
                actualizado.getIdEvento(),
                actualizado.getNombre(),
                ciudad.getNombre(),
                actualizado.getEstablecimiento(),
                actualizado.getFecha(),
                actualizado.getHora(),
                actualizado.getCapacidad(),
                "EDITAR"
        ));
        log.info("Evento actualizado correctamente");
        NotificacionesDTO  notificacionesDTO = new NotificacionesDTO();
        notificacionesDTO.setMensaje(actualizado.getNombre()+" actualizado");
        notificacionesDTO.setTipo("EVENTO");
        notificacionProducer.enviarNotificacion(notificacionesDTO);

        return mapToDTO(actualizado);
    }


    private EventoDTO mapToDTO(Evento evento) {
        EventoDTO dto = new EventoDTO();
        dto.setNombre(evento.getNombre());
        dto.setIdCiudad(evento.getCiudad().getId());
        dto.setEstablecimiento(evento.getEstablecimiento());
        dto.setFecha(evento.getFecha());
        dto.setHora(evento.getHora());
        dto.setCapacidad(evento.getCapacidad());
        dto.setImagenUrl(evento.getImagenUrl());
        return dto;
    }
}
