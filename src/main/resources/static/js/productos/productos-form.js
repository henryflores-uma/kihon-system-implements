document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.querySelector(".productos-form-page");

  if (!pagina) return;

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  const API_PRODUCTOS = pagina.dataset.apiProductos;
  const API_CATEGORIAS = pagina.dataset.apiCategorias;
  const URL_LISTADO = pagina.dataset.listadoUrl;

  const form = document.getElementById("formProducto");
  const inputId = document.getElementById("productoId");
  const inputArchivo = document.getElementById("archivo");
  const nombreArchivo = document.getElementById("nombreArchivo");

  const selectCategoria = document.getElementById("categoriaId");
  const selectEstado = document.getElementById("estado");

  const tituloPagina = document.getElementById("tituloPagina");
  const subtituloPagina = document.getElementById("subtituloPagina");
  const breadcrumbAccion = document.getElementById("breadcrumbAccion");
  const btnGuardar = document.getElementById("btnGuardar");
  const btnCancelar = document.getElementById("btnCancelar");

  const mensajeFormulario = document.getElementById("mensajeFormulario");
  const imagenActual = document.getElementById("imagenActual");
  const nombreImagenActual = document.getElementById("nombreImagenActual");

  const campos = {
    codigo: document.getElementById("codigo"),
    nombre: document.getElementById("nombre"),
    descripcion: document.getElementById("descripcion"),
    precioCompra: document.getElementById("precioCompra"),
    precioVenta: document.getElementById("precioVenta"),
    stockActual: document.getElementById("stockActual"),
    stockMinimo: document.getElementById("stockMinimo"),
  };

  const idInicial = String(pagina.dataset.productoId || "").trim();
  const productoId = idInicial || String(inputId.value || "").trim();
  const modoEdicion = productoId !== "";

  inputId.value = productoId;

  let enviandoFormulario = false;
  let nombreImagenRegistrada = "";

  // ==========================================
  // CSRF Y PETICIONES
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
          // La respuesta no es JSON; conservamos el mensaje genérico.
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

  // ==========================================
  // MENSAJES
  // ==========================================

  function mostrarMensaje(texto, tipo = "error") {
    mensajeFormulario.textContent = texto;
    mensajeFormulario.hidden = false;

    mensajeFormulario.classList.toggle(
      "productos-form__message--success",
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
    mensajeFormulario.classList.remove("productos-form__message--success");
  }

  // ==========================================
  // CONFIGURAR MODO NUEVO / EDICIÓN
  // ==========================================

  function configurarModo() {
    if (modoEdicion) {
      breadcrumbAccion.textContent = "Editar";
      tituloPagina.textContent = "Editar producto";

      subtituloPagina.textContent =
        "Actualiza los datos, precios, stock y estado del producto seleccionado.";

      btnGuardar.textContent = "Guardar cambios";
    } else {
      breadcrumbAccion.textContent = "Nuevo";
      tituloPagina.textContent = "Nuevo producto";

      subtituloPagina.textContent =
        "Completa los datos obligatorios del artículo, precios, stock y estado.";

      btnGuardar.textContent = "Guardar";
    }
  }

  // ==========================================
  // CARGAR CATEGORÍAS
  // ==========================================

  async function cargarCategorias(categoriaSeleccionadaId = "") {
    selectCategoria.replaceChildren();

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Cargando categorías...";
    selectCategoria.appendChild(opcionInicial);
    selectCategoria.disabled = true;

    try {
      const respuesta = await solicitar(API_CATEGORIAS);
      const categorias = await leerJSON(respuesta);

      if (!Array.isArray(categorias)) {
        throw new Error("La API no devolvió una lista válida de categorías.");
      }

      selectCategoria.replaceChildren();

      const opcionInicialFinal = document.createElement("option");
      opcionInicialFinal.value = "";
      opcionInicialFinal.textContent = "Selecciona una categoría";
      selectCategoria.appendChild(opcionInicialFinal);

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
          "No hay categorías registradas. Registra una categoría antes de crear un producto.",
        );
      }
    } catch (error) {
      console.error("Error al cargar las categorías:", error);

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

  // ==========================================
  // CARGAR PRODUCTO PARA EDITAR
  // ==========================================

  async function cargarProducto() {
    const url = `${API_PRODUCTOS}/${encodeURIComponent(productoId)}`;

    const respuesta = await solicitar(url);
    const producto = await leerJSON(respuesta);

    if (!producto || typeof producto !== "object") {
      throw new Error("No se encontraron los datos del producto.");
    }

    campos.codigo.value = producto.codigo ?? "";
    campos.nombre.value = producto.nombre ?? "";
    campos.descripcion.value = producto.descripcion ?? "";

    campos.precioCompra.value = producto.precioCompra ?? 0;
    campos.precioVenta.value = producto.precioVenta ?? 0;
    campos.stockActual.value = producto.stockActual ?? 0;
    campos.stockMinimo.value = producto.stockMinimo ?? 5;

    selectEstado.value = producto.estado === "INACTIVO" ? "INACTIVO" : "ACTIVO";

    const categoriaId = producto.categoria?.id ?? "";

    selectCategoria.value = categoriaId === "" ? "" : String(categoriaId);

    if (categoriaId !== "" && selectCategoria.value !== String(categoriaId)) {
      mostrarMensaje(
        "La categoría de este producto no aparece en el selector. Verifica que la categoría siga registrada.",
      );
    }

    nombreImagenRegistrada = producto.rutaImagen || "";

    if (nombreImagenRegistrada) {
      nombreImagenActual.textContent = nombreImagenRegistrada.split("/").pop();

      imagenActual.hidden = false;
      nombreArchivo.textContent = "Selecciona una imagen para reemplazarla";
    }
  }

  // ==========================================
  // VALIDAR CAMPOS
  // ==========================================

  function validarFormulario() {
    const codigo = campos.codigo.value.trim();
    const nombre = campos.nombre.value.trim();

    if (!codigo || !nombre) {
      mostrarMensaje("El código y el nombre del producto son obligatorios.");
      return false;
    }

    if (!selectCategoria.value) {
      mostrarMensaje("Selecciona una categoría para el producto.");
      selectCategoria.focus();
      return false;
    }

    const precioCompra = Number(campos.precioCompra.value);
    const precioVenta = Number(campos.precioVenta.value);
    const stockActual = Number(campos.stockActual.value);
    const stockMinimo = Number(campos.stockMinimo.value);

    if (
      campos.precioCompra.value === "" ||
      !Number.isFinite(precioCompra) ||
      precioCompra < 0
    ) {
      mostrarMensaje(
        "Ingresa un precio de compra válido, igual o mayor que cero.",
      );
      campos.precioCompra.focus();
      return false;
    }

    if (
      campos.precioVenta.value === "" ||
      !Number.isFinite(precioVenta) ||
      precioVenta < 0
    ) {
      mostrarMensaje(
        "Ingresa un precio de venta válido, igual o mayor que cero.",
      );
      campos.precioVenta.focus();
      return false;
    }

    if (
      campos.stockActual.value === "" ||
      !Number.isInteger(stockActual) ||
      stockActual < 0
    ) {
      mostrarMensaje(
        "El stock actual debe ser un número entero igual o mayor que cero.",
      );
      campos.stockActual.focus();
      return false;
    }

    if (
      campos.stockMinimo.value === "" ||
      !Number.isInteger(stockMinimo) ||
      stockMinimo < 0
    ) {
      mostrarMensaje(
        "El stock mínimo debe ser un número entero igual o mayor que cero.",
      );
      campos.stockMinimo.focus();
      return false;
    }

    if (!["ACTIVO", "INACTIVO"].includes(selectEstado.value)) {
      mostrarMensaje("Selecciona un estado válido.");
      selectEstado.focus();
      return false;
    }

    const archivo = inputArchivo.files[0];

    if (archivo) {
      const tiposPermitidos = ["image/png", "image/jpeg"];

      if (!tiposPermitidos.includes(archivo.type)) {
        mostrarMensaje("La imagen debe estar en formato PNG o JPG/JPEG.");
        inputArchivo.focus();
        return false;
      }
    }

    return true;
  }

  // ==========================================
  // CONSTRUIR DATOS DEL PRODUCTO
  // ==========================================

  function obtenerDatosFormulario() {
    return {
      codigo: campos.codigo.value.trim(),
      nombre: campos.nombre.value.trim(),
      categoria: {
        id: Number(selectCategoria.value),
      },
      estado: selectEstado.value,
      descripcion: campos.descripcion.value.trim(),
      precioCompra: Number(campos.precioCompra.value),
      precioVenta: Number(campos.precioVenta.value),
      stockActual: Number(campos.stockActual.value),
      stockMinimo: Number(campos.stockMinimo.value),
    };
  }

  // ==========================================
  // GUARDAR IMAGEN
  // ==========================================

  async function subirImagen(id) {
    const archivo = inputArchivo.files[0];

    if (!archivo) return;

    const formData = new FormData();
    formData.append("archivo", archivo);

    const headers = {};
    const token = obtenerTokenCSRF();

    if (token) {
      headers[obtenerCabeceraCSRF()] = token;
    }

    const respuesta = await solicitar(
      `${API_PRODUCTOS}/${encodeURIComponent(String(id))}/imagen`,
      {
        method: "POST",
        headers,
        body: formData,
      },
    );

    await respuesta.text().catch(() => "");
  }

  // ==========================================
  // ENVIAR FORMULARIO
  // ==========================================

  async function guardarProducto(evento) {
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
      : "Registrando producto...";

    try {
      const datosProducto = obtenerDatosFormulario();

      const url = modoEdicion
        ? `${API_PRODUCTOS}/${encodeURIComponent(productoId)}`
        : API_PRODUCTOS;

      const metodo = modoEdicion ? "PUT" : "POST";

      const respuesta = await solicitar(url, {
        method: metodo,
        headers: crearCabecerasJSON(),
        body: JSON.stringify(datosProducto),
      });

      const resultado = await leerJSON(respuesta);

      const idGuardado = modoEdicion ? productoId : resultado?.id;

      if (inputArchivo.files.length > 0) {
        if (
          idGuardado === null ||
          idGuardado === undefined ||
          idGuardado === ""
        ) {
          throw new Error(
            "El producto se guardó, pero el servidor no devolvió su ID. No se pudo subir la imagen.",
          );
        }

        await subirImagen(idGuardado);
      }

      window.location.href = URL_LISTADO;
    } catch (error) {
      console.error("Error al guardar el producto:", error);

      mostrarMensaje(
        error.message ||
          "No se pudo guardar el producto. Comprueba los datos e inténtalo nuevamente.",
      );
    } finally {
      enviandoFormulario = false;
      btnGuardar.disabled = false;
      btnCancelar.disabled = false;

      btnGuardar.textContent = modoEdicion ? "Guardar cambios" : "Guardar";
    }
  }

  // ==========================================
  // EVENTOS
  // ==========================================

  inputArchivo.addEventListener("change", () => {
    const archivo = inputArchivo.files[0];

    nombreArchivo.textContent = archivo
      ? archivo.name
      : nombreImagenRegistrada
        ? "Selecciona una imagen para reemplazarla"
        : "Ningún archivo seleccionado";
  });

  btnCancelar.addEventListener("click", () => {
    window.location.href = URL_LISTADO;
  });

  form.addEventListener("submit", guardarProducto);

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  async function inicializar() {
    configurarModo();

    try {
      await cargarCategorias();

      if (modoEdicion) {
        await cargarProducto();
      }
    } catch (error) {
      console.error("Error al inicializar el formulario:", error);

      if (modoEdicion) {
        mostrarMensaje(
          "No se pudo cargar el producto para editar. Verifica que exista y que el servidor esté disponible.",
        );
      }
    }
  }

  inicializar();
});
