
package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.model.Servicio;
import com.sunkku.sistema.kihonsystem.service.ServicioService;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioService servicioService;

    public ServicioController(ServicioService servicioService) {
        this.servicioService = servicioService;
    }

    // LISTAR TODOS
    @GetMapping
    public ResponseEntity<List<Servicio>> listarTodas() {
        return ResponseEntity.ok(servicioService.listarTodas());
    }

    // BUSCAR POR ID
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Servicio> buscarPorId(@PathVariable Long id) {
        return servicioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // BUSCAR POR NOMBRE
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombre(
            @RequestParam String nombre) {
        try {
            return ResponseEntity.ok(
                    servicioService.buscarPorNombre(nombre));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // BUSCAR POR CÓDIGO
    @GetMapping("/buscar/codigo/{codigo}")
    public ResponseEntity<?> buscarPorCodigo(
            @PathVariable String codigo) {
        return servicioService.buscarPorCodigo(codigo)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // BUSCAR POR CATEGORÍA
    @GetMapping("/buscar/categoria/{categoriaId}")
    public ResponseEntity<?> buscarPorCategoria(
            @PathVariable Long categoriaId) {
        try {
            return ResponseEntity.ok(
                    servicioService.buscarPorCategoria(categoriaId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // BUSCAR POR ESTADO
    @GetMapping("/buscar/estado/{estado}")
    public ResponseEntity<?> buscarPorEstado(
            @PathVariable String estado) {
        try {
            return ResponseEntity.ok(
                    servicioService.buscarPorEstado(estado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // CREAR
    @PostMapping
    public ResponseEntity<?> crear(
            @Valid @RequestBody Servicio servicio) {
        try {
            return ResponseEntity.ok(servicioService.guardar(servicio));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // ACTUALIZAR
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Servicio servicio) {

        var existente = servicioService.buscarPorId(id);

        if (existente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Servicio servicioExistente = existente.get();

        servicioExistente.setCategoria(servicio.getCategoria());
        servicioExistente.setCodigo(servicio.getCodigo());
        servicioExistente.setNombre(servicio.getNombre());
        servicioExistente.setDescripcion(servicio.getDescripcion());
        servicioExistente.setPrecio(servicio.getPrecio());
        servicioExistente.setDuracionMinutos(
                servicio.getDuracionMinutos());
        servicioExistente.setEstado(servicio.getEstado());

        try {
            return ResponseEntity.ok(
                    servicioService.guardar(servicioExistente));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // ELIMINAR
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            servicioService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }
}