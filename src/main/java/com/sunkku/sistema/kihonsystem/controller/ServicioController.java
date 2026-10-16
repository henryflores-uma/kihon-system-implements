
package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.model.Servicio;
import com.sunkku.sistema.kihonsystem.service.ServicioService;
import com.sunkku.sistema.kihonsystem.service.SupabaseStorageService;

import jakarta.validation.Valid;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioService servicioService;
    private final SupabaseStorageService supabaseStorageService;

    public ServicioController(
            ServicioService servicioService,
            SupabaseStorageService supabaseStorageService) {
        this.servicioService = servicioService;
        this.supabaseStorageService = supabaseStorageService;
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
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crear(
            @Valid @RequestPart("servicio") Servicio servicio,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen) {

        try {
            // Primero se guarda para obtener el ID generado.
            Servicio guardado = servicioService.guardar(servicio);

            // La imagen es opcional.
            if (imagen != null && !imagen.isEmpty()) {
                String ruta = subirImagen(
                        imagen,
                        guardado.getId());

                guardado.setRutaImagen(ruta);
                guardado = servicioService.guardar(guardado);
            }

            return ResponseEntity.ok(guardado);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "mensaje",
                            "No se pudo leer la imagen del servicio."));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "mensaje",
                            "Se interrumpió la subida de la imagen."));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "mensaje",
                            "No se pudo completar el guardado del servicio."));
        }
    }

    // ACTUALIZAR
    @PutMapping(value = "/{id:\\d+}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @Valid @RequestPart("servicio") Servicio servicio,
            @RequestPart(value = "imagen", required = false) MultipartFile imagen) {

        var existente = servicioService.buscarPorId(id);

        if (existente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Servicio servicioExistente = existente.get();

            servicioExistente.setCategoria(servicio.getCategoria());
            servicioExistente.setCodigo(servicio.getCodigo());
            servicioExistente.setNombre(servicio.getNombre());
            servicioExistente.setDescripcion(servicio.getDescripcion());
            servicioExistente.setPrecio(servicio.getPrecio());
            servicioExistente.setDuracionMinutos(
                    servicio.getDuracionMinutos());
            servicioExistente.setCapacidad(servicio.getCapacidad());
            servicioExistente.setEstado(servicio.getEstado());

            // Guardar primero los cambios de los campos.
            Servicio guardado = servicioService.guardar(servicioExistente);

            // Solo reemplazar la ruta si llega una imagen nueva.
            // Si no se envía imagen, se conserva la existente.
            if (imagen != null && !imagen.isEmpty()) {
                String ruta = subirImagen(imagen, id);

                guardado.setRutaImagen(ruta);
                guardado = servicioService.guardar(guardado);
            }

            return ResponseEntity.ok(guardado);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "mensaje",
                            "No se pudo leer la imagen del servicio."));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "mensaje",
                            "Se interrumpió la subida de la imagen."));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "mensaje",
                            "No se pudo completar la actualización del servicio."));
        }
    }

    // SUBIR IMAGEN DEL SERVICIO
    private String subirImagen(
            MultipartFile imagen,
            Long servicioId)
            throws IOException, InterruptedException {

        return supabaseStorageService.subirImagenServicio(
                imagen,
                servicioId);
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

    // OBTENER URL FIRMADA DE LA IMAGEN DEL SERVICIO
    @GetMapping("/{id:\\d+}/imagen-url")
    public ResponseEntity<?> obtenerUrlImagen(@PathVariable Long id) {

        var servicioOptional = servicioService.buscarPorId(id);

        if (servicioOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Servicio servicio = servicioOptional.get();

        if (servicio.getRutaImagen() == null
                || servicio.getRutaImagen().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        try {
            String url = supabaseStorageService
                    .generarUrlFirmada(servicio.getRutaImagen());

            return ResponseEntity.ok(Map.of(
                    "idServicio", id,
                    "urlImagen", url,
                    "expiraEnSegundos", 3600));

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "mensaje",
                            "La operación fue interrumpida."));

        } catch (IOException | RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "mensaje",
                            "No se pudo generar la URL de la imagen del servicio."));
        }
    }

}
