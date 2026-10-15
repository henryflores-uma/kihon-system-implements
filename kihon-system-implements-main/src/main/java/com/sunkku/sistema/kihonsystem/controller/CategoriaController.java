
package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.model.Categoria;
import com.sunkku.sistema.kihonsystem.service.CategoriaService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> listarTodas() {
        return ResponseEntity.ok(categoriaService.listarTodas());
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Long id) {
        return categoriaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPorNombre(
            @RequestParam String nombre) {
        try {
            return categoriaService.buscarPorNombre(nombre)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping("/buscar/parcial")
    public ResponseEntity<?> buscarPorNombreParcial(
            @RequestParam String nombre) {
        try {
            return ResponseEntity.ok(
                    categoriaService.buscarPorNombreParcial(nombre));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping("/buscar/estado/{estado}")
    public ResponseEntity<?> buscarPorEstado(
            @PathVariable String estado) {
        try {
            return ResponseEntity.ok(
                    categoriaService.buscarPorEstado(estado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> guardar(
            @Valid @RequestBody Categoria categoria) {
        try {
            return ResponseEntity.ok(categoriaService.guardar(categoria));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Categoria categoria) {
        try {
            return categoriaService.actualizar(id, categoria)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            if (categoriaService.buscarPorId(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            categoriaService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }
}