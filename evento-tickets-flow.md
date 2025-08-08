# 🎯 Flujo Completo: Eventos → RabbitMQ → Tickets

## ✅ Flujo End-to-End Implementado

### 🔄 Arquitectura del Flujo

```
[ms-eventos] ---(EventoColaDTO)---> [eventos.cola] ---> [tickets] ---> [evento_disponible]
    CREATE                           RabbitMQ            CONSUMER        TABLE
    UPDATE                                               LISTENER
    DELETE
```

## 📋 1. Microservicio Eventos (Producer)

### EventoService.java
```java
// Al CREAR evento
eventoProductor.enviarEvento(new EventoColaDTO(
    guardado.getIdEvento(),    // ID del evento recién creado
    guardado.getCapacidad()    // Capacidad del evento
));

// Al ACTUALIZAR evento  
eventoProductor.enviarEvento(new EventoColaDTO(
    actualizado.getIdEvento(),
    actualizado.getCapacidad()
));

// Al ELIMINAR evento
eventoProductor.enviarEvento(new EventoColaDTO(
    evento.getIdEvento(),
    evento.getCapacidad()
));
```

### EventoProducer.java
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

## 🐰 2. RabbitMQ (Message Queue)

### Cola Configurada:
- **Nombre**: `eventos.cola`
- **Tipo**: Durable (persistente)
- **Mensaje JSON**:
```json
{
    "idEvento": 123,
    "capacidad": 500
}
```

## 🎫 3. Microservicio Tickets (Consumer)

### EventoConsumer.java ✅ NUEVO
```java
@Component
@RabbitListener(queues = "eventos.cola")
public void procesarEvento(String mensaje) {
    // 1. Deserializar JSON
    EventoColaDTO eventoColaDTO = objectMapper.readValue(mensaje, EventoColaDTO.class);
    
    // 2. Verificar si existe
    EventoDisponible existente = eventoDisponibleService.findById(eventoColaDTO.getIdEvento());
    
    if (existente != null) {
        // ACTUALIZAR capacidad
        existente.setCapacidad(eventoColaDTO.getCapacidad());
        eventoDisponibleService.save(existente);
    } else {
        // CREAR nuevo evento disponible
        EventoDisponible nuevo = new EventoDisponible();
        nuevo.setIdEvento(eventoColaDTO.getIdEvento());
        nuevo.setCapacidad(eventoColaDTO.getCapacidad());
        eventoDisponibleService.save(nuevo);
    }
}
```

### Tabla evento_disponible
```sql
CREATE TABLE evento_disponible (
    id_evento BIGINT PRIMARY KEY,
    capacidad INTEGER NOT NULL
);
```

### Modelo EventoDisponible.java
```java
@Entity
@Table(name = "evento_disponible")
public class EventoDisponible {
    @Id
    private Long idEvento;      // PK - ID del evento desde ms-eventos
    private int capacidad;      // Capacidad disponible para tickets
}
```

## 🔧 4. Configuraciones

### ms-eventos - RabbitMQConfig.java
```java
@Bean
public Queue eventosCola() {
    return QueueBuilder.durable("eventos.cola").build();
}
```

### tickets - RabbitMQConfig.java
```java
@Bean
public Queue eventoQueue() {
    return new Queue("eventos.cola", true); // durable = true
}

@Bean
public ObjectMapper objectMapper() {
    return new ObjectMapper();
}
```

### Propiedades RabbitMQ (Ambos microservicios)
```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=admin
spring.rabbitmq.password=admin
```

## 🧪 5. Flujo de Prueba End-to-End

### Paso 1: Crear Evento (ms-eventos)
```bash
curl -X POST "http://localhost:8000/api/ms-eventos/api/eventos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nombre": "Concierto Rock 2024",
    "idCiudad": 1,
    "establecimiento": "Estadio Nacional",
    "fecha": "2024-12-31",
    "hora": "20:00:00", 
    "capacidad": 5000,
    "imagenUrl": "https://ejemplo.com/imagen.jpg"
  }'
```

### Paso 2: Mensaje en RabbitMQ
```json
{
    "idEvento": 1,
    "capacidad": 5000
}
```

### Paso 3: Verificar en Tickets
```bash
# Ver eventos disponibles
curl "http://localhost:8000/api/ms-tickets/api/eventos-disponibles" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Resultado Esperado:
```json
{
    "mensaje": "Eventos disponibles obtenidos exitosamente",
    "respuesta": [
        {
            "idEvento": 1,
            "capacidad": 5000
        }
    ]
}
```

## 📊 6. Logs Esperados

### ms-eventos:
```
INFO  - Evento creado
INFO  - Enviando evento a cola: ID=1, Capacidad=5000
```

### tickets:
```
INFO  - Mensaje recibido de eventos.cola: {"idEvento":1,"capacidad":5000}
INFO  - Creando nuevo evento disponible: ID=1, Capacidad=5000
INFO  - ✅ Evento disponible procesado exitosamente: ID=1, Capacidad=5000
```

## ✅ 7. Estados de Operación

### CREATE Event:
- ✅ Crea en ms-eventos
- ✅ Envía mensaje a cola
- ✅ Crea en evento_disponible (tickets)

### UPDATE Event:
- ✅ Actualiza en ms-eventos
- ✅ Envía mensaje a cola
- ✅ Actualiza capacidad en evento_disponible

### DELETE Event:
- ✅ Envía mensaje antes de eliminar
- ✅ Elimina de ms-eventos
- ✅ Mantiene registro en evento_disponible (para histórico de tickets)

## 🔍 8. Debugging

### Verificar Cola RabbitMQ:
- **Management UI**: http://localhost:15672
- **Usuario**: admin / admin
- **Cola**: `eventos.cola`

### Verificar Base de Datos:
```sql
-- Verificar eventos disponibles
SELECT * FROM evento_disponible;

-- Verificar con JOIN (si necesitas info completa)
SELECT ed.id_evento, ed.capacidad, 'Info desde ms-eventos via API'
FROM evento_disponible ed;
```

## 🎯 Beneficios del Flujo

1. **Desacoplamiento**: ms-eventos y tickets no se conocen directamente
2. **Consistencia**: Automáticamente sincroniza eventos disponibles
3. **Escalabilidad**: Múltiples consumidores pueden escuchar la cola
4. **Tolerancia a fallos**: Mensajes persistentes en RabbitMQ
5. **Auditoría**: Logs completos del flujo

La implementación está **completa y funcional**. Cada evento CRUD automáticamente se refleja en la tabla evento_disponible del microservicio tickets.