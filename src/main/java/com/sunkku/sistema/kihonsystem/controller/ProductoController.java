
package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.model.Producto;
import com.sunkku.sistema.kihonsystem.service.ProductoService;
import com.sunkku.sistema.kihonsystem.service.SupabaseStorageService;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;
    private final SupabaseStorageService supabaseStorageService;

    public ProductoController(
            ProductoService productoService,
            SupabaseStorageService supabaseStorageService) {
        this.productoService = productoService;
        this.supabaseStorageService = supabaseStorageService;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(
                productoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscarPorId(
            @PathVariable Long id) {

        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Producto> guardar(
            @Valid @RequestBody Producto producto) {

        Producto productoGuardado = productoService.guardar(producto);

        return ResponseEntity.ok(productoGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Producto producto) {

        return productoService.buscarPorId(id)
                .map(productoExistente -> {

                    productoExistente.setCategoria(
                            producto.getCategoria());
                    productoExistente.setCodigo(
                            producto.getCodigo());
                    productoExistente.setNombre(
                            producto.getNombre());
                    productoExistente.setDescripcion(
                            producto.getDescripcion());
                    productoExistente.setPrecioCompra(
                            producto.getPrecioCompra());
                    productoExistente.setPrecioVenta(
                            producto.getPrecioVenta());
                    productoExistente.setStockActual(
                            producto.getStockActual());
                    productoExistente.setStockMinimo(
                            producto.getStockMinimo());
                    productoExistente.setEstado(
                            producto.getEstado());

                    // Conserva la ruta actual si no se envía otra.
                    if (producto.getRutaImagen() != null) {
                        productoExistente.setRutaImagen(
                                producto.getRutaImagen());
                    }

                    Producto actualizado = productoService.guardar(
                            productoExistente);

                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {

        return productoService.buscarPorId(id)
                .map(producto -> {
                    productoService.eliminar(id);

                    return ResponseEntity.noContent()
                            .<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Sube una imagen y guarda su ruta en PostgreSQL.
     */
    @PostMapping(value = "/{id}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirImagen(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {

        var productoOptional = productoService.buscarPorId(id);

        if (productoOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Producto producto = productoOptional.get();

        try {
            String ruta = supabaseStorageService
                    .subirImagenProducto(archivo, id);

            producto.setRutaImagen(ruta);

            Producto actualizado = productoService.guardar(producto);

            return ResponseEntity.ok(actualizado);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();

            return ResponseEntity.internalServerError()
                    .body("La operación fue interrumpida.");

        } catch (IOException | RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body("Error al subir o guardar la imagen.");
        }
    }

    /**
     * Genera una URL firmada para ver la imagen privada.
     */
    @GetMapping("/{id}/imagen-url")
    public ResponseEntity<?> obtenerUrlImagen(
            @PathVariable Long id) {

        var productoOptional = productoService.buscarPorId(id);

        if (productoOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Producto producto = productoOptional.get();

        if (producto.getRutaImagen() == null
                || producto.getRutaImagen().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        try {
            String url = supabaseStorageService
                    .generarUrlFirmada(
                            producto.getRutaImagen());

            return ResponseEntity.ok(
                    Map.of(
                            "idProducto", id,
                            "urlImagen", url,
                            "expiraEnSegundos", 3600));

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();

            return ResponseEntity.internalServerError()
                    .body("La operación fue interrumpida.");

        } catch (IOException | RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body("No se pudo generar la URL de la imagen.");
        }
    }
}