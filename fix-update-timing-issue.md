# 🔧 Fix: Problema de Actualización en Segunda Invocación

## 🚫 Problema Identificado

**Síntoma**: Las actualizaciones de eventos solo se reflejan en la tabla `evento_disponible` después de la **segunda llamada** al endpoint de actualización.

## 🔍 Causa Raíz

### Problema de Transaccionalidad:
```java
// ❌ ANTES (Problemático)
@Transactional
public EventoDTO actualizarEvento(Long id, EventoDTO dto) {
    Evento actualizado = eventoRepository.save(evento);
    
    // 🚫 Mensaje enviado DENTRO de la transacción
    eventoProductor.enviarEvento(new EventoColaDTO(...));
    
    return mapToDTO(actualizado);
    // Transacción se confirma DESPUÉS del return
}
```

**El problema**: El mensaje RabbitMQ se envía **antes** de que se confirme la transacción en la base de datos. Si el consumidor procesa el mensaje muy rápido, puede que aún no vea los cambios confirmados.

## ✅ Solución Implementada

### 1. **Patrón de Eventos Transaccionales**

```java
// ✅ DESPUÉS (Solucionado)
@Transactional
public EventoDTO actualizarEvento(Long id, EventoDTO dto) {
    Evento actualizado = eventoRepository.save(evento);
    
    // ✅ Publicar evento para procesamiento DESPUÉS de la transacción
    EventoColaDTO eventoColaDTO = new EventoColaDTO(
        actualizado.getIdEvento(),
        actualizado.getCapacidad()
    );
    eventPublisher.publishEvent(eventoColaDTO);
    
    return mapToDTO(actualizado);
}
```

### 2. **Servicio Asíncrono Post-Transacción**

```java
@Service
public class EventoAsyncService {
    
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void enviarEventoAColaDespuesDeTransaccion(EventoColaDTO eventoColaDTO) {
        // ✅ Se ejecuta DESPUÉS de confirmar la transacción
        eventoProductor.enviarEvento(eventoColaDTO);
    }
}
```

### 3. **Configuración Asíncrona**

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("EventoAsync-");
        return executor;
    }
}
```

### 4. **Logging Mejorado en Consumer**

```java
@RabbitListener(queues = "eventos.cola")
public void procesarEvento(String mensaje) {
    log.info("📥 Mensaje recibido: {}", mensaje);
    
    EventoDisponible existente = eventoDisponibleService.findById(eventoColaDTO.getIdEvento());
    
    if (existente != null) {
        log.info("📝 Actualizando: ID={}, Capacidad anterior={}, nueva={}", 
                eventoColaDTO.getIdEvento(), existente.getCapacidad(), 
                eventoColaDTO.getCapacidad());
        // Actualizar...
    }
}
```

## 🔄 Flujo Corregido

```
1. [Usuario] ---> PUT /eventos/{id} 
2. [EventoService] ---> @Transactional actualizarEvento()
3. [EventoService] ---> save() en base de datos
4. [EventoService] ---> publishEvent(EventoColaDTO)
5. [Spring] ---> COMMIT transacción
6. [EventoAsyncService] ---> @TransactionalEventListener AFTER_COMMIT
7. [EventoProducer] ---> enviar mensaje a RabbitMQ
8. [TicketsConsumer] ---> procesar mensaje y actualizar evento_disponible
```

## 🎯 Ventajas de la Solución

### ✅ **Consistencia de Datos**
- El mensaje solo se envía **después** de confirmar la transacción
- No hay race conditions entre DB commit y message sending

### ✅ **Ejecución Asíncrona**  
- El envío de mensajes no bloquea la respuesta HTTP
- Mejor performance para el usuario

### ✅ **Robustez**
- Si falla el envío del mensaje, la transacción ya está confirmada
- Separación clara entre persistencia y messaging

### ✅ **Observabilidad**
- Logs detallados en cada paso del flujo
- Fácil debugging de problemas

## 🧪 Prueba del Fix

### Antes del Fix:
```bash
# Primera llamada
PUT /eventos/1 {"capacidad": 3000}
# ❌ evento_disponible aún tiene capacidad anterior

# Segunda llamada  
PUT /eventos/1 {"capacidad": 3000}
# ✅ Ahora sí se actualiza evento_disponible
```

### Después del Fix:
```bash
# Primera llamada
PUT /eventos/1 {"capacidad": 3000}
# ✅ evento_disponible se actualiza inmediatamente
```

## 📋 Archivos Modificados

1. **EventoService.java** - Agregado @Transactional y eventPublisher
2. **EventoAsyncService.java** - NUEVO - Manejo post-transacción
3. **AsyncConfig.java** - NUEVO - Configuración asíncrona  
4. **EventoConsumer.java** - Mejorado logging y error handling

## ✅ Estado Final

El problema de la **segunda invocación** está **resuelto**. Ahora las actualizaciones de capacidad se reflejan **inmediatamente** en la tabla `evento_disponible` sin necesidad de invocar el endpoint múltiples veces.