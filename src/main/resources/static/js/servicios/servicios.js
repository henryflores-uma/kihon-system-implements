document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.querySelector(".servicios-page");
  if (!pagina) return;

  const API = pagina.dataset.apiServicios;
  const API_CATEGORIAS = pagina.dataset.apiCategorias;
  const URL_NUEVO = pagina.dataset.nuevoUrl;
  const URL_EDITAR = pagina.dataset.editarUrl;

  const $ = (id) => document.getElementById(id);

  const elementos = {
    tbody: $("tablaServiciosBody"),
    contador: $("contadorServicios"),
    buscar: $("inputBuscarServicio"),
    filtroCategoria: $("selectFiltroCategoriaServicio"),
    btnNuevo: $("btnNuevoServicio"),
    modalVista: $("modalVistaServicio"),
    cerrarVista: $("cerrarVistaServicio"),
    cerrarVistaFooter: $("cerrarVistaServicioFooter"),
  };

  let servicios = [];

  // --------------------------------------------------
  // UTILIDADES
  // --------------------------------------------------

  function tokenCSRF() {
    return document.querySelector('meta[name="_csrf"]')?.content || "";
  }

  function cabeceraCSRF() {
    return (
      document.querySelector('meta[name="_csrf_header"]')?.content ||
      "X-CSRF-TOKEN"
    );
  }

  function formatearPrecio(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "—";
    }

    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "—";

    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(numero);
  }

  function formatearCantidad(valor, sufijo = "") {
    if (valor === null || valor === undefined || valor === "") {
      return "—";
    }

    return `${valor}${sufijo}`;
  }

  function crearCelda(texto, clase = "") {
    const td = document.createElement("td");
    td.textContent = texto ?? "";

    if (clase) {
      td.className = clase;
    }

    return td;
  }

  function mostrarMensaje(mensaje, esError = false) {
    elementos.tbody.replaceChildren();

    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = 8;
    celda.className = "servicios-table-message";

    if (esError) {
      celda.classList.add("servicios-table-message--error");
    }

    celda.textContent = mensaje;
    fila.appendChild(celda);
    elementos.tbody.appendChild(fila);
  }

  async function solicitar(url, opciones = {}) {
    const headers = {
      Accept: "application/json",
      ...opciones.headers,
    };

    if (opciones.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const metodo = (opciones.method || "GET").toUpperCase();

    if (["POST", "PUT", "PATCH", "DELETE"].includes(metodo)) {
      const token = tokenCSRF();

      if (token) {
        headers[cabeceraCSRF()] = token;
      }
    }

    const respuesta = await fetch(url, {
      ...opciones,
      headers,
    });

    if (!respuesta.ok) {
      let detalle = "";

      try {
        detalle = (await respuesta.text()).slice(0, 300);
      } catch {
        // Conserva el error HTTP aunque no se pueda leer el detalle.
      }

      throw new Error(
        `Error HTTP ${respuesta.status}` + (detalle ? `: ${detalle}` : ""),
      );
    }

    if (respuesta.status === 204) {
      return null;
    }

    const texto = await respuesta.text();
    return texto ? JSON.parse(texto) : null;
  }

  function crearBoton(texto, clase, accion, descripcion) {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.className = `servicios-action-button ${clase}`;
    boton.textContent = texto;
    boton.setAttribute("aria-label", descripcion);
    boton.addEventListener("click", accion);

    return boton;
  }

  function crearEtiquetaEstado(estado) {
    const etiqueta = document.createElement("span");
    const valor = String(estado || "").toUpperCase();

    etiqueta.classList.add("servicios-status");

    if (valor === "ACTIVO") {
      etiqueta.classList.add("servicios-status--active");
    } else if (valor === "INACTIVO") {
      etiqueta.classList.add("servicios-status--inactive");
    } else {
      etiqueta.classList.add("servicios-status--unknown");
    }

    etiqueta.textContent = valor || "SIN ESTADO";

    return etiqueta;
  }

  // --------------------------------------------------
  // CATEGORÍAS
  // --------------------------------------------------

  async function cargarCategorias() {
    const datos = await solicitar(API_CATEGORIAS);

    if (!Array.isArray(datos)) {
      throw new Error("La API de categorías no devolvió una lista.");
    }

    elementos.filtroCategoria.replaceChildren();

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Todas las categorías";

    elementos.filtroCategoria.appendChild(opcionInicial);

    datos.forEach((categoria) => {
      const opcion = document.createElement("option");

      opcion.value = String(categoria.id);
      opcion.textContent = categoria.nombre || "Sin nombre";

      elementos.filtroCategoria.appendChild(opcion);
    });
  }

  // --------------------------------------------------
  // CARGAR SERVICIOS
  // --------------------------------------------------

  async function cargarServicios() {
    elementos.contador.textContent = "Cargando servicios...";
    mostrarMensaje("Cargando servicios...");

    try {
      const datos = await solicitar(API);

      if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista de servicios.");
      }

      servicios = datos;
      filtrarYRenderizar();
    } catch (error) {
      console.error("Error al cargar servicios:", error);

      servicios = [];
      elementos.contador.textContent = "No se pudo cargar el catálogo.";

      mostrarMensaje(
        "No se pudieron cargar los servicios. Verifica el servidor e inténtalo nuevamente.",
        true,
      );
    }
  }

  // --------------------------------------------------
  // FILTROS
  // --------------------------------------------------

  function filtrarYRenderizar() {
    const texto = elementos.buscar.value.toLowerCase().trim();
    const categoriaId = elementos.filtroCategoria.value;

    const filtrados = servicios.filter((servicio) => {
      const nombre = String(servicio.nombre || "").toLowerCase();
      const codigo = String(servicio.codigo || "").toLowerCase();

      const coincideTexto =
        !texto || nombre.includes(texto) || codigo.includes(texto);

      const coincideCategoria =
        !categoriaId || String(servicio.categoria?.id ?? "") === categoriaId;

      return coincideTexto && coincideCategoria;
    });

    renderizarTabla(filtrados);
  }

  // --------------------------------------------------
  // TABLA Y ACCIONES
  // --------------------------------------------------

  function renderizarTabla(lista) {
    elementos.tbody.replaceChildren();

    elementos.contador.textContent = `${lista.length} servicio(s) encontrado(s)`;

    if (lista.length === 0) {
      mostrarMensaje("No se encontraron servicios coincidentes.");
      return;
    }

    lista.forEach((servicio) => {
      const fila = document.createElement("tr");

      fila.appendChild(crearCelda(servicio.codigo || "—", "servicios-code"));

      fila.appendChild(
        crearCelda(servicio.nombre || "Sin nombre", "servicios-name"),
      );

      fila.appendChild(
        crearCelda(servicio.categoria?.nombre || "Sin categoría"),
      );

      fila.appendChild(crearCelda(formatearPrecio(servicio.precio)));

      fila.appendChild(
        crearCelda(formatearCantidad(servicio.duracionMinutos, " min")),
      );

      fila.appendChild(crearCelda(formatearCantidad(servicio.capacidad)));

      const celdaEstado = document.createElement("td");
      celdaEstado.appendChild(crearEtiquetaEstado(servicio.estado));
      fila.appendChild(celdaEstado);

      const acciones = document.createElement("td");
      acciones.className = "servicios-actions-cell";

      // VISTA PREVIA: abrir una página independiente
      acciones.appendChild(
        crearBoton(
          "👁 Vista previa",
          "servicios-action-button--preview",
          () => {
            if (servicio.id === null || servicio.id === undefined) {
              alert("El servicio no tiene un ID válido.");
              return;
            }

            const urlVista = pagina.dataset.vistaUrl;

            window.location.href = `${urlVista}?servicioId=${encodeURIComponent(String(servicio.id))}`;
          },
          `Vista previa de ${servicio.nombre || "servicio"}`,
        ),
      );

      // EDITAR: abre servicio-form.html con el ID
      acciones.appendChild(
        crearBoton(
          "Editar",
          "servicios-action-button--edit",
          () => {
            if (servicio.id === null || servicio.id === undefined) {
              alert(
                "No se puede editar este servicio porque no tiene un ID válido.",
              );
              return;
            }

            window.location.href =
              URL_EDITAR + encodeURIComponent(String(servicio.id));
          },
          `Editar ${servicio.nombre || "servicio"}`,
        ),
      );

      // ELIMINAR
      acciones.appendChild(
        crearBoton(
          "Eliminar",
          "servicios-action-button--delete",
          () => eliminarServicio(servicio),
          `Eliminar ${servicio.nombre || "servicio"}`,
        ),
      );

      fila.appendChild(acciones);
      elementos.tbody.appendChild(fila);
    });
  }

  // --------------------------------------------------
  // VISTA PREVIA
  // --------------------------------------------------

  function establecerTexto(id, valor) {
    $(id).textContent =
      valor === null || valor === undefined || valor === ""
        ? "—"
        : String(valor);
  }

  function vistaPrevia(servicio) {
    establecerTexto("vistaCodigo", servicio.codigo);
    establecerTexto("vistaNombre", servicio.nombre);

    establecerTexto(
      "vistaCategoria",
      servicio.categoria?.nombre || "Sin categoría",
    );

    establecerTexto("vistaPrecio", formatearPrecio(servicio.precio));

    establecerTexto(
      "vistaDuracion",
      formatearCantidad(servicio.duracionMinutos, " minutos"),
    );

    establecerTexto(
      "vistaCapacidad",
      formatearCantidad(servicio.capacidad, " personas"),
    );

    establecerTexto("vistaEstado", servicio.estado);

    establecerTexto(
      "vistaDescripcion",
      servicio.descripcion || "No hay una descripción disponible.",
    );

    elementos.modalVista.hidden = false;
  }

  function cerrarVistaPrevia() {
    elementos.modalVista.hidden = true;
  }

  // --------------------------------------------------
  // ELIMINAR SERVICIO
  // --------------------------------------------------

  async function eliminarServicio(servicio) {
    if (servicio.id === null || servicio.id === undefined) {
      alert("No se puede eliminar este servicio porque no tiene un ID válido.");
      return;
    }

    const nombre = servicio.nombre || servicio.codigo || "este servicio";

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmar) return;

    try {
      await solicitar(`${API}/${encodeURIComponent(String(servicio.id))}`, {
        method: "DELETE",
      });

      await cargarServicios();
    } catch (error) {
      console.error("Error al eliminar servicio:", error);

      alert(`No se pudo eliminar el servicio.\n${error.message}`);
    }
  }

  // --------------------------------------------------
  // EVENTOS
  // --------------------------------------------------

  // Nuevo servicio: abre el formulario vacío
  elementos.btnNuevo.addEventListener("click", () => {
    window.location.href = URL_NUEVO;
  });

  elementos.buscar.addEventListener("input", filtrarYRenderizar);

  elementos.filtroCategoria.addEventListener("change", filtrarYRenderizar);

  elementos.cerrarVista.addEventListener("click", cerrarVistaPrevia);

  elementos.cerrarVistaFooter.addEventListener("click", cerrarVistaPrevia);

  elementos.modalVista.addEventListener("click", (evento) => {
    if (evento.target === elementos.modalVista) {
      cerrarVistaPrevia();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !elementos.modalVista.hidden) {
      cerrarVistaPrevia();
    }
  });

  // --------------------------------------------------
  // INICIALIZACIÓN
  // --------------------------------------------------

  async function iniciar() {
    try {
      await cargarCategorias();
    } catch (error) {
      console.error("Error al cargar categorías:", error);

      elementos.contador.textContent =
        "No se pudieron cargar las categorías. Puedes intentar buscar entre los servicios.";
    }

    await cargarServicios();
  }

  iniciar();
});
