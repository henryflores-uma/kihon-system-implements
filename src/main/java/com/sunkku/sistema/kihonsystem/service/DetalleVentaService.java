package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.DetalleVenta;
import com.sunkku.sistema.kihonsystem.repository.DetalleVentaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class DetalleVentaService {

    private final DetalleVentaRepository detalleVentaRepository;

    public DetalleVentaService(DetalleVentaRepository detalleVentaRepository) {
        this.detalleVentaRepository = detalleVentaRepository;
    }

    public List<DetalleVenta> listarTodas() {
        return detalleVentaRepository.findAll();
    }

    public Optional<DetalleVenta> buscarPorId(Long id) {
        return detalleVentaRepository.findById(id);
    }

    public DetalleVenta guardar(DetalleVenta detalleVenta) {
        return detalleVentaRepository.save(detalleVenta);
    }

    public void eliminar(Long id) {
        detalleVentaRepository.deleteById(id);
    }
}
