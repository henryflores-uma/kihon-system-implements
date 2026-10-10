
package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.Categoria;
import com.sunkku.sistema.kihonsystem.model.Servicio;
import com.sunkku.sistema.kihonsystem.repository.CategoriaRepository;
import com.sunkku.sistema.kihonsystem.repository.ServicioRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicioService {

    private final ServicioRepository servicioRepository;
    private final CategoriaRepository categoriaRepository;

    public ServicioService(
            ServicioRepository servicioRepository,
            CategoriaRepository categoriaRepository) {
        this.servicioRepository = servicioRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Servicio> listarTodas() {
        return servicioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Servicio> buscarPorId(Long id) {
        return servicioRepository.findById(id);
    }

    @Transactional
    public Servicio guardar(Servicio servicio) {

        if (servicio.getCategoria() == null
                || servicio.getCategoria().getId() == null) {
            throw new IllegalArgumentException(
                    "Debes seleccionar una categoría");
        }

        Long categoriaId = servicio.getCategoria().getId();

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La categoría indicada no existe"));

        servicio.setCategoria(categoria);

        if (servicio.getCodigo() == null
                || servicio.getCodigo().isBlank()) {
            throw new IllegalArgumentException(
                    "El código del servicio es obligatorio");
        }

        servicio.setCodigo(servicio.getCodigo().trim());

        if (servicio.getNombre() == null
                || servicio.getNombre().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre del servicio es obligatorio");
        }

        servicio.setNombre(servicio.getNombre().trim());

        if (servicio.getPrecio() == null
                || servicio.getPrecio().signum() < 0) {
            throw new IllegalArgumentException(
                    "El precio debe ser mayor o igual a cero");
        }

        if (servicio.getDuracionMinutos() != null
                && servicio.getDuracionMinutos() <= 0) {
            throw new IllegalArgumentException(
                    "La duración debe ser mayor que cero");
        }

        boolean codigoDuplicado;

        if (servicio.getId() == null) {
            codigoDuplicado = servicioRepository
                    .existsByCodigoIgnoreCase(servicio.getCodigo());
        } else {
            codigoDuplicado = servicioRepository
                    .existsByCodigoIgnoreCaseAndIdNot(
                            servicio.getCodigo(),
                            servicio.getId());
        }

        if (codigoDuplicado) {
            throw new IllegalArgumentException(
                    "Ya existe un servicio con ese código");
        }

        return servicioRepository.save(servicio);
    }

    @Transactional(readOnly = true)
    public Optional<Servicio> buscarPorCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new IllegalArgumentException(
                    "Debes indicar el código del servicio");
        }

        return servicioRepository.findByCodigoIgnoreCase(codigo.trim());
    }

    @Transactional(readOnly = true)
    public List<Servicio> buscarPorNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException(
                    "Debes indicar el nombre o parte del nombre");
        }

        return servicioRepository
                .findByNombreContainingIgnoreCase(nombre.trim());
    }

    @Transactional(readOnly = true)
    public List<Servicio> buscarPorCategoria(Long categoriaId) {
        if (categoriaId == null || categoriaId <= 0) {
            throw new IllegalArgumentException(
                    "El ID de la categoría no es válido");
        }

        if (!categoriaRepository.existsById(categoriaId)) {
            throw new IllegalArgumentException(
                    "La categoría indicada no existe");
        }

        return servicioRepository.findByCategoriaId(categoriaId);
    }

    @Transactional(readOnly = true)
    public List<Servicio> buscarPorEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            throw new IllegalArgumentException(
                    "Debes indicar el estado del servicio");
        }

        return servicioRepository.findByEstadoIgnoreCase(estado.trim());
    }

    @Transactional
    public void eliminar(Long id) {
        if (!servicioRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "El servicio que intentas eliminar no existe");
        }

        servicioRepository.deleteById(id);
    }
}