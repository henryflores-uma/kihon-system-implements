
package com.sunkku.sistema.kihonsystem.repository;

import com.sunkku.sistema.kihonsystem.model.Servicio;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, Long id);

    Optional<Servicio> findByCodigoIgnoreCase(String codigo);

    List<Servicio> findByNombreContainingIgnoreCase(String nombre);

    List<Servicio> findByCategoriaId(Long categoriaId);

    List<Servicio> findByEstadoIgnoreCase(String estado);
}