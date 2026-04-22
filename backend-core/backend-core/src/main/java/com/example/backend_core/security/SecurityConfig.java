package com.example.backend_core.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public routes
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/lessons/**").permitAll()
                        // .requestMatchers("/api/topics/**").permitAll()
                        // Sentences: ghi cần đăng nhập, đọc công khai
                        .requestMatchers(HttpMethod.POST, "/api/sentences/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/sentences/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/sentences/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/sentences/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/topics/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/topics/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/topics/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/topics/**").permitAll()
                        // Protected routes
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedOrigins(List.of(
                "http://localhost:5173", // dev local
                "http://localhost" // Docker
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}