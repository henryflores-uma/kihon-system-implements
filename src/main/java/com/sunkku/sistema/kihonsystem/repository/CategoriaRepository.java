package com.sunkku.sistema.kihonsystem.repository;

import com.sunkku.sistema.kihonsystem.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    Optional<Categoria> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    List<Categoria> findByNombreContainingIgnoreCase(String nombre);

    List<Categoria> findByEstadoIgnoreCase(String estado);
}