document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.querySelector(".categoria-form-page");

  if (!pagina) return;

  const API = pagina.dataset.api;
  const LISTADO = pagina.dataset.listadoUrl;
  const categoriaId = pagina.dataset.categoriaId;

  const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;

  const csrfHeader = document.querySelector(
    'meta[name="_csrf_header"]',
  )?.content;

  const formulario = document.getElementById("formCategoria");
  const guardar = document.getElementById("btnGuardar");
  const guardarLateral = document.getElementById("guardarLateral");

  const nombre = document.getElementById("nombre");
  const descripcion = document.getElementById("descripcion");
  const estado = document.getElementById("estado");

  const etiquetaEstado = document.getElementById("estadoActual");
  const subtitulo = document.getElementById("subtitulo");
  const mensajeError = document.getElementById("mensajeError");

  if (
    !API ||
    !LISTADO ||
    categoriaId === undefined ||
    categoriaId === null ||
    categoriaId === "" ||
    !formulario ||
    !guardar ||
    !guardarLateral ||
    !nombre ||
    !descripcion ||
    !estado ||
    !etiquetaEstado ||
    !subtitulo ||
    !mensajeError
  ) {
    mostrarError("No se pudo inicializar el formulario de edición.");
    return;
  }

  function mostrarError(mensaje) {
    const elemento = document.getElementById("mensajeError");

    if (elemento) {
      elemento.textContent = mensaje;
    }
  }

  function normalizarEstado(valor) {
    if (valor === true || valor === 1) return "ACTIVO";
    if (valor === false || valor === 0) return "INACTIVO";

    if (valor && typeof valor === "object") {
      valor = valor.nombre ?? valor.estado ?? "";
    }

    const resultado = String(valor ?? "")
      .trim()
      .toUpperCase();

    if (["ACTIVO", "INACTIVO"].includes(resultado)) {
      return resultado;
    }

    return "";
  }

  function actualizarEtiqueta() {
    const activo = estado.value === "ACTIVO";

    etiquetaEstado.textContent = activo ? "Activo" : "Inactivo";
    etiquetaEstado.classList.toggle("inactivo", !activo);
  }

  function establecerCarga(cargando) {
    guardar.disabled = cargando;
    guardarLateral.disabled = cargando;

    guardar.textContent = cargando ? "Guardando..." : "Guardar cambios";

    guardarLateral.textContent = cargando ? "Guardando..." : "Guardar cambios";
  }

  async function leerError(respuesta) {
    const texto = await respuesta.text();

    if (texto) {
      try {
        const error = JSON.parse(texto);

        return (
          error.mensaje ||
          error.message ||
          error.error ||
          `Error HTTP ${respuesta.status}`
        );
      } catch (_) {
        return texto.length < 300 ? texto : `Error HTTP ${respuesta.status}`;
      }
    }

    return `Error HTTP ${respuesta.status}`;
  }

  async function cargarCategoria() {
    guardar.disabled = true;
    guardarLateral.disabled = true;
    mensajeError.textContent = "";

    try {
      const respuesta = await fetch(
        `${API}/${encodeURIComponent(categoriaId)}`,
        {
          method: "GET",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error(await leerError(respuesta));
      }

      const categoria = await respuesta.json();

      if (!categoria || typeof categoria !== "object") {
        throw new Error("La respuesta de la API no es válida.");
      }

      nombre.value = categoria.nombre ?? "";
      descripcion.value = categoria.descripcion ?? "";

      const estadoNormalizado = normalizarEstado(categoria.estado);

      if (!estadoNormalizado) {
        throw new Error("El estado recibido de la categoría no es válido.");
      }

      estado.value = estadoNormalizado;

      subtitulo.textContent = `Actualiza la información de ${categoria.nombre ?? "la categoría"}.`;

      actualizarEtiqueta();

      guardar.disabled = false;
      guardarLateral.disabled = false;
    } catch (error) {
      mostrarError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la categoría.",
      );
    }
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensajeError.textContent = "";

    const datos = {
      nombre: nombre.value.trim(),
      descripcion: descripcion.value.trim(),
      estado: estado.value,
    };

    if (!datos.nombre) {
      mostrarError("El nombre de la categoría es obligatorio.");
      nombre.focus();
      return;
    }

    establecerCarga(true);

    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (csrfToken && csrfHeader) {
        headers[csrfHeader] = csrfToken;
      }

      const respuesta = await fetch(
        `${API}/${encodeURIComponent(categoriaId)}`,
        {
          method: "PUT",
          credentials: "same-origin",
          headers,
          body: JSON.stringify(datos),
        },
      );

      if (!respuesta.ok) {
        throw new Error(await leerError(respuesta));
      }

      window.location.assign(LISTADO);
    } catch (error) {
      mostrarError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar la categoría.",
      );

      establecerCarga(false);
    }
  });

  estado.addEventListener("change", actualizarEtiqueta);

  guardarLateral.addEventListener("click", () => {
    formulario.requestSubmit();
  });

  cargarCategoria();
});
