package ec.edu.espe.apigateway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class SwaggerController {

    @Autowired
    private DiscoveryClient discoveryClient;

    private final RestTemplate restTemplate = new RestTemplate();
    
    @GetMapping("/health-services")
    public ResponseEntity<Map<String, Object>> healthServices() {
        Map<String, Object> response = new HashMap<>();
        List<String> services = discoveryClient.getServices();
        response.put("discoveredServices", services);
        
        Map<String, Object> serviceStatus = new HashMap<>();
        services.forEach(serviceName -> {
            List<ServiceInstance> instances = discoveryClient.getInstances(serviceName);
            serviceStatus.put(serviceName, instances.size() + " instances");
        });
        response.put("serviceStatus", serviceStatus);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping(value = {"/docs", "/swagger", "/api-docs"})
    public ResponseEntity<String> swaggerRedirect() {
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>API Gateway - Documentación</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 50px; background: #f5f5f5; }
                    .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #2c3e50; }
                    .option { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                    .option h3 { margin: 0 0 10px 0; color: #34495e; }
                    a { color: #3498db; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    .code { background: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🌐 API Gateway - Sistema de Eventos</h1>
                    <p>La documentación Swagger está disponible a través de las siguientes opciones:</p>
                    
                    <div class="option">
                        <h3>📋 Opción 1: Swagger Editor Online</h3>
                        <p>1. Ve a <a href="https://editor.swagger.io/" target="_blank">https://editor.swagger.io/</a></p>
                        <p>2. Carga la URL de documentación:</p>
                        <div class="code">http://localhost:8000/v3/api-docs</div>
                    </div>
                    
                    <div class="option">
                        <h3>🔗 Opción 2: Documentación JSON directa</h3>
                        <p><a href="/v3/api-docs" target="_blank">Ver documentación completa en JSON</a></p>
                        <p>Contiene todos los endpoints de los microservicios agregados</p>
                    </div>
                    
                    <div class="option">
                        <h3>💡 Opción 3: Microservicios individuales</h3>
                        <p>Cada microservicio tiene su propia interfaz Swagger:</p>
                        <ul>
                            <li>ms-autenticacion: <code>http://localhost:[puerto]/swagger-ui.html</code></li>
                            <li>ms-eventos: <code>http://localhost:[puerto]/swagger-ui.html</code></li>
                            <li>ms-reportes: <code>http://localhost:[puerto]/swagger-ui.html</code></li>
                            <li>ms-notificaciones: <code>http://localhost:[puerto]/swagger-ui.html</code></li>
                            <li>tickets: <code>http://localhost:[puerto]/swagger-ui.html</code></li>
                        </ul>
                    </div>
                    
                    <div class="option">
                        <h3>🔍 Opción 4: Información de servicios</h3>
                        <p><a href="/health-services">Ver servicios disponibles y sus estados</a></p>
                    </div>
                </div>
            </body>
            </html>
            """;
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/html")
                .body(html);
    }
    
    

    @GetMapping("/v3/api-docs/swagger-config")
    public ResponseEntity<Map<String, Object>> swaggerConfig() {
        Map<String, Object> config = new HashMap<>();
        List<Map<String, String>> urls = new ArrayList<>();
        
        Map<String, String> mainApi = new HashMap<>();
        mainApi.put("name", "Sistema de Eventos - Agregado");
        mainApi.put("url", "/v3/api-docs");
        urls.add(mainApi);
        
        config.put("urls", urls);
        config.put("deepLinking", true);
        config.put("displayOperationId", false);
        config.put("defaultModelsExpandDepth", 1);
        config.put("defaultModelExpandDepth", 1);
        config.put("defaultModelRendering", "example");
        config.put("displayRequestDuration", false);
        config.put("docExpansion", "none");
        config.put("filter", false);
        config.put("operationsSorter", "method");
        config.put("showExtensions", false);
        config.put("tagsSorter", "alpha");
        config.put("tryItOutEnabled", true);
        config.put("validatorUrl", "");
        
        return ResponseEntity.ok(config);
    }

    @GetMapping("/v3/api-docs")
    public ResponseEntity<Map<String, Object>> getAggregatedApiDocs() {
        Map<String, Object> aggregatedDocs = createBaseOpenApiStructure();
        
        // Paths y componentes combinados
        Map<String, Object> allPaths = new HashMap<>();
        Map<String, Object> allSchemas = new HashMap<>();
        Map<String, Object> allSecuritySchemes = new HashMap<>();
        
        // Servicios y sus prefijos en el gateway
        Map<String, String> services = Map.of(
            "ms-autenticacion", "/api/ms-autenticacion",
            "SERVICIO-EVENTOS", "/api/ms-eventos", 
            "SERVICIO-REPORTES", "/api/ms-reportes",
            "ms-notificaciones", "/api/ms-notificaciones",
            "microservicio-tickets", "/api/ms-tickets"
        );
        
        System.out.println("=== Iniciando agregación de documentación Swagger ===");
        
        services.forEach((serviceName, prefix) -> {
            try {
                List<ServiceInstance> instances = discoveryClient.getInstances(serviceName);
                if (!instances.isEmpty()) {
                    ServiceInstance instance = instances.get(0);
                    String apiDocsUrl = "http://" + instance.getHost() + ":" + instance.getPort() + "/v3/api-docs";
                    
                    System.out.println("Obteniendo docs de " + serviceName + " desde: " + apiDocsUrl);
                    
                    Map<String, Object> serviceApiDocs = restTemplate.getForObject(apiDocsUrl, Map.class);
                    if (serviceApiDocs != null) {
                        processServiceApiDocs(serviceApiDocs, prefix, allPaths, allSchemas, allSecuritySchemes);
                        System.out.println("✅ Documentación agregada para " + serviceName);
                    } else {
                        System.out.println("❌ Sin documentación para " + serviceName);
                    }
                } else {
                    System.out.println("❌ No se encontraron instancias para: " + serviceName);
                    addFallbackPaths(serviceName, prefix, allPaths);
                }
            } catch (Exception e) {
                System.err.println("❌ Error obteniendo docs para " + serviceName + ": " + e.getMessage());
                addFallbackPaths(serviceName, prefix, allPaths);
            }
        });
        
        System.out.println("Total de paths agregados: " + allPaths.size());
        
        if (allPaths.isEmpty()) {
            // Si no hay paths, agregar algunos básicos
            addBasicFallbackPaths(allPaths);
        }
        
        aggregatedDocs.put("paths", allPaths);
        
        // Componentes
        Map<String, Object> components = new HashMap<>();
        if (!allSchemas.isEmpty()) {
            components.put("schemas", allSchemas);
        }
        if (!allSecuritySchemes.isEmpty()) {
            components.put("securitySchemes", allSecuritySchemes);
        } else {
            // Security scheme por defecto
            Map<String, Object> bearerAuth = new HashMap<>();
            bearerAuth.put("type", "http");
            bearerAuth.put("scheme", "bearer");
            bearerAuth.put("bearerFormat", "JWT");
            bearerAuth.put("description", "JWT token para autenticación");
            components.put("securitySchemes", Map.of("bearerAuth", bearerAuth));
        }
        
        if (!components.isEmpty()) {
            aggregatedDocs.put("components", components);
        }
        
        // Security global
        List<Map<String, List<String>>> security = new ArrayList<>();
        Map<String, List<String>> bearerAuth = new HashMap<>();
        bearerAuth.put("bearerAuth", new ArrayList<>());
        security.add(bearerAuth);
        aggregatedDocs.put("security", security);
        
        return ResponseEntity.ok(aggregatedDocs);
    }
    
    private Map<String, Object> createBaseOpenApiStructure() {
        Map<String, Object> docs = new HashMap<>();
        docs.put("openapi", "3.0.1");
        
        Map<String, Object> info = Map.of(
            "title", "Sistema de Eventos - API Gateway",
            "description", "Documentación centralizada de todos los microservicios del Sistema de Eventos",
            "version", "1.0.0",
            "contact", Map.of(
                "name", "Sistema de Eventos",
                "email", "contacto@eventos.com"
            )
        );
        docs.put("info", info);
        
        docs.put("servers", List.of(
            Map.of("url", "http://localhost:8000", "description", "API Gateway")
        ));
        
        return docs;
    }
    
    private void processServiceApiDocs(Map<String, Object> serviceApiDocs, String prefix, 
                                     Map<String, Object> allPaths, Map<String, Object> allSchemas, 
                                     Map<String, Object> allSecuritySchemes) {
        
        // Procesar paths
        Map<String, Object> paths = (Map<String, Object>) serviceApiDocs.get("paths");
        if (paths != null && !paths.isEmpty()) {
            paths.forEach((path, pathItem) -> {
                allPaths.put(prefix + path, pathItem);
            });
            System.out.println("Agregados " + paths.size() + " paths con prefijo " + prefix);
        }
        
        // Procesar components
        Map<String, Object> components = (Map<String, Object>) serviceApiDocs.get("components");
        if (components != null) {
            Map<String, Object> schemas = (Map<String, Object>) components.get("schemas");
            if (schemas != null) {
                allSchemas.putAll(schemas);
            }
            
            Map<String, Object> securitySchemes = (Map<String, Object>) components.get("securitySchemes");
            if (securitySchemes != null) {
                allSecuritySchemes.putAll(securitySchemes);
            }
        }
    }
    
    private void addFallbackPaths(String serviceName, String prefix, Map<String, Object> allPaths) {
        System.out.println("Agregando paths de respaldo para " + serviceName);
        switch (serviceName) {
            case "ms-autenticacion":
                addBasicPath(allPaths, prefix + "/api/auth/login", "post", "Login de usuario", "Autenticación");
                addBasicPath(allPaths, prefix + "/api/auth/register", "post", "Registro de usuario", "Autenticación");
                break;
            case "SERVICIO-EVENTOS":
                addBasicPath(allPaths, prefix + "/api/eventos", "get", "Listar eventos", "Eventos");
                addBasicPath(allPaths, prefix + "/api/eventos", "post", "Crear evento", "Eventos");
                addBasicPath(allPaths, prefix + "/api/ciudades", "get", "Listar ciudades", "Ciudades");
                break;
            case "SERVICIO-REPORTES":
                addBasicPath(allPaths, prefix + "/api/reportes", "get", "Listar reportes", "Reportes");
                addBasicPath(allPaths, prefix + "/api/reportes", "post", "Crear reporte", "Reportes");
                break;
            case "ms-notificaciones":
                addBasicPath(allPaths, prefix + "/api/notificaciones", "get", "Listar notificaciones", "Notificaciones");
                break;
            case "microservicio-tickets":
                addBasicPath(allPaths, prefix + "/api/tickets-clientes", "get", "Listar tickets", "Tickets");
                addBasicPath(allPaths, prefix + "/api/categorias-tickets", "get", "Listar categorías", "Tickets");
                break;
        }
    }
    
    private void addBasicFallbackPaths(Map<String, Object> allPaths) {
        System.out.println("Agregando paths básicos de respaldo");
        addBasicPath(allPaths, "/api/ms-autenticacion/api/auth/login", "post", "Login de usuario", "Autenticación");
        addBasicPath(allPaths, "/api/ms-autenticacion/api/auth/register", "post", "Registro de usuario", "Autenticación");
        addBasicPath(allPaths, "/api/ms-eventos/api/eventos", "get", "Listar eventos", "Eventos");
        addBasicPath(allPaths, "/api/ms-reportes/api/reportes", "get", "Listar reportes", "Reportes");
        addBasicPath(allPaths, "/api/ms-notificaciones/api/notificaciones", "get", "Listar notificaciones", "Notificaciones");
        addBasicPath(allPaths, "/api/ms-tickets/api/tickets-clientes", "get", "Listar tickets", "Tickets");
    }
    
    private void addBasicPath(Map<String, Object> allPaths, String path, String method, String summary, String tag) {
        Map<String, Object> pathItem = new HashMap<>();
        Map<String, Object> operation = new HashMap<>();
        
        operation.put("summary", summary);
        operation.put("tags", List.of(tag));
        operation.put("responses", Map.of(
            "200", Map.of("description", "Operación exitosa"),
            "400", Map.of("description", "Solicitud inválida"),
            "401", Map.of("description", "No autorizado"),
            "500", Map.of("description", "Error interno del servidor")
        ));
        
        pathItem.put(method, operation);
        allPaths.put(path, pathItem);
    }
}