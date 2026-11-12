document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formContacto");
    const inputNombre = document.getElementById("nombre");
    const inputCorreo = document.getElementById("correo");
    const selectAsunto = document.getElementById("asunto");
    const inputMensaje = document.getElementById("mensaje");
    const checkPrivacidad = document.getElementById("privacidad");
    const grupoCalificacion = document.getElementById("grupoCalificacion");
    const gridComunidad = document.getElementById("gridComunidad");
    const STORAGE_KEY = "JEANPIERECONDORI_COMUNIDAD_SUNKKU";

    if (!formulario || !gridComunidad) return;

    // Desactiva los globos por defecto del navegador para que mande nuestra alerta en rojo
    formulario.setAttribute("novalidate", "true");

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,60}$/;

    // Mostrar u ocultar calificación de estrellas solo cuando el asunto sea Opinión
    if (selectAsunto && grupoCalificacion) {
        selectAsunto.addEventListener("change", () => {
            limpiarError(selectAsunto);
            grupoCalificacion.style.display =
                selectAsunto.value === "Opinión sobre el dojo" ? "block" : "none";
        });
    }

    // Limpiar el mensaje de error apenas el usuario empiece a corregir el campo
    inputNombre.addEventListener("input", () => limpiarError(inputNombre));
    inputCorreo.addEventListener("input", () => limpiarError(inputCorreo));
    inputMensaje.addEventListener("input", () => limpiarError(inputMensaje));
    checkPrivacidad.addEventListener("change", () => {
        const msgError = checkPrivacidad.closest(".form-check").querySelector(".texto-error-validacion");
        if (msgError) msgError.remove();
    });

    const resenasBase = [
        {
            nombre: "Mariana P.",
            detalle: "Madre de familia · Google Maps",
            mensaje: "La comunicación es clara y el ambiente invita a aprender con respeto. Nos sentimos acompañados desde el primer día.",
            estrellas: 5
        },
        {
            nombre: "Javier R.",
            detalle: "Alumno del dojo · Google Maps",
            mensaje: "Valoro la disciplina de cada práctica y el compañerismo. Cada clase me ayuda a mantener la constancia.",
            estrellas: 5
        },
        {
            nombre: "Camila V.",
            detalle: "Alumna del dojo · Google Maps",
            mensaje: "Un espacio donde puedo concentrarme, aprender a mi ritmo y compartir el entrenamiento con otros.",
            estrellas: 5
        }
    ];

    let comentariosUsuarios = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    renderizarTarjetas();

    // VALIDACIÓN AL HACER CLIC EN "ENVIAR MENSAJE"
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        const v1 = validarNombre();
        const v2 = validarCorreo();
        const v3 = validarAsunto();
        const v4 = validarMensaje();
        const v5 = validarPrivacidad();

        if (!v1 || !v2 || !v3 || !v4 || !v5) {
            const primerError = formulario.querySelector(".campo-invalido");
            if (primerError) primerError.focus();
            return;
        }

        const nombre = inputNombre.value.trim();
        const asunto = selectAsunto.value;
        const mensaje = inputMensaje.value.trim();

        if (asunto === "Opinión sobre el dojo") {
            const radioSeleccionado = document.querySelector('input[name="calificacion"]:checked');
            const estrellas = radioSeleccionado ? parseInt(radioSeleccionado.value, 10) : 5;

            comentariosUsuarios.unshift({
                nombre: nombre,
                detalle: "Experiencia compartida en la web",
                mensaje: mensaje,
                estrellas: estrellas,
                esNuevo: true
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(comentariosUsuarios));
            renderizarTarjetas();
            resetearFormularioCompleto();
            gridComunidad.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            mostrarConfirmacionConsulta(nombre, asunto);
            resetearFormularioCompleto();
        }
    });

    function validarNombre() {
        const valor = inputNombre.value.trim();
        if (!valor) {
            mostrarError(inputNombre, "El nombre completo es obligatorio.");
            return false;
        }
        if (!regexNombre.test(valor)) {
            mostrarError(inputNombre, "Solo se permiten letras y espacios (mínimo 3 caracteres).");
            return false;
        }
        limpiarError(inputNombre);
        return true;
    }

    function validarCorreo() {
        const valor = inputCorreo.value.trim();

        if (!valor) {
            mostrarError(inputCorreo, "El correo electrónico es obligatorio.");
            return false;
        }
        if (!valor.includes("@")) {
            mostrarError(inputCorreo, "Falta el '@' en el correo electrónico (ej. usuario@gmail.com).");
            return false;
        }
        if (!regexCorreo.test(valor)) {
            mostrarError(inputCorreo, "Completa el dominio después del '@' (ej. usuario@gmail.com).");
            return false;
        }
        limpiarError(inputCorreo);
        return true;
    }

    function validarAsunto() {
        if (!selectAsunto.value) {
            mostrarError(selectAsunto, "Selecciona un motivo de consulta.");
            return false;
        }
        limpiarError(selectAsunto);
        return true;
    }

    function validarMensaje() {
        const valor = inputMensaje.value.trim();
        if (!valor) {
            mostrarError(inputMensaje, "Escribe tu mensaje o consulta.");
            return false;
        }
        if (valor.length < 10) {
            mostrarError(inputMensaje, "El mensaje debe tener al menos 10 caracteres.");
            return false;
        }
        limpiarError(inputMensaje);
        return true;
    }

    function validarPrivacidad() {
        const contenedorCheck = checkPrivacidad.closest(".form-check");
        let msgError = contenedorCheck.querySelector(".texto-error-validacion");

        if (!checkPrivacidad.checked) {
            if (!msgError) {
                msgError = document.createElement("div");
                msgError.className = "texto-error-validacion";
                msgError.style.cssText = "color: #f87171; font-size: 0.82rem; font-weight: 600; margin-top: 0.4rem;";
                contenedorCheck.appendChild(msgError);
            }
            msgError.textContent = "⚠ Debes aceptar el uso de datos para continuar.";
            return false;
        }
        if (msgError) msgError.remove();
        return true;
    }

    function mostrarError(elemento, mensaje) {
        elemento.classList.add("campo-invalido");
        elemento.style.borderColor = "#ef4444";

        const contenedor = elemento.parentElement;
        let msgError = contenedor.querySelector(".texto-error-validacion");
        if (!msgError) {
            msgError = document.createElement("div");
            msgError.className = "texto-error-validacion";
            msgError.style.cssText = "color: #f87171; font-size: 0.82rem; font-weight: 600; margin-top: 0.4rem;";
            contenedor.appendChild(msgError);
        }
        msgError.textContent = `⚠ ${mensaje}`;
    }

    function limpiarError(elemento) {
        elemento.classList.remove("campo-invalido");
        elemento.style.borderColor = "rgba(255, 255, 255, 0.14)";
        const contenedor = elemento.parentElement;
        const msgError = contenedor.querySelector(".texto-error-validacion");
        if (msgError) msgError.remove();
    }

    function resetearFormularioCompleto() {
        formulario.reset();
        [inputNombre, inputCorreo, selectAsunto, inputMensaje].forEach(limpiarError);
        if (grupoCalificacion) grupoCalificacion.style.display = "none";
    }

    function mostrarConfirmacionConsulta(nombre, asunto) {
        let aviso = document.getElementById("alertaConsultaEnviada");
        if (!aviso) {
            aviso = document.createElement("div");
            aviso.id = "alertaConsultaEnviada";
            aviso.style.cssText = "margin-top: 1.25rem; padding: 1rem 1.25rem; border-radius: 8px; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); color: #86efac; font-size: 0.9rem;";
            formulario.appendChild(aviso);
        }

        aviso.innerHTML = `✓ Gracias, <strong>${escaparHTML(nombre)}</strong>. Tu consulta sobre <strong>${escaparHTML(asunto)}</strong> ha sido enviada al dojo. Te responderemos pronto a tu correo.`;

        setTimeout(() => {
            if (aviso) aviso.remove();
        }, 6000);
    }

    function renderizarTarjetas() {
        const todasLasTarjetas = [...comentariosUsuarios, ...resenasBase];

        gridComunidad.innerHTML = todasLasTarjetas.map((item) => {
            const puntaje = item.estrellas || 5;
            const estrellasHTML = "★".repeat(puntaje) + "☆".repeat(5 - puntaje);

            return `
            <article class="panel-oscuro" style="display: flex; flex-direction: column; justify-content: space-between; ${item.esNuevo ? 'border-color: rgba(255, 59, 0, 0.5);' : ''}">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="estrellas">${estrellasHTML}</div>
                        ${item.esNuevo ? '<span style="font-size: 0.7rem; background: rgba(255,59,0,0.15); color: #ff3b00; padding: 2px 8px; border-radius: 99px; font-weight: 600;">Nuevo</span>' : ''}
                    </div>
                    <div style="font-size: 0.78rem; color: #9ca3af; margin-top: 0.25rem; margin-bottom: 1rem;">
                        ${puntaje} de 5 estrellas
                    </div>
                    <p style="color: #e5e7eb; font-size: 0.92rem; line-height: 1.65; font-style: italic;">
                        “${escaparHTML(item.mensaje)}”
                    </p>
                </div>
                <div style="margin-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.85rem;">
                    <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${escaparHTML(item.nombre)}</div>
                    <div style="font-size: 0.8rem; color: #9ca3af;">${escaparHTML(item.detalle)}</div>
                </div>
            </article>
            `;
        }).join("");
    }

    function escaparHTML(texto) {
        const div = document.createElement("div");
        div.textContent = texto;
        return div.innerHTML;
    }
});