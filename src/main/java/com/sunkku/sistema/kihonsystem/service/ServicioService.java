package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.Servicio;
import com.sunkku.sistema.kihonsystem.repository.ServicioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public ServicioService(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    public List<Servicio> listarTodas() {
        return servicioRepository.findAll();
    }

    public Optional<Servicio> buscarPorId(Long id) {
        return servicioRepository.findById(id);
    }

    public Servicio guardar(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    public void eliminar(Long id) {
        servicioRepository.deleteById(id);
    }
}
