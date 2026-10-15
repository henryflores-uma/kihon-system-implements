document.addEventListener("DOMContentLoaded", function () {
  /*
   * =========================================================
   * ELEMENTOS PRINCIPALES
   * =========================================================
   */

  const sidebar = document.querySelector(".sidebar");

  const menuButton = document.getElementById("mobileMenuButton");

  const menuIcon = document.getElementById("mobileMenuIcon");

  const overlay = document.getElementById("mobileMenuOverlay");

  const mobileNav = document.querySelector(".mobile-nav");

  const accordionButtons = document.querySelectorAll(
    ".sidebar__accordion-button",
  );

  const sidebarLinks = document.querySelectorAll(".sidebar__link");

  /*
   * =========================================================
   * VALIDACIÓN
   * =========================================================
   */

  if (!sidebar) {
    return;
  }

  /*
   * =========================================================
   * ACORDEÓN
   * =========================================================
   */

  accordionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const targetId = button.getAttribute("data-target");

      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      const isOpen = target.classList.contains("sidebar__submenu--open");

      /*
       * ---------------------------------------------
       * CERRAR LOS DEMÁS SUBMENÚS
       * ---------------------------------------------
       */

      document
        .querySelectorAll(".sidebar__submenu--open")
        .forEach(function (submenu) {
          if (submenu !== target) {
            submenu.classList.remove("sidebar__submenu--open");

            submenu.setAttribute("hidden", "");
          }
        });

      /*
       * ---------------------------------------------
       * RESTABLECER BOTONES
       * ---------------------------------------------
       */

      accordionButtons.forEach(function (otherButton) {
        if (otherButton !== button) {
          otherButton.classList.remove("sidebar__accordion-button--open");

          otherButton.setAttribute("aria-expanded", "false");

          const otherArrow = otherButton.querySelector(
            ".sidebar__accordion-arrow",
          );

          if (otherArrow) {
            otherArrow.textContent = "▶";
          }
        }
      });

      /*
       * ---------------------------------------------
       * ABRIR / CERRAR SELECCIONADO
       * ---------------------------------------------
       */

      if (isOpen) {
        target.classList.remove("sidebar__submenu--open");

        target.setAttribute("hidden", "");

        button.classList.remove("sidebar__accordion-button--open");

        button.setAttribute("aria-expanded", "false");

        const arrow = button.querySelector(".sidebar__accordion-arrow");

        if (arrow) {
          arrow.textContent = "▶";
        }
      } else {
        target.classList.add("sidebar__submenu--open");

        target.removeAttribute("hidden");

        button.classList.add("sidebar__accordion-button--open");

        button.setAttribute("aria-expanded", "true");

        const arrow = button.querySelector(".sidebar__accordion-arrow");

        if (arrow) {
          arrow.textContent = "▼";
        }
      }
    });
  });

  /*
   * =========================================================
   * PÁGINA ACTIVA
   * =========================================================
   */

  function marcarPaginaActiva() {
    const currentPath = window.location.pathname;

    let activeLink = null;

    /*
     * ---------------------------------------------
     * BUSCAR COINCIDENCIA EXACTA
     * ---------------------------------------------
     */

    sidebarLinks.forEach(function (link) {
      const href = link.getAttribute("href");

      if (!href) {
        return;
      }

      let linkPath;

      try {
        linkPath = new URL(href, window.location.origin).pathname;
      } catch (error) {
        return;
      }

      if (linkPath === currentPath) {
        activeLink = link;
      }
    });

    /*
     * ---------------------------------------------
     * BUSCAR COINCIDENCIA POR PREFIJO
     * ---------------------------------------------
     */

    if (!activeLink) {
      sidebarLinks.forEach(function (link) {
        const href = link.getAttribute("href");

        if (!href) {
          return;
        }

        let linkPath;

        try {
          linkPath = new URL(href, window.location.origin).pathname;
        } catch (error) {
          return;
        }

        if (linkPath !== "/admin/admin" && currentPath.startsWith(linkPath)) {
          activeLink = link;
        }
      });
    }

    /*
     * ---------------------------------------------
     * LIMPIAR ESTADOS ACTIVOS
     * ---------------------------------------------
     */

    sidebarLinks.forEach(function (link) {
      link.classList.remove("sidebar__link--active");
    });

    accordionButtons.forEach(function (button) {
      button.classList.remove("sidebar__accordion-button--active");
    });

    /*
     * ---------------------------------------------
     * MARCAR ENLACE ACTIVO
     * ---------------------------------------------
     */

    if (!activeLink) {
      return;
    }

    activeLink.classList.add("sidebar__link--active");

    /*
     * ---------------------------------------------
     * ABRIR ACORDEÓN PADRE
     * ---------------------------------------------
     */

    const parentSubmenu = activeLink.closest(".sidebar__submenu");

    if (!parentSubmenu) {
      return;
    }

    parentSubmenu.classList.add("sidebar__submenu--open");

    parentSubmenu.removeAttribute("hidden");

    const parentButton = document.querySelector(
      `[data-target="${parentSubmenu.id}"]`,
    );

    if (!parentButton) {
      return;
    }

    parentButton.classList.add("sidebar__accordion-button--open");

    parentButton.classList.add("sidebar__accordion-button--active");

    parentButton.setAttribute("aria-expanded", "true");

    const arrow = parentButton.querySelector(".sidebar__accordion-arrow");

    if (arrow) {
      arrow.textContent = "▼";
    }
  }

  marcarPaginaActiva();

  /*
   * =========================================================
   * MENÚ MÓVIL
   * =========================================================
   */

  function abrirMenuMovil() {
    sidebar.classList.add("sidebar--open");

    /*
     * ---------------------------------------------
     * BOTÓN
     * ---------------------------------------------
     */

    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "true");

      menuButton.setAttribute("aria-label", "Cerrar menú");
    }

    /*
     * ---------------------------------------------
     * ICONO
     * ---------------------------------------------
     */

    if (menuIcon) {
      menuIcon.textContent = "✕";
    }

    /*
     * ---------------------------------------------
     * OCULTAR KIHON SUPERIOR
     * ---------------------------------------------
     */

    if (mobileNav) {
      mobileNav.classList.add("mobile-nav--hidden");
    }

    /*
     * ---------------------------------------------
     * OVERLAY
     * ---------------------------------------------
     */

    if (overlay) {
      overlay.hidden = false;

      requestAnimationFrame(function () {
        overlay.classList.add("mobile-menu-overlay--visible");
      });
    }

    /*
     * ---------------------------------------------
     * BLOQUEAR SCROLL
     * ---------------------------------------------
     */

    document.body.classList.add("mobile-menu-open");
  }

  function cerrarMenuMovil() {
    sidebar.classList.remove("sidebar--open");

    /*
     * ---------------------------------------------
     * BOTÓN
     * ---------------------------------------------
     */

    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");

      menuButton.setAttribute("aria-label", "Abrir menú");
    }

    /*
     * ---------------------------------------------
     * ICONO
     * ---------------------------------------------
     */

    if (menuIcon) {
      menuIcon.textContent = "☰";
    }

    /*
     * ---------------------------------------------
     * MOSTRAR KIHON SUPERIOR
     * ---------------------------------------------
     */

    if (mobileNav) {
      mobileNav.classList.remove("mobile-nav--hidden");
    }

    /*
     * ---------------------------------------------
     * OVERLAY
     * ---------------------------------------------
     */

    if (overlay) {
      overlay.classList.remove("mobile-menu-overlay--visible");

      overlay.hidden = true;
    }

    /*
     * ---------------------------------------------
     * DESBLOQUEAR SCROLL
     * ---------------------------------------------
     */

    document.body.classList.remove("mobile-menu-open");
  }

  /*
   * =========================================================
   * BOTÓN HAMBURGUESA
   * =========================================================
   */

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      const menuAbierto = sidebar.classList.contains("sidebar--open");

      if (menuAbierto) {
        cerrarMenuMovil();
      } else {
        abrirMenuMovil();
      }
    });
  }

  /*
   * =========================================================
   * OVERLAY
   * =========================================================
   */

  if (overlay) {
    overlay.addEventListener("click", cerrarMenuMovil);
  }

  /*
   * =========================================================
   * CERRAR AL SELECCIONAR UNA PÁGINA
   * =========================================================
   */

  sidebarLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      cerrarMenuMovil();
    });
  });

  /*
   * =========================================================
   * ESCAPE
   * =========================================================
   */

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      cerrarMenuMovil();
    }
  });

  /*
   * =========================================================
   * CAMBIO DE TAMAÑO
   * =========================================================
   */

  window.addEventListener("resize", function () {
    if (window.innerWidth > 700) {
      cerrarMenuMovil();
    }
  });
});
