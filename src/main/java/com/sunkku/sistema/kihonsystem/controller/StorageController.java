package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.service.SupabaseStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/storage")
public class StorageController {

    private final SupabaseStorageService storageService;

    public StorageController(SupabaseStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/productos/{productoId}/imagen")
    public ResponseEntity<Map<String, String>> subirImagenProducto(
            @PathVariable Long productoId,
            @RequestParam("archivo") MultipartFile archivo) {

        try {
            String ruta = storageService.subirImagenProducto(
                    archivo,
                    productoId);

            return ResponseEntity.ok(
                    Map.of(
                            "mensaje", "Imagen subida correctamente",
                            "ruta", ruta));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "mensaje", "Error al subir la imagen",
                            "error", e.getMessage()));
        }
    }

    //
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> comprobarConfiguracion() {

        return ResponseEntity.ok(
                Map.of(
                        "supabaseUrl",
                        storageService.getSupabaseUrl(),
                        "bucket",
                        storageService.getBucket()));
    }
}