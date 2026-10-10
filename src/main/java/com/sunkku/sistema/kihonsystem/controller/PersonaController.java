
package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.model.Persona;
import com.sunkku.sistema.kihonsystem.service.PersonaService;
import com.sunkku.sistema.kihonsystem.service.TipoDocumentoService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    private final PersonaService personaService;
    private final TipoDocumentoService tipoDocumentoService;

    public PersonaController(
            PersonaService personaService,
            TipoDocumentoService tipoDocumentoService) {
        this.personaService = personaService;
        this.tipoDocumentoService = tipoDocumentoService;
    }

    @GetMapping
    public ResponseEntity<List<Persona>> listarTodas() {
        return ResponseEntity.ok(personaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Persona> buscarPorId(
            @PathVariable Long id) {
        return personaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> guardar(
            @Valid @RequestBody Persona persona) {

        if (persona.getTipoDocumento() == null
                || persona.getTipoDocumento().getId() == null) {
            return ResponseEntity.badRequest()
                    .body("Debe indicar el ID del tipo de documento.");
        }

        Long tipoId = persona.getTipoDocumento().getId();

        var tipoEncontrado = tipoDocumentoService.buscarPorId(tipoId);

        if (tipoEncontrado.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("El tipo de documento indicado no existe.");
        }

        persona.setTipoDocumento(tipoEncontrado.get());

        return ResponseEntity.ok(personaService.guardar(persona));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Persona datos) {

        var personaEncontrada = personaService.buscarPorId(id);

        if (personaEncontrada.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (datos.getTipoDocumento() == null
                || datos.getTipoDocumento().getId() == null) {
            return ResponseEntity.badRequest()
                    .body("Debe indicar el ID del tipo de documento.");
        }

        var tipoEncontrado = tipoDocumentoService.buscarPorId(
                datos.getTipoDocumento().getId());

        if (tipoEncontrado.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("El tipo de documento indicado no existe.");
        }

        Persona existente = personaEncontrada.get();

        existente.setNombre(datos.getNombre());
        existente.setApellido(datos.getApellido());
        existente.setTipoDocumento(tipoEncontrado.get());
        existente.setNumeroDocumento(datos.getNumeroDocumento());
        existente.setTelefono(datos.getTelefono());
        existente.setCorreo(datos.getCorreo());
        existente.setFechaNacimiento(datos.getFechaNacimiento());
        existente.setGenero(datos.getGenero());
        existente.setDireccion(datos.getDireccion());
        existente.setFoto(datos.getFoto());

        return ResponseEntity.ok(personaService.guardar(existente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return personaService.buscarPorId(id)
                .map(persona -> {
                    personaService.eliminar(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}