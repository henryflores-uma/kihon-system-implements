document.addEventListener("DOMContentLoaded", () => {
  const buscador = document.getElementById("buscadorCatalogo");
  const limpiar = document.getElementById("limpiarBusqueda");
  const botones = document.querySelectorAll(".filtro-btn");
  const tarjetas = document.querySelectorAll(".tarjeta-catalogo");
  const resultado = document.getElementById("resultadoBusqueda");
  const sinCoincidencias = document.getElementById("sinCoincidencias");

  const seccionProductos = document.getElementById("productos");
  const seccionServicios = document.getElementById("servicios");

  if (
    !buscador ||
    !limpiar ||
    !resultado ||
    !sinCoincidencias ||
    !seccionProductos ||
    !seccionServicios
  ) {
    console.error("No se encontraron todos los elementos del catálogo.");
    return;
  }

  let filtroActual = "todos";

  function normalizar(texto) {
    return (texto || "")
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function actualizarCatalogo() {
    const consulta = normalizar(buscador.value);

    let visibles = 0;
    let productosVisibles = 0;
    let serviciosVisibles = 0;

    tarjetas.forEach((tarjeta) => {
      const tipo = tarjeta.dataset.tipo || "";

      const contenido = normalizar(
        [
          tarjeta.dataset.nombre,
          tarjeta.dataset.descripcion,
          tarjeta.dataset.categoria,
        ].join(" "),
      );

      const coincideTexto = contenido.includes(consulta);

      const coincideTipo = filtroActual === "todos" || tipo === filtroActual;

      const mostrar = coincideTexto && coincideTipo;

      tarjeta.classList.toggle("oculto-filtro", !mostrar);

      if (mostrar) {
        visibles++;

        if (tipo === "producto") {
          productosVisibles++;
        } else if (tipo === "servicio") {
          serviciosVisibles++;
        }
      }
    });

    const mostrarProductos =
      (filtroActual === "todos" || filtroActual === "producto") &&
      productosVisibles > 0;

    const mostrarServicios =
      (filtroActual === "todos" || filtroActual === "servicio") &&
      serviciosVisibles > 0;

    seccionProductos.classList.toggle("oculta-filtro", !mostrarProductos);

    seccionServicios.classList.toggle("oculta-filtro", !mostrarServicios);

    sinCoincidencias.hidden = visibles !== 0;
    limpiar.hidden = buscador.value.length === 0;

    if (visibles === 0) {
      resultado.textContent =
        "No se encontraron resultados. Prueba otra búsqueda o filtro.";
    } else if (consulta === "" && filtroActual === "todos") {
      resultado.textContent = `Mostrando todo el catálogo: ${visibles} elementos`;
    } else {
      let tipoTexto;

      if (filtroActual === "producto") {
        tipoTexto = productosVisibles === 1 ? "producto" : "productos";
      } else if (filtroActual === "servicio") {
        tipoTexto = serviciosVisibles === 1 ? "servicio" : "servicios";
      } else {
        tipoTexto = "elementos";
      }

      resultado.textContent = `Se encontraron ${visibles} ${tipoTexto}`;
    }
  }

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      filtroActual = boton.dataset.filtro;

      botones.forEach((otro) => {
        const seleccionado = otro === boton;

        otro.classList.toggle("activo", seleccionado);

        otro.setAttribute("aria-pressed", String(seleccionado));
      });

      actualizarCatalogo();
    });
  });

  buscador.addEventListener("input", actualizarCatalogo);

  limpiar.addEventListener("click", () => {
    buscador.value = "";
    actualizarCatalogo();
    buscador.focus();
  });

  actualizarCatalogo();
});
