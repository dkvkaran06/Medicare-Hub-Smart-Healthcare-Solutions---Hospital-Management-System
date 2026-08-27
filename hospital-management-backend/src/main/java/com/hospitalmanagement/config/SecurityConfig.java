package com.hospitalmanagement.config;

import javax.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.hospitalmanagement.security.JwtAuthenticationFilter;
import com.hospitalmanagement.security.JwtService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Picks up the corsConfigurationSource bean (CorsConfig). Kept as the
                // single CORS source so we never emit duplicate Allow-Origin headers.
                .cors(Customizer.withDefaults())
                // Stateless JWT API: no CSRF tokens, no server session.
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Anonymous requests to protected endpoints must return 401, not
                // Spring's default 403, so the frontend's expired-token handler fires.
                .exceptionHandling(ex -> ex.authenticationEntryPoint(
                        (request, response, authException) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED)))
                .authorizeHttpRequests(auth -> auth
                        .antMatchers(HttpMethod.OPTIONS, "/**").permitAll() // CORS preflight
                        .antMatchers("/", "/favicon.ico", "/api/auth/**", "/healthz", "/error").permitAll()

                        // Departments: any signed-in user may read; only admins may modify.
                        .antMatchers(HttpMethod.GET, "/api/departments/**").authenticated()
                        .antMatchers("/api/departments/**").hasRole("ADMIN")

                        // Patients: full list is staff-only; a patient reaches their own
                        // record via /by-email or /{id} (ownership enforced in the controller).
                        .antMatchers(HttpMethod.GET, "/api/patients").hasAnyRole("ADMIN", "DOCTOR")
                        .antMatchers(HttpMethod.GET, "/api/patients/by-email", "/api/patients/*").authenticated()
                        .antMatchers("/api/patients/**").hasRole("ADMIN")

                        // Doctors are a directory: readable by any signed-in user, writable by admins.
                        .antMatchers(HttpMethod.GET, "/api/doctors/**").authenticated()
                        .antMatchers("/api/doctors/**").hasRole("ADMIN")

                        // Appointments: read scoped to the caller in the controller; writes by role.
                        .antMatchers(HttpMethod.GET, "/api/appointments/**").authenticated()
                        .antMatchers(HttpMethod.POST, "/api/appointments/**").hasRole("ADMIN")
                        .antMatchers(HttpMethod.PUT, "/api/appointments/**").hasAnyRole("ADMIN", "DOCTOR")
                        .antMatchers(HttpMethod.DELETE, "/api/appointments/**").hasRole("ADMIN")

                        // Medical records: read scoped in the controller; doctors/admins may
                        // create+update, only admins may delete.
                        .antMatchers(HttpMethod.GET, "/api/medical-records/**").authenticated()
                        .antMatchers(HttpMethod.DELETE, "/api/medical-records/**").hasRole("ADMIN")
                        .antMatchers("/api/medical-records/**").hasAnyRole("ADMIN", "DOCTOR")

                        // Bills: read scoped in the controller; only admins may modify.
                        .antMatchers(HttpMethod.GET, "/api/bills/**").authenticated()
                        .antMatchers("/api/bills/**").hasRole("ADMIN")

                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthenticationFilter(jwtService),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
