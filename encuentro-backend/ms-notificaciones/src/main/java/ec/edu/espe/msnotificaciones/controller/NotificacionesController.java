package ec.edu.espe.msnotificaciones.controller;

import ec.edu.espe.msnotificaciones.dto.NotificacionDTO;
import ec.edu.espe.msnotificaciones.dto.ResponseDto;
import ec.edu.espe.msnotificaciones.entity.Notificacion;
import ec.edu.espe.msnotificaciones.service.NotificacionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    @GetMapping("/ultimas")
    public ResponseEntity<ResponseDto> getUltimasNotificaciones(){
        List<Notificacion> notificaciones = notificacionService.obtenerUltimasNotificaciones();
        return ResponseEntity.ok(new ResponseDto("Notificaciones obtenidas exitosamente", notificaciones));
    }

    @GetMapping("/paginadas")
    public ResponseEntity<ResponseDto> getNotificacionesPaginadas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Notificacion> notificacionesPage = notificacionService.obtenerNotificacionesPaginadas(pageable);
        
        return ResponseEntity.ok(new ResponseDto("Notificaciones paginadas obtenidas exitosamente", notificacionesPage));
    }


}
