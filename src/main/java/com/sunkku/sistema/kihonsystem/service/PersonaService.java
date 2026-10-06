package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.Persona;
import com.sunkku.sistema.kihonsystem.repository.PersonaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class PersonaService {

    private final PersonaRepository personaRepository;

    public PersonaService(PersonaRepository personaRepository) {
        this.personaRepository = personaRepository;
    }

    public List<Persona> listarTodas() {
        return personaRepository.findAll();
    }

    public Optional<Persona> buscarPorId(Long id) {
        return personaRepository.findById(id);
    }

    public Persona guardar(Persona persona) {
        return personaRepository.save(persona);
    }

    public void eliminar(Long id) {
        personaRepository.deleteById(id);
    }
}
