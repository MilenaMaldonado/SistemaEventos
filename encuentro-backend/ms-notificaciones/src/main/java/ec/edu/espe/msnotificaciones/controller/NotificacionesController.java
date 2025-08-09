package ec.edu.espe.msnotificaciones.controller;

import ec.edu.espe.msnotificaciones.dto.NotificacionDTO;
import ec.edu.espe.msnotificaciones.dto.ResponseDto;
import ec.edu.espe.msnotificaciones.entity.Notificacion;
import ec.edu.espe.msnotificaciones.service.NotificacionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionesController {
    @Autowired
    private NotificacionService notificacionService;

    @GetMapping
    public ResponseEntity<ResponseDto> getNotificaciones(){
        List<Notificacion> notificaciones = notificacionService.listarNotificaciones();
        return ResponseEntity.ok(new ResponseDto("Notificaciones obtenidas exitosamente", notificaciones));
    }


}
