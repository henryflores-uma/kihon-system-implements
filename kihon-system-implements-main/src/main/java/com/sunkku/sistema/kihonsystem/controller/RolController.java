package com.sunkku.sistema.kihonsystem.controller;

import com.sunkku.sistema.kihonsystem.model.Rol;
import com.sunkku.sistema.kihonsystem.service.RolService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolService rolService;

    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @GetMapping
    public ResponseEntity<List<Rol>> listarTodas() {
        return ResponseEntity.ok(rolService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rol> buscarPorId(@PathVariable Long id) {
        return rolService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}