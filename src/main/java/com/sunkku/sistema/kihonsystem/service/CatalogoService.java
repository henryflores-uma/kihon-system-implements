package com.sunkku.sistema.kihonsystem.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import com.sunkku.sistema.kihonsystem.model.Producto;
import com.sunkku.sistema.kihonsystem.model.Servicio;

@Service
public class CatalogoService {

    private final ProductoService productoService;
    private final ServicioService servicioService;
    private final SupabaseStorageService storageService;

    public CatalogoService(
            ProductoService productoService,
            ServicioService servicioService,
            SupabaseStorageService storageService) {
        this.productoService = productoService;
        this.servicioService = servicioService;
        this.storageService = storageService;
    }

    public void cargarCatalogo(Model model) {
        List<Producto> productos = productoService.buscarPorEstado("ACTIVO");

        List<Servicio> servicios = servicioService.buscarPorEstado("ACTIVO");

        Map<Long, String> imagenesProductos = new HashMap<>();
        Map<Long, String> imagenesServicios = new HashMap<>();

        for (Producto producto : productos) {
            String url = generarUrlImagen(producto.getRutaImagen());
            if (url != null) {
                imagenesProductos.put(producto.getId(), url);
            }
        }

        for (Servicio servicio : servicios) {
            String url = generarUrlImagen(servicio.getRutaImagen());
            if (url != null) {
                imagenesServicios.put(servicio.getId(), url);
            }
        }

        model.addAttribute("productos", productos);
        model.addAttribute("servicios", servicios);
        model.addAttribute("imagenesProductos", imagenesProductos);
        model.addAttribute("imagenesServicios", imagenesServicios);
    }

    private String generarUrlImagen(String ruta) {
        if (ruta == null || ruta.isBlank()) {
            return null;
        }

        try {
            return storageService.generarUrlFirmada(ruta);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } catch (IOException | RuntimeException e) {
            return null;
        }
    }
}