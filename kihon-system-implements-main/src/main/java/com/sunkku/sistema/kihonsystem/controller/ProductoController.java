
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

        // LISTAR TODOS
        @GetMapping
        public ResponseEntity<List<Producto>> listarTodos() {
                return ResponseEntity.ok(productoService.listarTodos());
        }

        // BUSCAR POR ID
        @GetMapping("/{id:\\d+}")
        public ResponseEntity<Producto> buscarPorId(@PathVariable Long id) {
                return productoService.buscarPorId(id)
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        // BUSCAR POR NOMBRE
        @GetMapping("/buscar")
        public ResponseEntity<?> buscarPorNombre(
                        @RequestParam String nombre) {
                try {
                        return ResponseEntity.ok(
                                        productoService.buscarPorNombre(nombre));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("mensaje", e.getMessage()));
                }
        }

        // BUSCAR POR CÓDIGO
        @GetMapping("/buscar/codigo/{codigo}")
        public ResponseEntity<?> buscarPorCodigo(
                        @PathVariable String codigo) {
                return productoService.buscarPorCodigo(codigo)
                                .<ResponseEntity<?>>map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        // BUSCAR POR CATEGORÍA
        @GetMapping("/buscar/categoria/{categoriaId}")
        public ResponseEntity<?> buscarPorCategoria(
                        @PathVariable Long categoriaId) {
                try {
                        return ResponseEntity.ok(
                                        productoService.buscarPorCategoria(categoriaId));
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
                                        productoService.buscarPorEstado(estado));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("mensaje", e.getMessage()));
                }
        }

        // PRODUCTOS CON STOCK BAJO
        @GetMapping("/stock-bajo")
        public ResponseEntity<List<Producto>> buscarConStockBajo() {
                return ResponseEntity.ok(
                                productoService.buscarConStockBajo());
        }

        // CREAR
        @PostMapping
        public ResponseEntity<Producto> guardar(
                        @Valid @RequestBody Producto producto) {
                return ResponseEntity.ok(productoService.guardar(producto));
        }

        // ACTUALIZAR
        @PutMapping("/{id}")
        public ResponseEntity<?> actualizar(
                        @PathVariable Long id,
                        @Valid @RequestBody Producto producto) {

                return productoService.buscarPorId(id)
                                .<ResponseEntity<?>>map(existente -> {
                                        existente.setCategoria(producto.getCategoria());
                                        existente.setCodigo(producto.getCodigo());
                                        existente.setNombre(producto.getNombre());
                                        existente.setDescripcion(producto.getDescripcion());
                                        existente.setPrecioCompra(producto.getPrecioCompra());
                                        existente.setPrecioVenta(producto.getPrecioVenta());
                                        existente.setStockActual(producto.getStockActual());
                                        existente.setStockMinimo(producto.getStockMinimo());
                                        existente.setEstado(producto.getEstado());

                                        if (producto.getRutaImagen() != null) {
                                                existente.setRutaImagen(producto.getRutaImagen());
                                        }

                                        return ResponseEntity.ok(
                                                        productoService.guardar(existente));
                                })
                                .orElse(ResponseEntity.notFound().build());
        }

        // ELIMINAR
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminar(@PathVariable Long id) {
                return productoService.buscarPorId(id)
                                .map(producto -> {
                                        productoService.eliminar(id);
                                        return ResponseEntity.noContent().<Void>build();
                                })
                                .orElse(ResponseEntity.notFound().build());
        }

        // SUBIR IMAGEN
        @PostMapping(value = "/{id}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<?> subirImagen(
                        @PathVariable Long id,
                        @RequestParam("archivo") MultipartFile archivo) {

                var productoOptional = productoService.buscarPorId(id);

                if (productoOptional.isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                try {
                        String ruta = supabaseStorageService
                                        .subirImagenProducto(archivo, id);

                        Producto producto = productoOptional.get();
                        producto.setRutaImagen(ruta);

                        return ResponseEntity.ok(productoService.guardar(producto));

                } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return ResponseEntity.internalServerError()
                                        .body("La operación fue interrumpida.");
                } catch (IOException | RuntimeException e) {
                        return ResponseEntity.internalServerError()
                                        .body("Error al subir o guardar la imagen.");
                }
        }

        // OBTENER URL FIRMADA DE IMAGEN
        @GetMapping("/{id}/imagen-url")
        public ResponseEntity<?> obtenerUrlImagen(@PathVariable Long id) {

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
                                        .generarUrlFirmada(producto.getRutaImagen());

                        return ResponseEntity.ok(Map.of(
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