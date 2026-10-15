document.addEventListener("DOMContentLoaded", function () {
  const profileMenuContainer = document.getElementById("profileMenuContainer");
  const profileMenuButton = document.getElementById("profileMenuButton");
  const profileMenu = document.getElementById("profileMenu");

  // Si esta página no tiene menú de perfil, no hacemos nada.
  if (!profileMenuContainer || !profileMenuButton || !profileMenu) {
    return;
  }

  function cerrarMenu() {
    profileMenu.hidden = true;
    profileMenuButton.setAttribute("aria-expanded", "false");
  }

  profileMenuButton.addEventListener("click", function (event) {
    event.stopPropagation();

    const estaAbierto = !profileMenu.hidden;
    profileMenu.hidden = estaAbierto;
    profileMenuButton.setAttribute("aria-expanded", String(!estaAbierto));
  });

  profileMenu.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  document.addEventListener("click", function (event) {
    if (!profileMenuContainer.contains(event.target)) {
      cerrarMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      cerrarMenu();
    }
  });
});
