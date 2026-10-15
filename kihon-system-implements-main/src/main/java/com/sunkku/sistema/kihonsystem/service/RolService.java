package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.Rol;
import com.sunkku.sistema.kihonsystem.repository.RolRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public List<Rol> listarTodas() {
        return rolRepository.findAll();
    }

    public Optional<Rol> buscarPorId(Long id) {
        return rolRepository.findById(id);
    }

    public Rol guardar(Rol rol) {
        return rolRepository.save(rol);
    }

    public void eliminar(Long id) {
        rolRepository.deleteById(id);
    }
}
