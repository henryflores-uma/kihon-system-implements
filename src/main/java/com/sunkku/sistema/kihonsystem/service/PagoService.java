package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.Pago;
import com.sunkku.sistema.kihonsystem.repository.PagoRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;

    public PagoService(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    public List<Pago> listarTodas() {
        return pagoRepository.findAll();
    }

    public Optional<Pago> buscarPorId(Long id) {
        return pagoRepository.findById(id);
    }

    public Pago guardar(Pago pago) {
        return pagoRepository.save(pago);
    }

    public void eliminar(Long id) {
        pagoRepository.deleteById(id);
    }
}
