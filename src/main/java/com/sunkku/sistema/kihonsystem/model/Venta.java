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
@Table(name = "ventas")
@Getter
@Setter
@NoArgsConstructor
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @CreationTimestamp
    @Column(name = "fecha_venta", nullable = false, updatable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime fechaVenta;

    @Column(nullable = false, columnDefinition = "numeric")
    @ColumnDefault("0")
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, columnDefinition = "numeric")
    @ColumnDefault("0")
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(nullable = false, columnDefinition = "numeric")
    @ColumnDefault("0")
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false, columnDefinition = "character varying")
    @ColumnDefault("'COMPLETADA'")
    private String estado = "COMPLETADA";
}
