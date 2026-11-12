
const sprints = [
    {
        numero: "01",
        nombre: "Descubrimiento y planificación",
        periodo: "Semanas 1–2",
        actividades: [
            { nombre: "Identificar necesidades de la academia", responsable: "Henry", estado: "completado" },
            { nombre: "Realizar encuestas", responsable: "Jean Piere", estado: "completado" },
            { nombre: "Definir requerimientos del sistema", responsable: "Michael", estado: "completado" },
            { nombre: "Organizar Product Backlog", responsable: "Gino", estado: "completado" }
        ]
    },
    {
        numero: "02",
        nombre: "Diseño UX/UI",
        periodo: "Semanas 3–4",
        actividades: [
            { nombre: "Elaborar mapa del sitio web", responsable: "Jean Piere", estado: "completado" },
            { nombre: "Diseñar wireframes", responsable: "Jean Piere", estado: "completado" },
            { nombre: "Diseñar interfaces del sistema", responsable: "Henry", estado: "proceso" },
            { nombre: "Validar propuesta visual", responsable: "Gino", estado: "pendiente" }
        ]
    },
    {
        numero: "03",
        nombre: "Desarrollo e implementación",
        periodo: "Semanas 5–6",
        actividades: [
            { nombre: "Desarrollar vistas con Thymeleaf", responsable: "Jean Piere", estado: "proceso" },
            { nombre: "Implementar lógica con Spring Boot", responsable: "Michael", estado: "proceso" },
            { nombre: "Integrar Supabase y PostgreSQL", responsable: "Michael", estado: "proceso" },
            { nombre: "Desarrollar módulos de productos y servicios", responsable: "Gino", estado: "pendiente" }
        ]
    },
    {
        numero: "04",
        nombre: "Integración y validación",
        periodo: "Semanas 7–8",
        actividades: [
            { nombre: "Realizar pruebas funcionales", responsable: "Gino", estado: "pendiente" },
            { nombre: "Validar formularios y módulos", responsable: "Michael", estado: "pendiente" },
            { nombre: "Corregir errores encontrados", responsable: "Equipo", estado: "pendiente" },
            { nombre: "Preparar documentación final", responsable: "Henry", estado: "pendiente" }
        ]
    }
];

const contenedor = document.getElementById("contenedorSprints");
const navegacion = document.getElementById("sprintsNavegacion");

function obtenerEstado(estado) {
    const estados = {
        completado: {
            texto: "Completado",
            icono: "✓",
            clase: "estado-completado"
        },
        proceso: {
            texto: "En proceso",
            icono: "◷",
            clase: "estado-proceso"
        },
        pendiente: {
            texto: "Pendiente",
            icono: "—",
            clase: "estado-pendiente"
        }
    };

    return estados[estado] || estados.pendiente;
}

// Generar la tabla del sprint seleccionado
function mostrarSprint(numero) {
    const sprint = sprints.find(item => item.numero === numero);

    if (!sprint) return;

    // Actualizar botón seleccionado
    document.querySelectorAll(".sprint-tab").forEach(boton => {
        const seleccionado = boton.dataset.sprint === numero;

        boton.classList.toggle("activo", seleccionado);
        boton.setAttribute("aria-pressed", seleccionado);
    });

    const total = sprint.actividades.length;

    const completadas = sprint.actividades.filter(
        actividad => actividad.estado === "completado"
    ).length;

    const estadoSprint =
        completadas === total
            ? "Completado"
            : completadas > 0
                ? "En desarrollo"
                : "Pendiente";

    const claseSprint =
        completadas === total
            ? "completado"
            : completadas > 0
                ? "proceso"
                : "pendiente";

    contenedor.innerHTML = `
        <article class="sprint-bloque">

            <div class="sprint-titulo">
                <div>
                    <span class="sprint-numero">
                        SPRINT ${sprint.numero}
                    </span>

                    <h3>${sprint.nombre}</h3>
                    <p>${sprint.periodo}</p>
                </div>

                <span class="sprint-estado ${claseSprint}">
                    ${estadoSprint}
                </span>
            </div>

            <div class="tabla-sprint-contenedor">
                <table class="tabla-sprint">
                    <thead>
                        <tr>
                            <th>Actividad</th>
                            <th>Responsable</th>
                            <th>Estado</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${sprint.actividades.map(actividad => {
                            const estado = obtenerEstado(actividad.estado);

                            return `
                                <tr>
                                    <td>${actividad.nombre}</td>
                                    <td>${actividad.responsable}</td>
                                    <td>
                                        <span class="actividad-estado ${estado.clase}">
                                            <span class="estado-icono">${estado.icono}</span>
                                            ${estado.texto}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>

            <div class="sprint-progreso">
                <div class="sprint-progreso-texto">
                    <span>Progreso del sprint</span>
                    <strong>${completadas} de ${total} actividades</strong>
                </div>

                <div class="sprint-barra">
                    <div style="width: ${(completadas / total) * 100}%"></div>
                </div>
            </div>

        </article>
    `;
}

// Escuchar clics en los botones
navegacion.addEventListener("click", event => {
    const boton = event.target.closest(".sprint-tab");

    if (!boton) return;

    mostrarSprint(boton.dataset.sprint);
});

// Mostrar el primer sprint al cargar la página
mostrarSprint("01");
