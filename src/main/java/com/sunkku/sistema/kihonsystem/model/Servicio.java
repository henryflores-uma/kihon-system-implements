package com.sunkku.sistema.kihonsystem.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "servicios")
@Getter
@Setter
@NoArgsConstructor
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @NotBlank(message = "El código del servicio es obligatorio")
    @Column(nullable = false, unique = true, columnDefinition = "character varying")
    private String codigo;

    @NotBlank(message = "El nombre del servicio es obligatorio")
    @Column(nullable = false, columnDefinition = "character varying")
    private String nombre;

    @Column(columnDefinition = "text")
    private String descripcion;

    // Ruta de la imagen almacenada
    @Column(name = "ruta_imagen", columnDefinition = "text")
    private String rutaImagen;

    @NotNull(message = "El precio es obligatorio")
    @Min(value = 0, message = "El precio no puede ser negativo")
    @Column(nullable = false, columnDefinition = "numeric")
    private BigDecimal precio;

    @Min(value = 1, message = "La duración debe ser mayor que cero")
    @Column(name = "duracion_minutos")
    private Integer duracionMinutos;

    // Capacidad máxima informativa del servicio
    @Positive(message = "La capacidad debe ser mayor que cero")
    @Column(name = "capacidad")
    private Integer capacidad;

    @Column(nullable = false, columnDefinition = "character varying")
    @ColumnDefault("'ACTIVO'")
    private String estado = "ACTIVO";

    @CreationTimestamp
    @Column(name = "fecha_registro", nullable = false, updatable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime fechaRegistro;
}
