document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".servicio-vista");

  if (!contenedor) return;

  const API_SERVICIOS = contenedor.dataset.apiServicios;
  const LISTADO_URL = contenedor.dataset.listadoUrl || "/admin/servicios";

  const $ = (id) => document.getElementById(id);

  const elementos = {
    cargando: $("vistaServicioCargando"),
    error: $("vistaServicioError"),
    tarjeta: $("vistaServicioCard"),
    imagen: $("vistaServicioImagen"),
    placeholder: $("vistaServicioPlaceholder"),
    nombreBanner: $("vistaServicioNombreBanner"),
    estado: $("vistaServicioEstado"),
    categoria: $("vistaServicioCategoria"),
    codigo: $("vistaServicioCodigo"),
    precio: $("vistaServicioPrecio"),
    descripcion: $("vistaServicioDescripcion"),
    duracion: $("vistaServicioDuracion"),
    capacidad: $("vistaServicioCapacidad"),
    estadoDetalle: $("vistaServicioEstadoDetalle"),
    editar: $("vistaServicioEditar"),
  };

  const parametros = new URLSearchParams(window.location.search);
  const servicioId = parametros.get("servicioId");

  function mostrarError(mensaje) {
    elementos.cargando.hidden = true;
    elementos.tarjeta.hidden = true;
    elementos.error.hidden = false;
    elementos.error.textContent = mensaje;
  }

  function establecerTexto(elemento, valor, valorAlternativo = "—") {
    elemento.textContent =
      valor === null || valor === undefined || valor === ""
        ? valorAlternativo
        : String(valor);
  }

  function formatearPrecio(precio) {
    if (precio === null || precio === undefined || precio === "") {
      return "Precio no especificado";
    }

    const numero = Number(precio);

    if (!Number.isFinite(numero)) {
      return "Precio no disponible";
    }

    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(numero);
  }

  function configurarEstado(estado) {
    const valor = String(estado || "").toUpperCase();

    elementos.estado.textContent = valor || "SIN ESTADO";
    elementos.estadoDetalle.textContent = valor || "Sin estado";

    elementos.estado.classList.remove("activo", "inactivo");

    if (valor === "ACTIVO") {
      elementos.estado.classList.add("activo");
    } else if (valor === "INACTIVO") {
      elementos.estado.classList.add("inactivo");
    }
  }

  function mostrarImagen(url) {
    if (!url) {
      elementos.imagen.hidden = true;
      elementos.imagen.removeAttribute("src");
      elementos.placeholder.hidden = false;
      return;
    }

    elementos.imagen.onload = () => {
      elementos.imagen.hidden = false;
      elementos.placeholder.hidden = true;
      elementos.imagen.alt =
        elementos.nombreBanner.textContent || "Imagen del servicio";
    };

    elementos.imagen.onerror = () => {
      elementos.imagen.hidden = true;
      elementos.imagen.removeAttribute("src");
      elementos.placeholder.hidden = false;

      console.error("No se pudo cargar la imagen del servicio.");
    };

    elementos.imagen.src = url;
  }

  async function cargarImagenFirmada(id) {
    const respuesta = await fetch(
      `${API_SERVICIOS}/${encodeURIComponent(id)}/imagen-url`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!respuesta.ok) {
      // El servicio puede no tener una imagen registrada.
      if (respuesta.status === 404) {
        return null;
      }

      throw new Error(
        `No se pudo obtener la imagen del servicio. HTTP ${respuesta.status}`,
      );
    }

    const datos = await respuesta.json();

    return datos.urlImagen || null;
  }

  async function cargarServicio() {
    if (!servicioId || !/^\d+$/.test(servicioId)) {
      mostrarError("El identificador del servicio no es válido.");
      return;
    }

    try {
      const respuesta = await fetch(
        `${API_SERVICIOS}/${encodeURIComponent(servicioId)}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!respuesta.ok) {
        if (respuesta.status === 404) {
          throw new Error("No se encontró el servicio solicitado.");
        }

        throw new Error(
          `No se pudo cargar el servicio. HTTP ${respuesta.status}`,
        );
      }

      const servicio = await respuesta.json();

      establecerTexto(
        elementos.nombreBanner,
        servicio.nombre,
        "Servicio sin nombre",
      );

      establecerTexto(
        elementos.categoria,
        servicio.categoria?.nombre,
        "Sin categoría",
      );

      establecerTexto(elementos.codigo, servicio.codigo, "Sin código");

      elementos.precio.textContent = formatearPrecio(servicio.precio);

      establecerTexto(
        elementos.descripcion,
        servicio.descripcion,
        "No hay una descripción disponible.",
      );

      establecerTexto(
        elementos.duracion,
        servicio.duracionMinutos,
        "No especificada",
      );

      if (
        servicio.duracionMinutos !== null &&
        servicio.duracionMinutos !== undefined &&
        servicio.duracionMinutos !== ""
      ) {
        elementos.duracion.textContent += " minutos";
      }

      establecerTexto(
        elementos.capacidad,
        servicio.capacidad,
        "No especificada",
      );

      if (
        servicio.capacidad !== null &&
        servicio.capacidad !== undefined &&
        servicio.capacidad !== ""
      ) {
        elementos.capacidad.textContent += " personas";
      }

      configurarEstado(servicio.estado);

      // Configura el enlace para editar este servicio.
      elementos.editar.href = `/admin/servicios/editar/${encodeURIComponent(servicioId)}`;

      // Configura los enlaces que regresan al listado.
      document.querySelectorAll("[data-volver-servicios]").forEach((enlace) => {
        enlace.href = LISTADO_URL;
      });

      // Muestra primero el marcador mientras se obtiene la URL firmada.
      mostrarImagen(null);

      try {
        const urlImagen = await cargarImagenFirmada(servicioId);
        mostrarImagen(urlImagen);
      } catch (errorImagen) {
        console.error("Error al obtener la imagen del servicio:", errorImagen);

        mostrarImagen(null);
      }

      elementos.cargando.hidden = true;
      elementos.error.hidden = true;
      elementos.tarjeta.hidden = false;
    } catch (error) {
      console.error("Error al cargar la vista previa del servicio:", error);

      mostrarError(error.message || "Ocurrió un error al cargar el servicio.");
    }
  }

  cargarServicio();
});
