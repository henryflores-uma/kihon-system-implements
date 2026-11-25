document.addEventListener("DOMContentLoaded", () => {
  const dialogo = document.getElementById("compraProductos");
  const boleta = document.getElementById("boletaCompraProductos");
  const mensajeBoleta = document.getElementById("mensajeBoletaProductos");
  const titulo = document.getElementById("tituloCompraProductos");
  const paso = document.getElementById("pasoCompraProductos");
  const vistaCarrito = document.getElementById("listaCompraProductos");
  const formulario = document.getElementById("datosCompraProductos");
  const lista = document.getElementById("itemsCompraProductos");
  const plantilla = document.getElementById("plantillaItemCompra");
  const continuar = document.getElementById("continuarCompraProductos");
  const enlaceCarrito = document.getElementById("abrirCompraProductos");
  const productos = new Map();
  const moneda = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  });

  function importe(centimos) {
    return moneda.format(centimos / 100);
  }

  function actualizarItem(producto) {
    const { fila, cantidad, stock, precio } = producto;
    fila.querySelector("[data-item-cantidad]").textContent = cantidad;
    fila.querySelector("[data-item-total]").textContent = importe(precio * cantidad);
    fila.querySelector('[data-cantidad="-1"]').disabled = cantidad <= 1;
    fila.querySelector('[data-cantidad="1"]').disabled = cantidad >= stock;
  }

  function actualizarResumen() {
    let unidades = 0;
    let total = 0;
    for (const producto of productos.values()) {
      unidades += producto.cantidad;
      total += producto.precio * producto.cantidad;
    }
    enlaceCarrito.querySelector(".carrito-contador").textContent = unidades;
    document.getElementById("unidadesCompraProductos").textContent = unidades;
    document.getElementById("totalCompraProductos").textContent = importe(total);
    document.getElementById("carritoProductosVacio").hidden = unidades > 0;
    continuar.disabled = unidades === 0;
  }

  function crearItem(tarjeta) {
    const { itemId, tipo, nombre, descripcion, precio, stock } = tarjeta.dataset;
    const esServicio = tipo === "servicio";
    const fila = plantilla.content.firstElementChild.cloneNode(true);
    const producto = {
      fila,
      nombre,
      cantidad: 1,
      precio: Math.round(Number(precio) * 100),
      stock: esServicio ? 1 : Number(stock),
      esServicio,
    };

    fila.querySelector("[data-item-nombre]").textContent = nombre;
    const textoDescripcion = fila.querySelector("[data-item-descripcion]");
    if (esServicio) {
      textoDescripcion.textContent = descripcion?.trim() || "Consulta más información en la academia.";
      textoDescripcion.hidden = false;
      fila.querySelector(".carrito-cantidad").hidden = true;
    }
    fila.querySelector("[data-item-precio]").textContent =
      importe(producto.precio) + (esServicio ? "" : " por unidad");

    const fotoTarjeta = tarjeta.querySelector(".imagen img");
    if (fotoTarjeta && fotoTarjeta.style.display !== "none") {
      const foto = fila.querySelector("img");
      foto.addEventListener("error", () => { foto.hidden = true; });
      foto.src = fotoTarjeta.src;
      foto.hidden = false;
    }

    fila.querySelectorAll("[data-cantidad]").forEach((boton) => {
      const cambio = Number(boton.dataset.cantidad);
      boton.setAttribute("aria-label", `${cambio > 0 ? "Agregar" : "Restar"} una unidad de ${nombre}`);
      boton.addEventListener("click", () => {
        producto.cantidad += cambio;
        actualizarItem(producto);
        if (boton.disabled) {
          fila.querySelector("[data-cantidad]:enabled, [data-quitar]").focus();
        }
        actualizarResumen();
      });
    });

    const quitar = fila.querySelector("[data-quitar]");
    quitar.setAttribute("aria-label", `Quitar ${nombre} del carrito`);
    quitar.addEventListener("click", () => {
      const siguiente = fila.nextElementSibling || fila.previousElementSibling;
      productos.delete(`${tipo}:${itemId}`);
      fila.remove();
      actualizarResumen();
      (siguiente?.querySelector("[data-quitar]") || titulo).focus();
    });

    lista.append(fila);
    return producto;
  }

  function mostrarPaso(numero) {
    vistaCarrito.hidden = numero !== 1;
    formulario.hidden = numero !== 2;
    boleta.hidden = numero !== 3;
    vistaCarrito.parentElement.hidden = numero === 3;
    titulo.textContent = ["Carrito de compras", "Datos y forma de pago", "Boleta de tu compra"][numero - 1];
    paso.textContent = `Paso ${numero} de 3`;
    dialogo.scrollTop = 0;
    titulo.focus();
  }

  function abrirCarrito() {
    dialogo.showModal();
    mostrarPaso(1);
  }

  document.querySelectorAll("[data-agregar-carrito]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const tarjeta = boton.closest("[data-item-id]");
      const id = `${tarjeta.dataset.tipo}:${tarjeta.dataset.itemId}`;
      let producto = productos.get(id);
      if (producto) {
        producto.cantidad = Math.min(producto.cantidad + 1, producto.stock);
      } else {
        producto = crearItem(tarjeta);
        productos.set(id, producto);
      }
      actualizarItem(producto);
      actualizarResumen();
      abrirCarrito();
    });
  });

  enlaceCarrito.addEventListener("click", (evento) => {
    evento.preventDefault();
    abrirCarrito();
  });
  dialogo.querySelectorAll("[data-cerrar-carrito]").forEach((boton) => {
    boton.addEventListener("click", () => dialogo.close());
  });
  dialogo.addEventListener("close", () => {
    formulario.reset();
    boleta.hidden = true;
    boleta.querySelectorAll("[data-boleta]").forEach((campo) => { campo.textContent = ""; });
    document.getElementById("detalleBoletaProductos").replaceChildren();
    mensajeBoleta.textContent = "";
  });
  continuar.addEventListener("click", () => mostrarPaso(2));
  document.getElementById("volverCompraProductos").addEventListener("click", () => mostrarPaso(1));

  formulario.addEventListener("input", (evento) => {
    const campo = evento.target;
    if (campo.hasAttribute("data-solo-digitos")) {
      campo.value = campo.value.replace(/[^0-9]/g, "");
    } else if (campo.hasAttribute("data-solo-letras")) {
      campo.value = campo.value.replace(/[^\p{L}\p{M} ]/gu, "");
    }
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (productos.size === 0) return;

    const datos = new FormData(formulario);
    const efectivo = datos.get("metodoPago") === "efectivo";
    const fecha = new Date();
    const valores = {
      referencia: `DEMO-${fecha.getTime()}`,
      fecha: new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Lima",
      }).format(fecha),
      cliente: `${datos.get("nombre").trim()} ${datos.get("apellido").trim()}`,
      dni: datos.get("dni"),
      correo: datos.get("correo"),
      metodo: efectivo ? "Efectivo en la academia" : "Tarjeta de débito o crédito",
      estado: efectivo ? "Pendiente de pago al recoger" : "Pago simulado",
      total: document.getElementById("totalCompraProductos").textContent,
    };

    boleta.querySelectorAll("[data-boleta]").forEach((campo) => {
      campo.textContent = valores[campo.dataset.boleta];
    });

    const detalle = document.getElementById("detalleBoletaProductos");
    for (const { nombre, cantidad, precio, esServicio } of productos.values()) {
      const fila = detalle.insertRow();
      const concepto = esServicio ? `Servicio: ${nombre}` : nombre;
      for (const valor of [concepto, cantidad, importe(precio), importe(precio * cantidad)]) {
        fila.insertCell().textContent = valor;
      }
    }

    productos.clear();
    lista.replaceChildren();
    formulario.reset();
    actualizarResumen();
    mostrarPaso(3);
  });

  document.getElementById("guardarBoletaProductos").addEventListener("click", () => {
    const copia = boleta.querySelector(".boleta-papel").cloneNode(true);
    copia.classList.add("boleta-impresion");
    document.body.append(copia);
    window.addEventListener("afterprint", () => copia.remove(), { once: true });
    window.print();
  });
  document.getElementById("enviarBoletaProductos").addEventListener("click", () => {
    const correo = boleta.querySelector('[data-boleta="correo"]').textContent;
    mensajeBoleta.textContent = `Envío simulado a ${correo}.`;
  });
});
