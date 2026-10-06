package com.sunkku.sistema.kihonsystem.service;

import com.sunkku.sistema.kihonsystem.model.TipoDocumento;
import com.sunkku.sistema.kihonsystem.repository.TipoDocumentoRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class TipoDocumentoService {

    private final TipoDocumentoRepository tipoDocumentoRepository;

    public TipoDocumentoService(TipoDocumentoRepository tipoDocumentoRepository) {
        this.tipoDocumentoRepository = tipoDocumentoRepository;
    }

    public List<TipoDocumento> listarTodas() {
        return tipoDocumentoRepository.findAll();
    }

    public Optional<TipoDocumento> buscarPorId(Long id) {
        return tipoDocumentoRepository.findById(id);
    }

    public TipoDocumento guardar(TipoDocumento tipoDocumento) {
        return tipoDocumentoRepository.save(tipoDocumento);
    }

    public void eliminar(Long id) {
        tipoDocumentoRepository.deleteById(id);
    }
}
