document.addEventListener("DOMContentLoaded", () => {
  const paginaCategorias = document.querySelector(".categorias-page");

  if (!paginaCategorias) return;

  const API = paginaCategorias.dataset.api;
  const EDITAR_URL = paginaCategorias.dataset.editarUrl;

  const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;

  const csrfHeader = document.querySelector(
    'meta[name="_csrf_header"]',
  )?.content;

  const tabla = document.getElementById("tablaCategorias");
  const buscador = document.getElementById("buscarCategoria");
  const contador = document.getElementById("contadorCategorias");
  const mensajeError = document.getElementById("mensajeError");

  const textoPaginacion = document.getElementById("textoPaginacion");
  const botonAnterior = document.getElementById("anterior");
  const botonSiguiente = document.getElementById("siguiente");
  const numerosPagina = document.getElementById("numerosPagina");
  const formularioBuscar = document.getElementById("formBuscar");

  if (
    !API ||
    !EDITAR_URL ||
    !tabla ||
    !buscador ||
    !contador ||
    !mensajeError ||
    !textoPaginacion ||
    !botonAnterior ||
    !botonSiguiente ||
    !numerosPagina ||
    !formularioBuscar
  ) {
    console.error(
      "No se encontraron todos los elementos necesarios de categorías.",
    );
    return;
  }

  let categorias = [];
  let filtradas = [];
  let pagina = 1;

  const POR_PAGINA = 6;

  /* ==========================================
       UTILIDADES
       ========================================== */

  function obtenerId(categoria) {
    return categoria.idCategoria ?? categoria.id;
  }

  function obtenerEstado(categoria) {
    const valor = categoria.estado;

    if (valor === true || valor === 1) return "ACTIVO";
    if (valor === false || valor === 0) return "INACTIVO";

    if (valor && typeof valor === "object") {
      return String(valor.nombre ?? valor.estado ?? "").toUpperCase();
    }

    return String(valor ?? "").toUpperCase();
  }

  function escapar(texto) {
    return String(texto ?? "").replace(
      /[&<>"']/g,
      (caracter) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[caracter],
    );
  }

  /* ==========================================
       CARGAR CATEGORÍAS
       ========================================== */

  async function cargarCategorias() {
    mensajeError.textContent = "";
    contador.textContent = "Cargando categorías...";

    try {
      const respuesta = await fetch(API, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      if (!respuesta.ok) {
        throw new Error("No se pudieron consultar las categorías.");
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista válida.");
      }

      categorias = datos;
      filtrarCategorias();
    } catch (error) {
      categorias = [];
      filtradas = [];
      pagina = 1;

      tabla.innerHTML = `
                <tr>
                    <td colspan="3" class="sin-resultados">
                        No se pudieron cargar las categorías.
                    </td>
                </tr>
            `;

      contador.textContent = "Error al cargar";
      mensajeError.textContent =
        error.message || "Ocurrió un error inesperado.";

      actualizarPaginacion();
    }
  }

  /* ==========================================
       BUSCAR Y FILTRAR
       ========================================== */

  function filtrarCategorias() {
    const texto = buscador.value.trim().toLowerCase();

    filtradas = categorias.filter((categoria) =>
      String(categoria.nombre ?? "")
        .toLowerCase()
        .includes(texto),
    );

    pagina = 1;
    mostrarCategorias();
  }

  /* ==========================================
       MOSTRAR CATEGORÍAS
       ========================================== */

  function mostrarCategorias() {
    const inicio = (pagina - 1) * POR_PAGINA;

    const elementos = filtradas.slice(inicio, inicio + POR_PAGINA);

    contador.textContent = `${filtradas.length} categorías en el catálogo`;

    if (elementos.length === 0) {
      tabla.innerHTML = `
                <tr>
                    <td colspan="3" class="sin-resultados">
                        No se encontraron categorías.
                    </td>
                </tr>
            `;
    } else {
      tabla.innerHTML = elementos
        .map((categoria) => {
          const id = obtenerId(categoria);
          const activo = obtenerEstado(categoria) === "ACTIVO";

          const urlEditar = `${EDITAR_URL}${encodeURIComponent(id ?? "")}`;

          return `
                    <tr>
                        <td>
                            <span class="nombre-categoria">
                                ${escapar(categoria.nombre)}
                            </span>

                            <span class="descripcion-categoria">
                                ${escapar(categoria.descripcion)}
                            </span>
                        </td>

                        <td>
                            <span class="estado ${activo ? "activo" : "inactivo"}">
                                ${activo ? "Activo" : "Inactivo"}
                            </span>
                        </td>

                        <td>
                            <div class="acciones">
                                <a class="btn-editar"
                                   href="${escapar(urlEditar)}">
                                    Editar
                                </a>

                                <button class="btn-eliminar"
                                        type="button"
                                        data-id="${escapar(id)}">
                                    Eliminar
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
        })
        .join("");
    }

    actualizarPaginacion();
  }

  /* ==========================================
       ACTUALIZAR PAGINACIÓN
       ========================================== */

  function actualizarPaginacion() {
    const total = filtradas.length;

    const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

    const inicio = (pagina - 1) * POR_PAGINA;

    textoPaginacion.textContent =
      `Mostrando ${total ? inicio + 1 : 0}–` +
      `${Math.min(inicio + POR_PAGINA, total)} de ${total}`;

    botonAnterior.disabled = pagina <= 1;
    botonSiguiente.disabled = pagina >= paginas;

    numerosPagina.replaceChildren();

    for (let i = 1; i <= paginas; i++) {
      const boton = document.createElement("button");

      boton.type = "button";
      boton.textContent = i;
      boton.setAttribute("aria-label", `Ir a la página ${i}`);

      if (i === pagina) {
        boton.className = "actual";
        boton.setAttribute("aria-current", "page");
      }

      boton.addEventListener("click", () => {
        pagina = i;
        mostrarCategorias();
      });

      numerosPagina.appendChild(boton);
    }
  }

  /* ==========================================
       EVENTOS DE BÚSQUEDA
       ========================================== */

  formularioBuscar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    filtrarCategorias();
  });

  buscador.addEventListener("input", filtrarCategorias);

  /* ==========================================
       EVENTOS DE PAGINACIÓN
       ========================================== */

  botonAnterior.addEventListener("click", () => {
    if (pagina > 1) {
      pagina--;
      mostrarCategorias();
    }
  });

  botonSiguiente.addEventListener("click", () => {
    const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));

    if (pagina < paginas) {
      pagina++;
      mostrarCategorias();
    }
  });

  /* ==========================================
       ELIMINAR CATEGORÍA
       ========================================== */

  tabla.addEventListener("click", async (evento) => {
    const boton = evento.target.closest(".btn-eliminar");

    if (!boton || boton.disabled) return;

    const id = boton.dataset.id;

    const categoria = categorias.find((item) => String(obtenerId(item)) === id);

    if (!categoria) return;

    const confirmar = window.confirm(
      `¿Eliminar la categoría "${categoria.nombre}"?`,
    );

    if (!confirmar) return;

    boton.disabled = true;
    mensajeError.textContent = "";

    try {
      const headers = {
        Accept: "application/json",
      };

      if (csrfToken && csrfHeader) {
        headers[csrfHeader] = csrfToken;
      }

      const respuesta = await fetch(`${API}/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers,
      });

      if (!respuesta.ok) {
        throw new Error(
          respuesta.status === 403
            ? "No tienes permiso para eliminar la categoría o el token de seguridad ha caducado."
            : "No se pudo eliminar la categoría.",
        );
      }

      await cargarCategorias();
    } catch (error) {
      mensajeError.textContent =
        error.message || "Ocurrió un error al eliminar.";

      boton.disabled = false;
    }
  });

  /* ==========================================
       INICIALIZACIÓN
       ========================================== */

  cargarCategorias();
});
