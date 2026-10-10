
package com.sunkku.sistema.kihonsystem.security;

import com.sunkku.sistema.kihonsystem.model.Usuario;
import com.sunkku.sistema.kihonsystem.repository.UsuarioRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(
            UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado"));

        String nombreRol = usuario.getRol().getNombre();

        boolean cuentaActiva = "ACTIVO".equalsIgnoreCase(usuario.getEstado());

        return User.builder()
                .username(usuario.getUsername())
                .password(usuario.getPassword())
                .authorities(List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_" + nombreRol)))
                .disabled(!cuentaActiva)
                .build();
    }
}