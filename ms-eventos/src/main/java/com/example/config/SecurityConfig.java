package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors() // Habilitar CORS
            .and()
            .csrf().disable() // Deshabilitar CSRF si no es necesario
            .authorizeRequests()
            .antMatchers("/api/public/**").permitAll() // Rutas públicas
            .anyRequest().authenticated(); // Rutas protegidas
        return http.build();
    }
}
