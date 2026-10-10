
package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.Categoria;
import com.sunkku.sistema.kihonsystem.repository.CategoriaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Categoria> buscarPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Categoria> buscarPorNombre(String nombre) {
        validarNombre(nombre);
        return categoriaRepository.findByNombreIgnoreCase(nombre.trim());
    }

    @Transactional(readOnly = true)
    public List<Categoria> buscarPorNombreParcial(String nombre) {
        validarNombre(nombre);
        return categoriaRepository
                .findByNombreContainingIgnoreCase(nombre.trim());
    }

    @Transactional(readOnly = true)
    public List<Categoria> buscarPorEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            throw new IllegalArgumentException(
                    "Debes indicar el estado de la categoría");
        }

        String estadoNormalizado = estado.trim();

        if (!estadoNormalizado.equalsIgnoreCase("ACTIVO")
                && !estadoNormalizado.equalsIgnoreCase("INACTIVO")) {
            throw new IllegalArgumentException(
                    "El estado debe ser ACTIVO o INACTIVO");
        }

        return categoriaRepository.findByEstadoIgnoreCase(estadoNormalizado);
    }

    @Transactional
    public Categoria guardar(Categoria categoria) {
        validarNombre(categoria.getNombre());

        String nombre = categoria.getNombre().trim();
        categoria.setNombre(nombre);

        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new IllegalArgumentException(
                    "Ya existe una categoría con ese nombre");
        }

        return categoriaRepository.save(categoria);
    }

    @Transactional
    public Optional<Categoria> actualizar(Long id, Categoria datos) {
        Optional<Categoria> resultado = categoriaRepository.findById(id);

        if (resultado.isEmpty()) {
            return Optional.empty();
        }

        validarNombre(datos.getNombre());

        String nombre = datos.getNombre().trim();

        boolean duplicada = categoriaRepository
                .existsByNombreIgnoreCaseAndIdNot(nombre, id);

        if (duplicada) {
            throw new IllegalArgumentException(
                    "Ya existe una categoría con ese nombre");
        }

        Categoria existente = resultado.get();
        existente.setNombre(nombre);
        existente.setDescripcion(datos.getDescripcion());
        existente.setEstado(datos.getEstado());

        return Optional.of(categoriaRepository.save(existente));
    }

    private void validarNombre(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre de la categoría es obligatorio");
        }
    }

    @Transactional
    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "La categoría que intentas eliminar no existe");
        }

        categoriaRepository.deleteById(id);
    }
}