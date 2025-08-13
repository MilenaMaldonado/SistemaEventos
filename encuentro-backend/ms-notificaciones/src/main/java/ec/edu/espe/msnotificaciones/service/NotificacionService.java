package ec.edu.espe.msnotificaciones.service;


import ec.edu.espe.msnotificaciones.DTO.NotificacionesDTO;
import ec.edu.espe.msnotificaciones.entity.Notificacion;
import ec.edu.espe.msnotificaciones.repository.NotificacionesRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class NotificacionService {

    @Autowired
    private NotificacionesRepository notificacionesRepository;

    public List<Notificacion> listarNotificaciones(){
        log.info("Listando notificaciones");
        return notificacionesRepository.findAll();
    }

    public List<Notificacion> obtenerUltimasNotificaciones(){
        log.info("Obteniendo las últimas 10 notificaciones");
        return notificacionesRepository.findTop10ByOrderByIdDesc();
    }

    public Page<Notificacion> obtenerNotificacionesPaginadas(Pageable pageable){
        log.info("Obteniendo notificaciones paginadas - página: {}, tamaño: {}", pageable.getPageNumber(), pageable.getPageSize());
        return notificacionesRepository.findAllByOrderByIdDesc(pageable);
    }

    public Notificacion guardarNotificacion(NotificacionesDTO notificacionesDTO){
        Notificacion n = new Notificacion();
        n.setMensaje(notificacionesDTO.getMensaje());
        n.setTipo(notificacionesDTO.getTipo());
        notificacionesRepository.save(n);
        return n;
    }

}
