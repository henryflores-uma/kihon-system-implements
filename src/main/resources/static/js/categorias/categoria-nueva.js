document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.querySelector(".categoria-form-page");

  if (!pagina) return;

  const API = pagina.dataset.api;
  const LISTADO = pagina.dataset.listadoUrl;

  const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;

  const csrfHeader = document.querySelector(
    'meta[name="_csrf_header"]',
  )?.content;

  const formulario = document.getElementById("formCategoria");
  const guardar = document.getElementById("btnGuardar");
  const guardarLateral = document.getElementById("guardarLateral");
  const mensajeError = document.getElementById("mensajeError");

  const nombre = document.getElementById("nombre");
  const descripcion = document.getElementById("descripcion");
  const estado = document.getElementById("estado");
  const etiquetaEstado = document.getElementById("estadoActual");

  if (
    !API ||
    !LISTADO ||
    !formulario ||
    !guardar ||
    !guardarLateral ||
    !mensajeError ||
    !nombre ||
    !descripcion ||
    !estado ||
    !etiquetaEstado
  ) {
    console.error("No se encontraron todos los elementos del formulario.");
    return;
  }

  function actualizarEstado() {
    const activo = estado.value === "ACTIVO";

    etiquetaEstado.textContent = activo ? "Activo" : "Inactivo";
    etiquetaEstado.classList.toggle("inactivo", !activo);
  }

  function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
  }

  estado.addEventListener("change", actualizarEstado);

  guardarLateral.addEventListener("click", () => {
    formulario.requestSubmit();
  });

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mostrarError("");

    const datos = {
      nombre: nombre.value.trim(),
      descripcion: descripcion.value.trim(),
      estado: estado.value,
    };

    if (!datos.nombre) {
      mostrarError("Ingresa el nombre de la categoría.");
      nombre.focus();
      return;
    }

    guardar.disabled = true;
    guardarLateral.disabled = true;
    guardar.textContent = "Guardando...";
    guardarLateral.textContent = "Guardando...";

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (csrfToken && csrfHeader) {
        headers[csrfHeader] = csrfToken;
      }

      const respuesta = await fetch(API, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify(datos),
      });

      if (!respuesta.ok) {
        let mensaje = `No se pudo registrar la categoría (HTTP ${respuesta.status}).`;

        try {
          const error = await respuesta.json();
          mensaje = error.mensaje || error.message || mensaje;
        } catch (_) {
          // Se mantiene el mensaje HTTP si la respuesta no es JSON.
        }

        throw new Error(mensaje);
      }

      window.location.assign(LISTADO);
    } catch (error) {
      mostrarError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar la categoría.",
      );

      guardar.disabled = false;
      guardarLateral.disabled = false;
      guardar.textContent = "Guardar categoría";
      guardarLateral.textContent = "Guardar";
    }
  });

  actualizarEstado();
});
