
package com.sunkku.sistema.kihonsystem.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    // ==========================================
    // PÁGINAS PÚBLICAS
    // ==========================================

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/registro")
    public String registro() {
        return "registro";
    }

    // ==========================================
    // ADMINISTRADOR
    // ==========================================

    @GetMapping("/admin/admin")
    public String admin() {
        return "admin/admin";
    }

    @GetMapping("/admin/estudiantes")
    public String estudiantes() {
        return "admin/estudiantes";
    }

    @GetMapping("/admin/grupos")
    public String grupos() {
        return "admin/grupos";
    }

    @GetMapping("/admin/asistencia")
    public String asistencia() {
        return "admin/asistencia";
    }

    @GetMapping("/admin/horario")
    public String horario() {
        return "admin/horario";
    }

    @GetMapping("/admin/inscripciones")
    public String inscripciones() {
        return "admin/inscripciones";
    }

    @GetMapping("/admin/reportes")
    public String reportes() {
        return "admin/reportes";
    }

    @GetMapping("/admin/usuarios")
    public String usuarios() {
        return "admin/usuarios";
    }

    @GetMapping("/admin/perfil")
    public String perfilAdmin() {
        return "admin/perfil";
    }

    // ==========================================
    // GESTIÓN DE CATEGORÍAS
    // ==========================================

    @GetMapping("/admin/categorias")
    public String categorias() {
        return "admin/categorias";
    }

    @GetMapping("/admin/categorias/nueva")
    public String nuevaCategoria() {
        return "admin/categoria-form";
    }

    // ==========================================
    // GESTIÓN DE PRODUCTOS
    // ==========================================

    @GetMapping("/admin/productos")
    public String productos() {
        return "admin/productos";
    }

    @GetMapping("/admin/productos/nuevo")
    public String nuevoProducto() {
        return "admin/producto-form";
    }

    // ==========================================
    // GESTIÓN DE SERVICIOS
    // ==========================================

    @GetMapping("/admin/servicios")
    public String servicios() {
        return "admin/servicios";
    }

    @GetMapping("/admin/servicios/nuevo")
    public String nuevoServicio() {
        return "admin/servicio-form";
    }

    // ==========================================
    // SECRETARÍA
    // ==========================================

    @GetMapping("/secretaria/secretaria")
    public String secretaria() {
        return "secretaria/secretaria";
    }

    @GetMapping("/secretaria/perfil")
    public String perfilSecretaria() {
        return "secretaria/perfil";
    }

    // ==========================================
    // SENSEI
    // ==========================================

    @GetMapping("/sensei/sensei")
    public String sensei() {
        return "sensei/sensei";
    }

    @GetMapping("/sensei/perfil")
    public String perfilSensei() {
        return "sensei/perfil";
    }

    // ==========================================
    // ESTUDIANTE
    // ==========================================

    @GetMapping("/estudiante/perfil")
    public String perfilEstudiante() {
        return "estudiante/perfil";
    }

    @GetMapping("/estudiante/grupos")
    public String gruposEstudiante() {
        return "estudiante/grupos";
    }

    @GetMapping("/estudiante/asistencias")
    public String asistenciasEstudiante() {
        return "estudiante/asistencias";
    }
}