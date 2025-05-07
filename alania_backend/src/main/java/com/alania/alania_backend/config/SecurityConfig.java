package com.alania.alania_backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource; // injection du bean

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("\n🔒 Initialisation de SecurityFilterChain...");

        http
                .csrf(csrf -> csrf.disable()) // Désactive CSRF
                .cors(cors -> cors.configurationSource(corsConfigurationSource)) // 👈 utilise ta config personnalisée
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 💥 Empêcher la gestion des sessions
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/register/start",
                                "/api/register/verify",
                                "/api/register/resend",
                                "/api/login/start",
                                "/api/login/verify",
                                "/api/access-token/verify",
                                "/api/refresh-token/refresh",
                                "/api/login/sessions",
                                "/api/user/**",
                                "/api/logout",
                                "/api/test",
                                "/ws"
                        ).permitAll() // Autoriser sans authentification
                        .anyRequest().authenticated()
                );

        System.out.println("✅ SecurityFilterChain chargé avec succès !\n\n");
        return http.build();
    }
}
