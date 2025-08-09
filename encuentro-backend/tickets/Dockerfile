# Usar imagen base de Java 21
FROM openjdk:21

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el .jar compilado al contenedor
COPY target/*.jar app.jar

# Comando que se ejecuta al iniciar el contenedor
ENTRYPOINT ["java", "-jar", "app.jar"]
