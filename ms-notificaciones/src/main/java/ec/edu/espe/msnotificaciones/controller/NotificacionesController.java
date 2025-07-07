package ec.edu.espe.msnotificaciones.controller;

import ec.edu.espe.msnotificaciones.entity.Notificacion;
import ec.edu.espe.msnotificaciones.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionesController {
    @Autowired
    private NotificacionService notificacionService;

    @GetMapping
    public List<Notificacion> getNotificaciones(){
        return  notificacionService.listarNotificaciones();
    }
}
