document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.getElementById("logoutButton");
  const topbarLogoutButton = document.getElementById("topbarLogoutButton");

  function cerrarSesion(event) {
    event.preventDefault();

    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;

    if (!csrfToken) {
      console.error("No se encontró el token CSRF en esta página.");
      return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/logout";

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "_csrf";
    csrfInput.value = csrfToken;

    form.appendChild(csrfInput);
    document.body.appendChild(form);
    form.submit();
  }

  logoutButton?.addEventListener("click", cerrarSesion);
  topbarLogoutButton?.addEventListener("click", cerrarSesion);
});
