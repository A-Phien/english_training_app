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
                        .requestMatchers("/api/auth/**", "/error").permitAll()
                        
                        // Lessons: GET is public, POST/PUT/DELETE require ADMIN role
                        .requestMatchers(HttpMethod.GET, "/api/lessons/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/lessons/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/lessons/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/lessons/**").hasRole("ADMIN")

                        // Sentences: GET is public, write requires ADMIN role
                        .requestMatchers(HttpMethod.GET, "/api/sentences/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/sentences/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/sentences/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/sentences/**").hasRole("ADMIN")

                        // Topics: GET is public, write requires ADMIN role
                        .requestMatchers(HttpMethod.GET, "/api/topics/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/topics/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/topics/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/topics/**").hasRole("ADMIN")

                        // Vocabularies: GET is public, write requires ADMIN role
                        .requestMatchers(HttpMethod.GET, "/api/vocabularies/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/vocabularies/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/vocabularies/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vocabularies/**").hasRole("ADMIN")

                        // User vocabulary — cần đăng nhập
                        .requestMatchers("/api/user-vocabulary/**").authenticated()

                        // Upload avatar — cần đăng nhập
                        .requestMatchers(HttpMethod.POST, "/api/users/*/avatar").authenticated()

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
                "http://localhost:5174",
                "http://localhost"       // Docker
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // Cache preflight 1 giờ

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}