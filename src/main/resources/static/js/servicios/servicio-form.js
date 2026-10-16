document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.querySelector(".servicio-form-page");
  if (!pagina) return;

  const API_SERVICIOS = pagina.dataset.apiServicios;
  const API_CATEGORIAS = pagina.dataset.apiCategorias;
  const URL_LISTADO = pagina.dataset.listadoUrl;

  const $ = (id) => document.getElementById(id);

  const form = $("formServicio");
  const inputId = $("servicioId");
  const selectCategoria = $("categoriaId");
  const selectEstado = $("estado");
  const tituloPagina = $("tituloPagina");
  const subtituloPagina = $("subtituloPagina");
  const breadcrumbAccion = $("breadcrumbAccion");
  const btnGuardar = $("btnGuardar");
  const btnCancelar = $("btnCancelar");
  const mensajeFormulario = $("mensajeFormulario");

  const inputImagen = $("imagen");
  const vistaPreviaImagen = $("vistaPreviaImagen");
  const contenedorVistaPrevia = $("contenedorVistaPrevia");
  const btnQuitarImagen = $("btnQuitarImagen");

  const campos = {
    codigo: $("codigo"),
    nombre: $("nombre"),
    descripcion: $("descripcion"),
    precio: $("precio"),
    duracionMinutos: $("duracionMinutos"),
    capacidad: $("capacidad"),
  };

  const idInicial = String(pagina.dataset.servicioId || "").trim();
  const servicioId = idInicial || String(inputId.value || "").trim();
  const modoEdicion = servicioId !== "";

  inputId.value = servicioId;

  let enviandoFormulario = false;
  let imagenSeleccionada = null;
  let urlVistaPrevia = null;
  let rutaImagenActual = null;

  // --------------------------------------------------
  // CSRF Y PETICIONES
  // --------------------------------------------------

  function obtenerTokenCSRF() {
    return document.querySelector('meta[name="_csrf"]')?.content || "";
  }

  function obtenerCabeceraCSRF() {
    return (
      document.querySelector('meta[name="_csrf_header"]')?.content ||
      "X-CSRF-TOKEN"
    );
  }

  function crearCabecerasJSON() {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const token = obtenerTokenCSRF();

    if (token) {
      headers[obtenerCabeceraCSRF()] = token;
    }

    return headers;
  }

  function crearCabecerasMultipart() {
    const headers = {
      Accept: "application/json",
    };

    const token = obtenerTokenCSRF();

    if (token) {
      headers[obtenerCabeceraCSRF()] = token;
    }

    // No establecer Content-Type manualmente.
    // El navegador agrega el boundary de multipart/form-data.
    return headers;
  }

  async function solicitar(url, opciones = {}) {
    const respuesta = await fetch(url, {
      ...opciones,
      headers: {
        Accept: "application/json",
        ...opciones.headers,
      },
    });

    if (!respuesta.ok) {
      const texto = await respuesta.text().catch(() => "");
      let mensaje = `Error del servidor (${respuesta.status}).`;

      if (texto) {
        try {
          const datos = JSON.parse(texto);
          mensaje = datos.mensaje || datos.message || mensaje;
        } catch {
          // Se conserva el mensaje genérico.
        }
      }

      throw new Error(mensaje);
    }

    return respuesta;
  }

  async function leerJSON(respuesta) {
    const texto = await respuesta.text();

    if (!texto.trim()) return null;

    try {
      return JSON.parse(texto);
    } catch {
      throw new Error("El servidor devolvió una respuesta no válida.");
    }
  }

  // --------------------------------------------------
  // MENSAJES
  // --------------------------------------------------

  function mostrarMensaje(texto, tipo = "error") {
    mensajeFormulario.textContent = texto;
    mensajeFormulario.hidden = false;

    mensajeFormulario.classList.toggle(
      "servicio-form__message--success",
      tipo === "success",
    );

    mensajeFormulario.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  function ocultarMensaje() {
    mensajeFormulario.textContent = "";
    mensajeFormulario.hidden = true;
    mensajeFormulario.classList.remove("servicio-form__message--success");
  }

  // --------------------------------------------------
  // IMAGEN DEL SERVICIO
  // --------------------------------------------------

  function liberarVistaPreviaTemporal() {
    if (urlVistaPrevia) {
      URL.revokeObjectURL(urlVistaPrevia);
      urlVistaPrevia = null;
    }
  }

  function mostrarImagenActual() {
    liberarVistaPreviaTemporal();

    if (!rutaImagenActual) {
      vistaPreviaImagen.removeAttribute("src");
      contenedorVistaPrevia.hidden = true;
      return;
    }

    vistaPreviaImagen.src = rutaImagenActual;
    contenedorVistaPrevia.hidden = false;
  }

  function mostrarImagenSeleccionada(archivo) {
    liberarVistaPreviaTemporal();

    urlVistaPrevia = URL.createObjectURL(archivo);
    vistaPreviaImagen.src = urlVistaPrevia;
    contenedorVistaPrevia.hidden = false;
  }

  function configurarEventosImagen() {
    inputImagen.addEventListener("change", () => {
      ocultarMensaje();

      const archivo = inputImagen.files?.[0];

      if (!archivo) {
        imagenSeleccionada = null;
        mostrarImagenActual();
        return;
      }

      const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

      if (!tiposPermitidos.includes(archivo.type)) {
        inputImagen.value = "";
        imagenSeleccionada = null;
        mostrarImagenActual();

        mostrarMensaje("Selecciona una imagen JPG, PNG o WEBP.");
        return;
      }

      if (archivo.size > 5 * 1024 * 1024) {
        inputImagen.value = "";
        imagenSeleccionada = null;
        mostrarImagenActual();

        mostrarMensaje("La imagen no puede superar los 5 MB.");
        return;
      }

      imagenSeleccionada = archivo;
      mostrarImagenSeleccionada(archivo);
    });

    btnQuitarImagen.addEventListener("click", () => {
      inputImagen.value = "";
      imagenSeleccionada = null;
      mostrarImagenActual();
    });
  }

  // --------------------------------------------------
  // MODO NUEVO / EDICIÓN
  // --------------------------------------------------

  function configurarModo() {
    if (modoEdicion) {
      breadcrumbAccion.textContent = "Editar";
      tituloPagina.textContent = "Editar servicio";

      subtituloPagina.textContent =
        "Actualiza los datos, precio, duración, capacidad y estado del servicio.";

      btnGuardar.textContent = "Guardar cambios";
    } else {
      breadcrumbAccion.textContent = "Nuevo";
      tituloPagina.textContent = "Nuevo servicio";

      subtituloPagina.textContent =
        "Completa los datos del servicio, precio, duración, capacidad y estado.";

      btnGuardar.textContent = "Guardar servicio";
    }
  }

  // --------------------------------------------------
  // CATEGORÍAS
  // --------------------------------------------------

  async function cargarCategorias(categoriaSeleccionadaId = "") {
    selectCategoria.replaceChildren();

    const opcionCarga = document.createElement("option");
    opcionCarga.value = "";
    opcionCarga.textContent = "Cargando categorías...";
    selectCategoria.appendChild(opcionCarga);
    selectCategoria.disabled = true;

    try {
      const respuesta = await solicitar(API_CATEGORIAS);
      const categorias = await leerJSON(respuesta);

      if (!Array.isArray(categorias)) {
        throw new Error("La API no devolvió una lista válida de categorías.");
      }

      selectCategoria.replaceChildren();

      const opcionInicial = document.createElement("option");
      opcionInicial.value = "";
      opcionInicial.textContent = "Selecciona una categoría";
      selectCategoria.appendChild(opcionInicial);

      categorias.forEach((categoria) => {
        const opcion = document.createElement("option");

        opcion.value = String(categoria.id);
        opcion.textContent = categoria.nombre || "Sin nombre";

        if (
          categoriaSeleccionadaId !== "" &&
          String(categoria.id) === String(categoriaSeleccionadaId)
        ) {
          opcion.selected = true;
        }

        selectCategoria.appendChild(opcion);
      });

      selectCategoria.disabled = false;

      if (categorias.length === 0) {
        mostrarMensaje(
          "No hay categorías registradas. Registra una categoría antes de crear un servicio.",
        );
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);

      selectCategoria.replaceChildren();

      const opcionError = document.createElement("option");
      opcionError.value = "";
      opcionError.textContent = "No se pudieron cargar las categorías";
      selectCategoria.appendChild(opcionError);

      selectCategoria.disabled = true;

      mostrarMensaje(
        "No se pudieron cargar las categorías. Comprueba la conexión e inténtalo nuevamente.",
      );

      throw error;
    }
  }

  // --------------------------------------------------
  // CARGAR SERVICIO PARA EDITAR
  // --------------------------------------------------

  async function cargarServicio() {
    if (!/^\d+$/.test(servicioId)) {
      throw new Error("El identificador del servicio no es válido.");
    }

    const respuesta = await solicitar(
      `${API_SERVICIOS}/${encodeURIComponent(servicioId)}`,
    );

    const servicio = await leerJSON(respuesta);

    if (!servicio || typeof servicio !== "object") {
      throw new Error("No se encontraron los datos del servicio.");
    }

    campos.codigo.value = servicio.codigo ?? "";
    campos.nombre.value = servicio.nombre ?? "";
    campos.descripcion.value = servicio.descripcion ?? "";
    campos.precio.value = servicio.precio ?? 0;

    campos.duracionMinutos.value = servicio.duracionMinutos ?? "";
    campos.capacidad.value = servicio.capacidad ?? "";

    selectEstado.value = servicio.estado === "INACTIVO" ? "INACTIVO" : "ACTIVO";

    const categoriaId = servicio.categoria?.id ?? "";
    selectCategoria.value = categoriaId === "" ? "" : String(categoriaId);

    if (categoriaId !== "" && selectCategoria.value !== String(categoriaId)) {
      mostrarMensaje(
        "La categoría de este servicio no aparece en el selector. Verifica que siga registrada.",
      );
    }

    // Para un bucket privado, el backend debe devolver una URL firmada
    // vigente en imagenUrl. rutaImagen por sí sola es una ruta interna.
    rutaImagenActual = servicio.imagenUrl || servicio.urlImagen || null;

    mostrarImagenActual();
  }

  // --------------------------------------------------
  // VALIDAR FORMULARIO
  // --------------------------------------------------

  function validarFormulario() {
    const codigo = campos.codigo.value.trim();
    const nombre = campos.nombre.value.trim();

    if (!codigo || !nombre) {
      mostrarMensaje("El código y el nombre del servicio son obligatorios.");
      return false;
    }

    if (!selectCategoria.value) {
      mostrarMensaje("Selecciona una categoría para el servicio.");
      selectCategoria.focus();
      return false;
    }

    if (
      campos.precio.value === "" ||
      !Number.isFinite(Number(campos.precio.value)) ||
      Number(campos.precio.value) < 0
    ) {
      mostrarMensaje("Ingresa un precio válido, igual o mayor que cero.");
      campos.precio.focus();
      return false;
    }

    const duracion = campos.duracionMinutos.value.trim();

    if (
      duracion !== "" &&
      (!Number.isInteger(Number(duracion)) || Number(duracion) < 1)
    ) {
      mostrarMensaje("La duración debe ser un número entero positivo.");
      campos.duracionMinutos.focus();
      return false;
    }

    const capacidad = campos.capacidad.value.trim();

    if (
      capacidad !== "" &&
      (!Number.isInteger(Number(capacidad)) || Number(capacidad) < 1)
    ) {
      mostrarMensaje("La capacidad debe ser un número entero positivo.");
      campos.capacidad.focus();
      return false;
    }

    if (!["ACTIVO", "INACTIVO"].includes(selectEstado.value)) {
      mostrarMensaje("Selecciona un estado válido.");
      selectEstado.focus();
      return false;
    }

    return true;
  }

  // --------------------------------------------------
  // CONSTRUIR DATOS
  // --------------------------------------------------

  function obtenerDatosFormulario() {
    const duracion = campos.duracionMinutos.value.trim();
    const capacidad = campos.capacidad.value.trim();

    return {
      codigo: campos.codigo.value.trim(),
      nombre: campos.nombre.value.trim(),
      categoria: {
        id: Number(selectCategoria.value),
      },
      descripcion: campos.descripcion.value.trim() || null,
      precio: Number(campos.precio.value),
      duracionMinutos: duracion === "" ? null : Number(duracion),
      capacidad: capacidad === "" ? null : Number(capacidad),
      estado: selectEstado.value,
    };
  }

  // --------------------------------------------------
  // GUARDAR SERVICIO
  // --------------------------------------------------

  async function guardarServicio(evento) {
    evento.preventDefault();
    ocultarMensaje();

    if (enviandoFormulario) return;
    if (!form.reportValidity()) return;
    if (!validarFormulario()) return;

    enviandoFormulario = true;
    btnGuardar.disabled = true;
    btnCancelar.disabled = true;

    btnGuardar.textContent = modoEdicion
      ? "Guardando cambios..."
      : "Registrando servicio...";

    let urlVistaPreviaGuardada = urlVistaPrevia;

    try {
      const datosServicio = obtenerDatosFormulario();

      const url = modoEdicion
        ? `${API_SERVICIOS}/${encodeURIComponent(servicioId)}`
        : API_SERVICIOS;

      const metodo = modoEdicion ? "PUT" : "POST";

      const formularioDatos = new FormData();

      formularioDatos.append(
        "servicio",
        new Blob([JSON.stringify(datosServicio)], { type: "application/json" }),
      );

      if (imagenSeleccionada) {
        formularioDatos.append("imagen", imagenSeleccionada);
      }

      const respuesta = await solicitar(url, {
        method: metodo,
        headers: crearCabecerasMultipart(),
        body: formularioDatos,
      });

      await leerJSON(respuesta);

      window.location.href = URL_LISTADO;
    } catch (error) {
      console.error("Error al guardar el servicio:", error);

      mostrarMensaje(
        error.message ||
          "No se pudo guardar el servicio. Comprueba los datos e inténtalo nuevamente.",
      );
    } finally {
      enviandoFormulario = false;
      btnGuardar.disabled = false;
      btnCancelar.disabled = false;

      btnGuardar.textContent = modoEdicion
        ? "Guardar cambios"
        : "Guardar servicio";
    }
  }

  // --------------------------------------------------
  // EVENTOS
  // --------------------------------------------------

  btnCancelar.addEventListener("click", () => {
    window.location.href = URL_LISTADO;
  });

  form.addEventListener("submit", guardarServicio);

  window.addEventListener("beforeunload", () => {
    liberarVistaPreviaTemporal();
  });

  // --------------------------------------------------
  // INICIALIZACIÓN
  // --------------------------------------------------

  async function inicializar() {
    configurarModo();
    configurarEventosImagen();

    try {
      await cargarCategorias();

      if (modoEdicion) {
        await cargarServicio();
      }
    } catch (error) {
      console.error("Error al inicializar el formulario de servicios:", error);

      mostrarMensaje(
        error.message ||
          "No se pudo cargar el formulario. Comprueba que el servidor esté disponible.",
      );
    }
  }

  inicializar();
});
