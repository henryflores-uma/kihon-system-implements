document.addEventListener("DOMContentLoaded", () => {
  const chart = document.getElementById("dashboardCategoryChart");
  const status = document.getElementById("dashboardCategoryChartStatus");

  if (!chart) return;

  const API_URL = "/api/dashboard/catalogo-por-categoria";

  function crearElemento(tag, className, text = "") {
    const elemento = document.createElement(tag);
    elemento.className = className;
    elemento.textContent = text;
    return elemento;
  }

  function crearBarra(tipo, cantidad, maximo) {
    const fila = crearElemento(
      "div",
      `dashboard-category-chart__bar-row dashboard-category-chart__bar-row--${tipo}`,
    );

    const valor = crearElemento(
      "span",
      "dashboard-category-chart__value",
      String(cantidad),
    );

    const pista = crearElemento("div", "dashboard-category-chart__track");

    const barra = crearElemento(
      "div",
      `dashboard-category-chart__bar dashboard-category-chart__bar--${tipo}`,
    );

    const porcentaje = maximo > 0 ? (cantidad / maximo) * 100 : 0;

    barra.style.width = `${porcentaje}%`;

    pista.appendChild(barra);
    fila.append(valor, pista);

    return fila;
  }

  function renderizarGrafico(categorias) {
    chart.replaceChildren();

    if (!categorias.length) {
      chart.appendChild(
        crearElemento(
          "p",
          "dashboard-category-chart__message",
          "Todavía no hay categorías registradas.",
        ),
      );
      return;
    }

    const maximo = Math.max(
      1,
      ...categorias.flatMap((categoria) => [
        Number(categoria.productos) || 0,
        Number(categoria.servicios) || 0,
      ]),
    );

    categorias.forEach((categoria) => {
      const productos = Number(categoria.productos) || 0;
      const servicios = Number(categoria.servicios) || 0;

      const grupo = crearElemento("article", "dashboard-category-chart__item");

      const encabezado = crearElemento(
        "div",
        "dashboard-category-chart__item-header",
      );

      const nombre = crearElemento(
        "h3",
        "dashboard-category-chart__name",
        categoria.categoria,
      );

      const total = crearElemento(
        "span",
        "dashboard-category-chart__total",
        `Total: ${productos + servicios}`,
      );

      encabezado.append(nombre, total);

      const barras = crearElemento("div", "dashboard-category-chart__bars");

      barras.append(
        crearBarra("products", productos, maximo),
        crearBarra("services", servicios, maximo),
      );

      grupo.append(encabezado, barras);
      chart.appendChild(grupo);
    });
  }

  async function cargarGrafico() {
    if (status) {
      status.textContent = "Consultando datos de la base de datos...";
    }

    try {
      const respuesta = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "same-origin",
      });

      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista válida.");
      }

      renderizarGrafico(datos);

      if (status) {
        const totalCategorias = datos.length;

        status.textContent =
          totalCategorias === 0
            ? "No hay categorías registradas."
            : `Datos reales cargados: ${totalCategorias} categorías.`;

        status.dataset.status = "success";
      }
    } catch (error) {
      console.error("No se pudo cargar el gráfico por categoría:", error);

      chart.replaceChildren(
        crearElemento(
          "p",
          "dashboard-category-chart__message",
          "No se pudieron cargar los datos. Comprueba la conexión e inténtalo de nuevo.",
        ),
      );

      if (status) {
        status.textContent = "Error al consultar las estadísticas.";
        status.dataset.status = "error";
      }
    }
  }

  cargarGrafico();
});
