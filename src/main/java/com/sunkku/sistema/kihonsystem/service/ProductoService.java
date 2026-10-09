
package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.Categoria;
import com.sunkku.sistema.kihonsystem.model.Producto;
import com.sunkku.sistema.kihonsystem.repository.CategoriaRepository;
import com.sunkku.sistema.kihonsystem.repository.ProductoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoService(
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }

    @Transactional
    public Producto guardar(Producto producto) {

        if (producto.getCategoria() == null
                || producto.getCategoria().getId() == null) {
            throw new IllegalArgumentException(
                    "Debes seleccionar una categoría");
        }

        Long categoriaId = producto.getCategoria().getId();

        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La categoría indicada no existe"));

        producto.setCategoria(categoria);

        if (producto.getCodigo() == null
                || producto.getCodigo().isBlank()) {
            throw new IllegalArgumentException(
                    "El código del producto es obligatorio");
        }

        String codigo = producto.getCodigo().trim();
        producto.setCodigo(codigo);

        boolean codigoDuplicado;

        if (producto.getId() == null) {
            codigoDuplicado = productoRepository.existsByCodigoIgnoreCase(codigo);
        } else {
            codigoDuplicado = productoRepository.existsByCodigoIgnoreCaseAndIdNot(
                    codigo,
                    producto.getId());
        }

        if (codigoDuplicado) {
            throw new IllegalArgumentException(
                    "Ya existe un producto con ese código");
        }

        return productoRepository.save(producto);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "El producto que intentas eliminar no existe");
        }

        productoRepository.deleteById(id);
    }
}