# 🎯 Flujo de Eventos con RabbitMQ - Implementado

## ✅ Funcionalidad Completada

### 📋 EventoColaDTO - Simplificado
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoColaDTO {
    private Long idEvento;      // ID del evento creado
    private Integer capacidad;  // Capacidad del evento
}
```

### 🔄 Flujo Principal de Eventos

#### 1. **Crear Evento** (POST /api/eventos)
```java
public EventoDTO crearEvento(EventoDTO dto) {
    // 1. Validar ciudad
    Ciudad ciudad = ciudadRepository.findById(dto.getIdCiudad())...
    
    // 2. Crear y guardar evento
    Evento guardado = eventoRepository.save(evento);
    
    // 3. ✅ ENVIAR A COLA RABBITMQ
    eventoProductor.enviarEvento(new EventoColaDTO(
        guardado.getIdEvento(),    // ID del evento recién creado
        guardado.getCapacidad()    // Capacidad del evento
    ));
    
    // 4. Enviar notificación
    notificacionProducer.enviarNotificacion(...);
    
    return mapToDTO(guardado);
}
```

#### 2. **Actualizar Evento** (PUT /api/eventos/{id})
```java
// También envía a la cola cuando se actualiza un evento
eventoProductor.enviarEvento(new EventoColaDTO(
    actualizado.getIdEvento(),
    actualizado.getCapacidad()
));
```

#### 3. **Eliminar Evento** (DELETE /api/eventos/{id})
```java
// Envía información antes de eliminar
eventoProductor.enviarEvento(new EventoColaDTO(
    evento.getIdEvento(),
    evento.getCapacidad()
));
```

### 🐰 Configuración RabbitMQ

#### Cola Configurada:
- **Nombre**: `eventos.cola`
- **Tipo**: Durable
- **Host**: localhost:5672
- **Credenciales**: admin/admin

#### EventoProducer:
```java
@Component
public class EventoProducer {
    private static final String COLA_EVENTOS = "eventos.cola";
    
    public void enviarEvento(EventoColaDTO eventoColaDTO) {
        String json = objectMapper.writeValueAsString(eventoColaDTO);
        rabbitTemplate.convertAndSend(COLA_EVENTOS, json);
    }
}
```

### 📝 Mensaje JSON Enviado
```json
{
    "idEvento": 123,
    "capacidad": 500
}
```

## 🧪 Cómo Probar

### 1. Crear un Evento (POST):
```bash
curl -X POST "http://localhost:8000/api/ms-eventos/api/eventos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nombre": "Concierto de Rock",
    "idCiudad": 1,
    "establecimiento": "Estadio Nacional",
    "fecha": "2024-12-31",
    "hora": "20:00:00",
    "capacidad": 5000,
    "imagenUrl": "https://ejemplo.com/imagen.jpg"
  }'
```

### 2. Verificar Cola RabbitMQ
- **Management UI**: http://localhost:15672
- **Usuario**: admin
- **Password**: admin
- **Cola a verificar**: `eventos.cola`

### 3. Mensaje Esperado en la Cola:
```json
{
    "idEvento": 1,
    "capacidad": 5000
}
```

## 🔗 Microservicios Relacionados

### Quien Puede Consumir:
1. **ms-tickets**: Para crear eventos disponibles automáticamente
2. **ms-reportes**: Para tracking de eventos
3. **ms-notificaciones**: Ya implementado (recibe notificaciones)
4. **Otros servicios**: Cualquiera que necesite saber cuando se crea/actualiza un evento

### Consumer Ejemplo:
```java
@RabbitListener(queues = "eventos.cola")
public void procesarEvento(String mensaje) {
    try {
        EventoColaDTO evento = objectMapper.readValue(mensaje, EventoColaDTO.class);
        System.out.println("Evento recibido: ID=" + evento.getIdEvento() + 
                          ", Capacidad=" + evento.getCapacidad());
        // Lógica específica del microservicio...
    } catch (Exception e) {
        log.error("Error procesando evento", e);
    }
}
```

## ✅ Estado Final

- ✅ EventoColaDTO simplificado (solo idEvento y capacidad)
- ✅ Cola RabbitMQ "eventos.cola" configurada
- ✅ EventoProducer enviando mensajes
- ✅ Integración completa en CRUD de eventos
- ✅ JSON minimalista para máximo rendimiento
- ✅ Listo para que otros microservicios consuman

La implementación está **completa y funcional**. Cada vez que se crea, actualiza o elimina un evento, se envía automáticamente un mensaje con `idEvento` y `capacidad` a la cola `eventos.cola`.