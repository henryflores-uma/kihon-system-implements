package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.model.Cliente;
import com.sunkku.sistema.kihonsystem.service.ClienteService;
import com.sunkku.sistema.kihonsystem.service.PersonaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;
    private final PersonaService personaService;

    public ClienteController(
            ClienteService clienteService,
            PersonaService personaService) {
        this.clienteService = clienteService;
        this.personaService = personaService;
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarTodas() {
        return ResponseEntity.ok(clienteService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Cliente cliente) {

        if (cliente.getPersona() == null
                || cliente.getPersona().getId() == null) {
            return ResponseEntity.badRequest()
                    .body("Debe indicar el ID de la persona.");
        }

        Long personaId = cliente.getPersona().getId();

        var personaEncontrada = personaService.buscarPorId(personaId);

        if (personaEncontrada.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("La persona indicada no existe.");
        }

        if (clienteService.existePorPersonaId(personaId)) {
            return ResponseEntity.badRequest()
                    .body("Esta persona ya está registrada como cliente.");
        }

        cliente.setPersona(personaEncontrada.get());

        if (cliente.getEstado() == null
                || cliente.getEstado().isBlank()) {
            cliente.setEstado("ACTIVO");
        }

        cliente.setId(null);

        Cliente guardado = clienteService.guardar(cliente);

        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody Cliente datos) {

        var clienteEncontrado = clienteService.buscarPorId(id);

        if (clienteEncontrado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Cliente existente = clienteEncontrado.get();

        if (datos.getEstado() != null
                && !datos.getEstado().isBlank()) {
            existente.setEstado(datos.getEstado());
        }

        return ResponseEntity.ok(clienteService.guardar(existente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(cliente -> {
                    clienteService.eliminar(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}