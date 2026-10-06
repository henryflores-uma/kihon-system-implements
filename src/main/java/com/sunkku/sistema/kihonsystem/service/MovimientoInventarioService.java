package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.MovimientoInventario;
import com.sunkku.sistema.kihonsystem.repository.MovimientoInventarioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository movimientoInventarioRepository;

    public MovimientoInventarioService(MovimientoInventarioRepository movimientoInventarioRepository) {
        this.movimientoInventarioRepository = movimientoInventarioRepository;
    }

    public List<MovimientoInventario> listarTodas() {
        return movimientoInventarioRepository.findAll();
    }

    public Optional<MovimientoInventario> buscarPorId(Long id) {
        return movimientoInventarioRepository.findById(id);
    }

    public MovimientoInventario guardar(MovimientoInventario movimientoInventario) {
        return movimientoInventarioRepository.save(movimientoInventario);
    }

    public void eliminar(Long id) {
        movimientoInventarioRepository.deleteById(id);
    }
}
