/**
 * Dashboard administrativo de Sunkku Sinchi.
 * Obtiene las estadísticas desde las API existentes.
 */
document.addEventListener("DOMContentLoaded", () => {
  const API = {
    categorias: "/api/categorias",
    productos: "/api/productos",
    servicios: "/api/servicios",
  };

  const elementos = {
    totalCategorias: document.getElementById("dashboardTotalCategorias"),
    categoriasActivas: document.getElementById("dashboardCategoriasActivas"),
    categoriasInactivas: document.getElementById(
      "dashboardCategoriasInactivas",
    ),
    totalProductos: document.getElementById("dashboardTotalProductos"),
    totalServicios: document.getElementById("dashboardTotalServicios"),
    aviso: document.getElementById("dashboardDataStatus"),
  };

  const mostrarValor = (elemento, valor) => {
    if (elemento) {
      elemento.textContent = String(valor);
    }
  };

  async function obtenerLista(url) {
    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "same-origin",
    });

    if (!respuesta.ok) {
      throw new Error(`La solicitud falló (${respuesta.status})`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
      throw new Error("La API no devolvió una lista válida");
    }

    return datos;
  }

  async function cargarCategorias() {
    try {
      const categorias = await obtenerLista(API.categorias);

      const activas = categorias.filter(
        (categoria) =>
          String(categoria.estado ?? "")
            .trim()
            .toUpperCase() === "ACTIVO",
      ).length;

      const inactivas = categorias.filter(
        (categoria) =>
          String(categoria.estado ?? "")
            .trim()
            .toUpperCase() === "INACTIVO",
      ).length;

      mostrarValor(elementos.totalCategorias, categorias.length);
      mostrarValor(elementos.categoriasActivas, activas);
      mostrarValor(elementos.categoriasInactivas, inactivas);

      return true;
    } catch (error) {
      console.error("No se pudieron cargar las categorías:", error);

      mostrarValor(elementos.totalCategorias, "—");
      mostrarValor(elementos.categoriasActivas, "—");
      mostrarValor(elementos.categoriasInactivas, "—");

      return false;
    }
  }

  async function cargarProductos() {
    try {
      const productos = await obtenerLista(API.productos);

      mostrarValor(elementos.totalProductos, productos.length);

      return true;
    } catch (error) {
      console.error("No se pudieron cargar los productos:", error);

      mostrarValor(elementos.totalProductos, "—");

      return false;
    }
  }

  async function cargarServicios() {
    try {
      const servicios = await obtenerLista(API.servicios);

      mostrarValor(elementos.totalServicios, servicios.length);

      return true;
    } catch (error) {
      console.error("No se pudieron cargar los servicios:", error);

      mostrarValor(elementos.totalServicios, "—");

      return false;
    }
  }

  async function cargarDashboard() {
    if (elementos.aviso) {
      elementos.aviso.textContent = "Cargando estadísticas...";
    }

    const resultados = await Promise.all([
      cargarCategorias(),
      cargarProductos(),
      cargarServicios(),
    ]);

    const todoCorrecto = resultados.every(Boolean);

    if (elementos.aviso) {
      elementos.aviso.textContent = todoCorrecto
        ? "Estadísticas actualizadas con datos de la base de datos."
        : "No se pudieron cargar todas las estadísticas. Comprueba la conexión y los permisos.";
      elementos.aviso.dataset.status = todoCorrecto ? "success" : "error";
    }
  }

  cargarDashboard();
});
