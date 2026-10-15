document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".vista-nueva");

  if (!contenedor) return;

  const API_PRODUCTOS = contenedor.dataset.apiProductos;
  const LISTADO_URL = contenedor.dataset.listadoUrl;

  const elementos = {
    cargando: document.getElementById("vistaProductoCargando"),
    error: document.getElementById("vistaProductoError"),
    tarjeta: document.getElementById("vistaProductoCard"),
    imagen: document.getElementById("vistaProductoImagen"),
    placeholder: document.getElementById("vistaProductoPlaceholder"),
    estado: document.getElementById("vistaProductoEstado"),
    categoria: document.getElementById("vistaProductoCategoria"),
    nombre: document.getElementById("vistaProductoNombre"),
    codigo: document.getElementById("vistaProductoCodigo"),
    precio: document.getElementById("vistaProductoPrecio"),
    descripcion: document.getElementById("vistaProductoDescripcion"),
    disponibilidad: document.getElementById("vistaProductoDisponibilidad"),
  };

  const parametros = new URLSearchParams(window.location.search);
  const productoId = parametros.get("productoId");

  function mostrarError(mensaje) {
    elementos.cargando.hidden = true;
    elementos.tarjeta.hidden = true;
    elementos.error.hidden = false;
    elementos.error.textContent = mensaje;
  }

  function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(Number(precio ?? 0));
  }

  function mostrarImagen(url) {
    if (!url) {
      elementos.imagen.hidden = true;
      elementos.placeholder.hidden = false;
      return;
    }

    elementos.imagen.onload = () => {
      elementos.imagen.hidden = false;
      elementos.placeholder.hidden = true;
    };

    elementos.imagen.onerror = () => {
      elementos.imagen.hidden = true;
      elementos.placeholder.hidden = false;
      console.error("No se pudo cargar la imagen del producto.");
    };

    elementos.imagen.src = url;
    elementos.imagen.alt =
      elementos.nombre.textContent || "Imagen del producto";
  }

  async function cargarImagenFirmada(id) {
    const respuesta = await fetch(
      `${API_PRODUCTOS}/${encodeURIComponent(id)}/imagen-url`,
    );

    if (!respuesta.ok) {
      // Si no hay imagen registrada, se mantiene el marcador visual.
      if (respuesta.status === 404) return null;

      throw new Error(`No se pudo obtener la imagen. HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    return datos.urlImagen || null;
  }

  async function cargarProducto() {
    if (!productoId || !/^\d+$/.test(productoId)) {
      mostrarError("El identificador del producto no es válido.");
      return;
    }

    try {
      const respuesta = await fetch(
        `${API_PRODUCTOS}/${encodeURIComponent(productoId)}`,
      );

      if (!respuesta.ok) {
        if (respuesta.status === 404) {
          throw new Error("No se encontró el producto solicitado.");
        }

        throw new Error(
          `No se pudo cargar el producto. HTTP ${respuesta.status}`,
        );
      }

      const producto = await respuesta.json();

      elementos.nombre.textContent = producto.nombre || "Producto sin nombre";
      elementos.codigo.textContent = producto.codigo || "Sin código";
      elementos.categoria.textContent =
        producto.categoria?.nombre || "Sin categoría";
      elementos.precio.textContent = formatearPrecio(producto.precioVenta);
      elementos.descripcion.textContent =
        producto.descripcion || "No hay una descripción disponible.";

      const estado = String(producto.estado || "").toUpperCase();

      elementos.estado.textContent = estado || "SIN ESTADO";
      elementos.estado.classList.toggle("activo", estado === "ACTIVO");
      elementos.estado.classList.toggle("inactivo", estado !== "ACTIVO");

      if (estado !== "ACTIVO") {
        elementos.disponibilidad.textContent =
          "Este producto está actualmente inactivo.";
      } else if (Number(producto.stockActual ?? 0) > 0) {
        elementos.disponibilidad.textContent = `Disponible · ${producto.stockActual} unidad(es)`;
      } else {
        elementos.disponibilidad.textContent =
          "Actualmente sin unidades disponibles.";
      }

      // La ruta almacenada no es necesariamente una URL visible.
      // Se solicita a Spring Boot la URL firmada de Supabase.
      mostrarImagen(null);

      try {
        const urlImagen = await cargarImagenFirmada(productoId);
        mostrarImagen(urlImagen);
      } catch (errorImagen) {
        console.error("Error al obtener la imagen:", errorImagen);
        mostrarImagen(null);
      }

      elementos.cargando.hidden = true;
      elementos.error.hidden = true;
      elementos.tarjeta.hidden = false;
    } catch (error) {
      console.error("Error al cargar la vista previa:", error);
      mostrarError(error.message || "Ocurrió un error al cargar el producto.");
    }
  }

  // Configura los enlaces para regresar al listado.
  document.querySelectorAll("[data-volver-productos]").forEach((enlace) => {
    enlace.href = LISTADO_URL || "/admin/productos";
  });

  cargarProducto();
});
