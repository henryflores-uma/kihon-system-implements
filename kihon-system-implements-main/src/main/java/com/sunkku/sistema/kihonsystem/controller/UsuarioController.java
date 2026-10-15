package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.model.Usuario;
import com.sunkku.sistema.kihonsystem.service.UsuarioService;
import com.sunkku.sistema.kihonsystem.service.PersonaService;
import com.sunkku.sistema.kihonsystem.service.RolService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PersonaService personaService;
    private final RolService rolService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioController(
            UsuarioService usuarioService,
            PersonaService personaService,
            RolService rolService) {
        this.usuarioService = usuarioService;
        this.personaService = personaService;
        this.rolService = rolService;
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodas() {
        return ResponseEntity.ok(usuarioService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Usuario usuario) {

        if (usuario.getUsername() == null
                || usuario.getUsername().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("El nombre de usuario es obligatorio.");
        }

        if (usuarioService.existePorUsername(usuario.getUsername())) {
            return ResponseEntity.badRequest()
                    .body("El nombre de usuario ya está registrado.");
        }

        if (usuario.getPassword() == null
                || usuario.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("La contraseña es obligatoria.");
        }

        if (usuario.getPersona() == null
                || usuario.getPersona().getId() == null) {
            return ResponseEntity.badRequest()
                    .body("Debe indicar el ID de la persona.");
        }

        if (usuario.getRol() == null
                || usuario.getRol().getId() == null) {
            return ResponseEntity.badRequest()
                    .body("Debe indicar el ID del rol.");
        }

        var persona = personaService.buscarPorId(
                usuario.getPersona().getId());

        if (persona.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("La persona indicada no existe.");
        }

        var rol = rolService.buscarPorId(
                usuario.getRol().getId());

        if (rol.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("El rol indicado no existe.");
        }

        // Una persona solo puede tener una cuenta de usuario.
        boolean personaYaTieneUsuario = usuarioService.listarTodas().stream()
                .anyMatch(u -> u.getPersona().getId()
                        .equals(persona.get().getId()));

        if (personaYaTieneUsuario) {
            return ResponseEntity.badRequest()
                    .body("Esta persona ya tiene una cuenta de usuario.");
        }

        usuario.setPersona(persona.get());
        usuario.setRol(rol.get());
        usuario.setPassword(
                passwordEncoder.encode(usuario.getPassword()));

        if (usuario.getEstado() == null
                || usuario.getEstado().isBlank()) {
            usuario.setEstado("ACTIVO");
        }

        usuario.setId(null);

        return ResponseEntity.ok(usuarioService.guardar(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody Usuario datos) {

        var encontrado = usuarioService.buscarPorId(id);

        if (encontrado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario existente = encontrado.get();

        if (datos.getUsername() != null
                && !datos.getUsername().isBlank()
                && !datos.getUsername().equals(existente.getUsername())) {

            if (usuarioService.existePorUsername(datos.getUsername())) {
                return ResponseEntity.badRequest()
                        .body("El nombre de usuario ya está registrado.");
            }

            existente.setUsername(datos.getUsername());
        }

        if (datos.getPassword() != null
                && !datos.getPassword().isBlank()) {
            existente.setPassword(
                    passwordEncoder.encode(datos.getPassword()));
        }

        if (datos.getEstado() != null
                && !datos.getEstado().isBlank()) {
            existente.setEstado(datos.getEstado());
        }

        if (datos.getRol() != null && datos.getRol().getId() != null) {
            var rol = rolService.buscarPorId(datos.getRol().getId());

            if (rol.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("El rol indicado no existe.");
            }

            existente.setRol(rol.get());
        }

        return ResponseEntity.ok(usuarioService.guardar(existente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return usuarioService.buscarPorId(id)
                .map(usuario -> {
                    usuarioService.eliminar(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}