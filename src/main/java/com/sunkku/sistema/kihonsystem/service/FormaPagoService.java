package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.FormaPago;
import com.sunkku.sistema.kihonsystem.repository.FormaPagoRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class FormaPagoService {

    private final FormaPagoRepository formaPagoRepository;

    public FormaPagoService(FormaPagoRepository formaPagoRepository) {
        this.formaPagoRepository = formaPagoRepository;
    }

    public List<FormaPago> listarTodas() {
        return formaPagoRepository.findAll();
    }

    public Optional<FormaPago> buscarPorId(Long id) {
        return formaPagoRepository.findById(id);
    }

    public FormaPago guardar(FormaPago formaPago) {
        return formaPagoRepository.save(formaPago);
    }

    public void eliminar(Long id) {
        formaPagoRepository.deleteById(id);
    }
}
