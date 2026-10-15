
package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.Usuario;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AutenticacionService {

    private final UsuarioService usuarioService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AutenticacionService(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public boolean validarCredenciales(
            String username,
            String password) {

        if (username == null || username.isBlank()
                || password == null || password.isBlank()) {
            return false;
        }

        Usuario usuario = usuarioService
                .buscarPorUsername(username)
                .orElse(null);

        if (usuario == null) {
            return false;
        }

        if (!"ACTIVO".equalsIgnoreCase(usuario.getEstado())) {
            return false;
        }

        return passwordEncoder.matches(
                password,
                usuario.getPassword());
    }
}