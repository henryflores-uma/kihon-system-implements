package com.sunkku.sistema.kihonsystem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, unique = true, columnDefinition = "character varying")
    private String codigo;

    @Column(nullable = false, columnDefinition = "character varying")
    private String nombre;

    @Column(columnDefinition = "text")
    private String descripcion;

    @Column(name = "precio_compra", columnDefinition = "numeric")
    private BigDecimal precioCompra;

    @Column(name = "precio_venta", nullable = false, columnDefinition = "numeric")
    private BigDecimal precioVenta;

    @Column(name = "stock_actual", nullable = false)
    @ColumnDefault("0")
    private Integer stockActual = 0;

    @Column(name = "stock_minimo", nullable = false)
    @ColumnDefault("0")
    private Integer stockMinimo = 0;

    @Column(nullable = false, columnDefinition = "character varying")
    @ColumnDefault("'ACTIVO'")
    private String estado = "ACTIVO";

    @CreationTimestamp
    @Column(name = "fecha_registro", nullable = false, updatable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime fechaRegistro;
}
