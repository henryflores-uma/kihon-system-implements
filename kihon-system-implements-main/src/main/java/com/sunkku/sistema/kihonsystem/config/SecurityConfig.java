
package com.sunkku.sistema.kihonsystem.config;

import com.sunkku.sistema.kihonsystem.security.CustomUserDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

        @Bean
        public DaoAuthenticationProvider authenticationProvider(
                        CustomUserDetailsService userDetailsService,
                        PasswordEncoder passwordEncoder) {

                DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);

                provider.setPasswordEncoder(passwordEncoder);
                return provider;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        DaoAuthenticationProvider authenticationProvider)
                        throws Exception {

                http
                                .authenticationProvider(authenticationProvider)

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(
                                                                SessionCreationPolicy.IF_REQUIRED))

                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/", "/login", "/registro",
                                                                "/css/**", "/js/**", "/img/**")
                                                .permitAll()

                                                .requestMatchers("/admin/**")
                                                .hasRole("ADMINISTRADOR")

                                                .requestMatchers("/api/auth/me")
                                                .authenticated()

                                                .anyRequest().authenticated())

                                .formLogin(form -> form
                                                .loginPage("/login")
                                                .loginProcessingUrl("/login")
                                                .defaultSuccessUrl("/admin/admin", true)
                                                .failureUrl("/login?error")
                                                .permitAll())

                                .httpBasic(Customizer.withDefaults())

                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/login?logout")
                                                .invalidateHttpSession(true)
                                                .clearAuthentication(true)
                                                .deleteCookies("JSESSIONID"));

                return http.build();
        }
}