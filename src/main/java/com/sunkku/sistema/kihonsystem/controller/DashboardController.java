package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.dto.CategoriaEstadisticaDTO;
import com.sunkku.sistema.kihonsystem.model.Categoria;
import com.sunkku.sistema.kihonsystem.repository.CategoriaRepository;
import com.sunkku.sistema.kihonsystem.repository.ProductoRepository;
import com.sunkku.sistema.kihonsystem.repository.ServicioRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final ServicioRepository servicioRepository;

    public DashboardController(
            CategoriaRepository categoriaRepository,
            ProductoRepository productoRepository,
            ServicioRepository servicioRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.servicioRepository = servicioRepository;
    }

    @GetMapping("/catalogo-por-categoria")
    public List<CategoriaEstadisticaDTO> obtenerCatalogoPorCategoria() {

        Map<Long, Long> productosPorCategoria = convertirResultados(
                productoRepository.contarProductosPorCategoria());

        Map<Long, Long> serviciosPorCategoria = convertirResultados(
                servicioRepository.contarServiciosPorCategoria());

        return categoriaRepository.findAll()
                .stream()
                .map(categoria -> crearEstadistica(
                        categoria,
                        productosPorCategoria,
                        serviciosPorCategoria))
                .sorted((a, b) -> a.categoria().compareToIgnoreCase(b.categoria()))
                .collect(Collectors.toList());
    }

    private Map<Long, Long> convertirResultados(List<Object[]> resultados) {
        Map<Long, Long> cantidades = new HashMap<>();

        for (Object[] fila : resultados) {
            Long categoriaId = ((Number) fila[0]).longValue();
            Long cantidad = ((Number) fila[1]).longValue();

            cantidades.put(categoriaId, cantidad);
        }

        return cantidades;
    }

    private CategoriaEstadisticaDTO crearEstadistica(
            Categoria categoria,
            Map<Long, Long> productosPorCategoria,
            Map<Long, Long> serviciosPorCategoria) {

        Long categoriaId = categoria.getId();

        return new CategoriaEstadisticaDTO(
                categoriaId,
                categoria.getNombre(),
                productosPorCategoria.getOrDefault(categoriaId, 0L),
                serviciosPorCategoria.getOrDefault(categoriaId, 0L));
    }
}