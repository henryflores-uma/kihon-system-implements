
package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.model.TipoDocumento;
import com.sunkku.sistema.kihonsystem.service.TipoDocumentoService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-documento")
public class TipoDocumentoController {

    private final TipoDocumentoService tipoDocumentoService;

    public TipoDocumentoController(
            TipoDocumentoService tipoDocumentoService) {
        this.tipoDocumentoService = tipoDocumentoService;
    }

    @GetMapping
    public ResponseEntity<List<TipoDocumento>> listarTodas() {
        return ResponseEntity.ok(
                tipoDocumentoService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoDocumento> buscarPorId(
            @PathVariable Long id) {

        return tipoDocumentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TipoDocumento> guardar(
            @Valid @RequestBody TipoDocumento tipoDocumento) {

        TipoDocumento guardado = tipoDocumentoService.guardar(tipoDocumento);

        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoDocumento> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TipoDocumento datos) {

        return tipoDocumentoService.buscarPorId(id)
                .map(existente -> {
                    existente.setNombre(datos.getNombre());

                    TipoDocumento actualizado = tipoDocumentoService.guardar(existente);

                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        return tipoDocumentoService.buscarPorId(id)
                .map(existente -> {
                    tipoDocumentoService.eliminar(id);

                    return ResponseEntity.noContent()
                            .<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}