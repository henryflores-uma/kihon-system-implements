document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.querySelector(".productos-page");

  if (!pagina) return;

  const API_PRODUCTOS = pagina.dataset.apiProductos;
  const API_CATEGORIAS = pagina.dataset.apiCategorias;
  const URL_NUEVO = pagina.dataset.nuevoUrl;
  const URL_EDITAR = pagina.dataset.editarUrl;
  const URL_VISTA_PREVIA = pagina.dataset.vistaPreviaUrl;

  const tbody = document.getElementById("tablaProductosBody");
  const contadorProductos = document.getElementById("contadorProductos");
  const inputBuscar = document.getElementById("inputBuscar");
  const selectFiltroCategoria = document.getElementById(
    "selectFiltroCategoria",
  );
  const btnNuevoProducto = document.getElementById("btnNuevoProducto");

  let listaProductosGlobal = [];

  // ==========================================
  // CONFIGURACIÓN Y UTILIDADES
  // ==========================================

  function obtenerTokenCSRF() {
    return document.querySelector('meta[name="_csrf"]')?.content || "";
  }

  function obtenerCabeceraCSRF() {
    return (
      document.querySelector('meta[name="_csrf_header"]')?.content ||
      "X-CSRF-TOKEN"
    );
  }

  function crearCelda(texto, clase = "") {
    const td = document.createElement("td");
    td.textContent = texto ?? "";

    if (clase) {
      td.className = clase;
    }

    return td;
  }

  function formatearPrecio(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "—";
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return "—";
    }

    return `S/ ${numero.toFixed(2)}`;
  }

  function formatearCantidad(valor) {
    if (valor === null || valor === undefined || valor === "") {
      return "—";
    }

    return String(valor);
  }

  function mostrarMensaje(mensaje, esError = false) {
    tbody.replaceChildren();

    const fila = document.createElement("tr");
    fila.className = "productos-table-empty-row";

    const celda = document.createElement("td");
    celda.colSpan = 9;
    celda.className = "productos-table-message";

    if (esError) {
      celda.classList.add("productos-table-message--error");
    }

    celda.textContent = mensaje;
    fila.appendChild(celda);
    tbody.appendChild(fila);
  }

  async function obtenerRespuesta(url, opciones = {}) {
    const respuesta = await fetch(url, {
      ...opciones,
      headers: {
        Accept: "application/json",
        ...opciones.headers,
      },
    });

    if (!respuesta.ok) {
      throw new Error(`La solicitud falló: HTTP ${respuesta.status}`);
    }

    return respuesta;
  }

  // ==========================================
  // CARGAR CATEGORÍAS
  // ==========================================

  async function cargarFiltroCategorias() {
    try {
      const respuesta = await obtenerRespuesta(API_CATEGORIAS);
      const categorias = await respuesta.json();

      if (!Array.isArray(categorias)) {
        throw new Error("La API no devolvió una lista válida de categorías.");
      }

      selectFiltroCategoria.replaceChildren();

      const opcionTodas = document.createElement("option");
      opcionTodas.value = "";
      opcionTodas.textContent = "Todas las categorías";
      selectFiltroCategoria.appendChild(opcionTodas);

      categorias.forEach((categoria) => {
        const opcion = document.createElement("option");

        opcion.value = String(categoria.id);
        opcion.textContent = categoria.nombre || "Sin nombre";

        selectFiltroCategoria.appendChild(opcion);
      });
    } catch (error) {
      console.error("Error al cargar las categorías:", error);
    }
  }

  // ==========================================
  // CARGAR PRODUCTOS
  // ==========================================

  async function cargarProductos() {
    contadorProductos.textContent = "Cargando productos...";
    mostrarMensaje("Cargando productos...");

    try {
      const respuesta = await obtenerRespuesta(API_PRODUCTOS);
      const productos = await respuesta.json();

      if (!Array.isArray(productos)) {
        throw new Error("La API no devolvió una lista válida de productos.");
      }

      listaProductosGlobal = productos;
      filtrarYRenderizar();
    } catch (error) {
      console.error("Error al cargar los productos:", error);

      listaProductosGlobal = [];

      contadorProductos.textContent = "No se pudo cargar el catálogo.";

      mostrarMensaje(
        "No se pudieron cargar los datos del servidor. Intenta nuevamente.",
        true,
      );
    }
  }

  // ==========================================
  // FILTRAR PRODUCTOS
  // ==========================================

  function filtrarYRenderizar() {
    const textoBusqueda = inputBuscar.value.toLowerCase().trim();
    const categoriaSeleccionada = selectFiltroCategoria.value;

    const productosFiltrados = listaProductosGlobal.filter((producto) => {
      const nombre = String(producto.nombre || "").toLowerCase();
      const codigo = String(producto.codigo || "").toLowerCase();

      const coincideTexto =
        !textoBusqueda ||
        nombre.includes(textoBusqueda) ||
        codigo.includes(textoBusqueda);

      const coincideCategoria =
        !categoriaSeleccionada ||
        (producto.categoria &&
          String(producto.categoria.id) === categoriaSeleccionada);

      return coincideTexto && coincideCategoria;
    });

    renderizarTabla(productosFiltrados);
  }

  // ==========================================
  // ESTADO DEL PRODUCTO
  // ==========================================

  function crearEtiquetaEstado(estado) {
    const etiqueta = document.createElement("span");
    const valor = String(estado ?? "").toUpperCase();

    etiqueta.classList.add("productos-status");

    if (valor === "ACTIVO") {
      etiqueta.classList.add("productos-status--active");
      etiqueta.textContent = "ACTIVO";
    } else if (valor === "INACTIVO") {
      etiqueta.classList.add("productos-status--inactive");
      etiqueta.textContent = "INACTIVO";
    } else {
      etiqueta.classList.add("productos-status--unknown");
      etiqueta.textContent = valor || "SIN ESTADO";
    }

    return etiqueta;
  }

  // ==========================================
  // CONSTRUIR BOTONES DE ACCIÓN
  // ==========================================

  function crearBotonAccion(texto, clase, accion) {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.className = `productos-action-button ${clase}`;
    boton.textContent = texto;
    boton.addEventListener("click", accion);

    return boton;
  }

  // ==========================================
  // CONSTRUIR FILAS DE LA TABLA
  // ==========================================

  function renderizarTabla(productos) {
    tbody.replaceChildren();

    contadorProductos.textContent = `${productos.length} producto(s) encontrado(s) en el catálogo`;

    if (productos.length === 0) {
      mostrarMensaje("No se encontraron registros coincidentes.");
      return;
    }

    productos.forEach((producto) => {
      const fila = document.createElement("tr");

      const categoriaNombre = producto.categoria?.nombre || "Sin categoría";

      fila.appendChild(crearCelda(producto.codigo || "—", "productos-code"));

      fila.appendChild(
        crearCelda(producto.nombre || "Sin nombre", "productos-name"),
      );

      fila.appendChild(crearCelda(categoriaNombre, "productos-category"));

      fila.appendChild(crearCelda(formatearPrecio(producto.precioCompra)));

      fila.appendChild(crearCelda(formatearPrecio(producto.precioVenta)));

      fila.appendChild(crearCelda(formatearCantidad(producto.stockActual)));

      fila.appendChild(
        crearCelda(
          formatearCantidad(producto.stockMinimo),
          "productos-stock-min",
        ),
      );

      const celdaEstado = document.createElement("td");
      celdaEstado.appendChild(crearEtiquetaEstado(producto.estado));
      fila.appendChild(celdaEstado);

      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "productos-actions-cell";

      const botonVistaPrevia = crearBotonAccion(
        "👁 Vista previa",
        "productos-action-button--preview",
        () => vistaPreviaProducto(producto.id),
      );

      botonVistaPrevia.style.marginRight = "0.5rem";
      botonVistaPrevia.setAttribute(
        "aria-label",
        `Vista previa de ${producto.nombre || "producto"}`,
      );

      const botonEditar = crearBotonAccion(
        "Editar",
        "productos-action-button--edit",
        () => editarProducto(producto.id),
      );

      botonEditar.style.marginRight = "0.5rem";

      const botonEliminar = crearBotonAccion(
        "Eliminar",
        "productos-action-button--delete",
        () => eliminarProducto(producto.id, producto.nombre),
      );

      celdaAcciones.append(botonVistaPrevia, botonEditar, botonEliminar);

      fila.appendChild(celdaAcciones);
      tbody.appendChild(fila);
    });
  }

  // ==========================================
  // VISTA PREVIA DEL PRODUCTO
  // ==========================================

  function vistaPreviaProducto(id) {
    if (id === null || id === undefined || String(id).trim() === "") {
      alert("No se pudo identificar el producto.");
      return;
    }

    if (!URL_VISTA_PREVIA) {
      alert("No se ha configurado la dirección de la vista previa.");
      return;
    }

    const url = new URL(URL_VISTA_PREVIA, window.location.origin);

    url.searchParams.set("productoId", String(id));

    window.location.href = url.toString();
  }

  // ==========================================
  // EDITAR PRODUCTO
  // ==========================================

  function editarProducto(id) {
    if (id === null || id === undefined) {
      alert("No se pudo identificar el producto.");
      return;
    }

    window.location.href = `${URL_EDITAR}${encodeURIComponent(String(id))}`;
  }

  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================

  async function eliminarProducto(id, nombre) {
    if (id === null || id === undefined) {
      alert("No se pudo identificar el producto.");
      return;
    }

    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar el producto "${nombre || ""}"?`,
    );

    if (!confirmacion) return;

    try {
      const token = obtenerTokenCSRF();
      const cabeceraCSRF = obtenerCabeceraCSRF();

      const headers = {};

      if (token) {
        headers[cabeceraCSRF] = token;
      }

      await obtenerRespuesta(
        `${API_PRODUCTOS}/${encodeURIComponent(String(id))}`,
        {
          method: "DELETE",
          headers,
        },
      );

      await cargarProductos();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);

      alert(
        "No se pudo eliminar el producto. Verifica si está relacionado " +
          "con otros registros y vuelve a intentarlo.",
      );
    }
  }

  // ==========================================
  // EVENTOS
  // ==========================================

  btnNuevoProducto.addEventListener("click", () => {
    window.location.href = URL_NUEVO;
  });

  inputBuscar.addEventListener("input", filtrarYRenderizar);

  selectFiltroCategoria.addEventListener("change", filtrarYRenderizar);

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  async function inicializar() {
    await Promise.all([cargarFiltroCategorias(), cargarProductos()]);
  }

  inicializar();
});
