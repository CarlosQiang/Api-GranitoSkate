// Import necessary functions and variables
import { checkSession, saveSession, logout } from "./auth.js"
import { showNotification } from "./utils.js"
import { api } from "./api.js"
import { formatDate, truncateText } from "./helpers.js"
import * as bootstrap from "bootstrap" // Import Bootstrap

// Funcionalidad principal del panel de administración
document.addEventListener("DOMContentLoaded", () => {
  // Verificar sesión
  if (!checkSession()) {
    return
  }

  // Inicializar componentes
  initNavigation()
  initDashboard()
  initLoginForm()
  initLogout()

  // Cargar sección inicial (dashboard)
  loadSection("dashboard")
})

// Inicializar navegación
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link[data-section]")

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Obtener sección a cargar
      const section = this.getAttribute("data-section")

      // Cargar sección
      loadSection(section)
    })
  })
}

// Cargar sección
function loadSection(sectionId) {
  // Actualizar navegación
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active")
  })

  const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`)
  if (activeLink) {
    activeLink.classList.add("active")
  }

  // Actualizar título
  document.getElementById("section-title").textContent = activeLink ? activeLink.textContent.trim() : "Dashboard"

  // Mostrar sección
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active")
  })

  const activeSection = document.getElementById(`${sectionId}-section`)
  if (activeSection) {
    activeSection.classList.add("active")
  }

  // Cargar datos de la sección
  switch (sectionId) {
    case "dashboard":
      loadDashboardData()
      break
    // Otras secciones se implementarán según sea necesario
  }
}

// Inicializar dashboard
function initDashboard() {
  // Botón de actualizar
  document.getElementById("refresh-btn").addEventListener("click", () => {
    const currentSection = document.querySelector(".content-section.active").id.replace("-section", "")
    loadSection(currentSection)
    showNotification("Datos actualizados correctamente")
  })
}

// Cargar datos del dashboard
async function loadDashboardData() {
  try {
    // Obtener estadísticas
    const response = await api.getStats()

    if (response.success) {
      const stats = response.data

      // Actualizar contadores
      document.getElementById("usuarios-count").textContent = stats.usuarios
      document.getElementById("mensajes-count").textContent = stats.mensajes.total
      document.getElementById("mensajes-pendientes").textContent = `${stats.mensajes.pendientes} pendientes`
      document.getElementById("builds-count").textContent = stats.builds
      document.getElementById("resenas-count").textContent = stats.resenas

      // Cargar mensajes recientes
      loadMensajesRecientes()

      // Cargar eventos recientes
      loadEventosRecientes()
    } else {
      showNotification("Error al cargar datos del dashboard", "danger")
    }
  } catch (error) {
    console.error("Error al cargar datos del dashboard:", error)
    showNotification("Error al cargar datos del dashboard", "danger")
  }
}

// Cargar mensajes recientes
async function loadMensajesRecientes() {
  try {
    const response = await api.getMensajes("pendiente")

    if (response.success) {
      const mensajes = response.data
      const container = document.getElementById("mensajes-recientes-container")

      if (!mensajes || mensajes.length === 0) {
        container.innerHTML = '<p class="text-center">No hay mensajes pendientes</p>'
        return
      }

      // Mostrar solo los 3 más recientes
      const mensajesRecientes = mensajes.slice(0, 3)

      let html = ""
      mensajesRecientes.forEach((mensaje) => {
        html += `
          <div class="message-card pendiente mb-2">
            <h6>${mensaje.asunto}</h6>
            <p class="small text-muted">De: ${mensaje.nombre || "Usuario"} - ${formatDate(mensaje.fecha_envio)}</p>
            <p>${truncateText(mensaje.mensaje, 100)}</p>
            <a href="#" class="btn btn-sm btn-primary responder-btn" data-id="${mensaje.id}" data-section="mensajes">
              Responder
            </a>
          </div>
        `
      })

      container.innerHTML = html

      // Añadir event listeners
      document.querySelectorAll(".responder-btn").forEach((btn) => {
        btn.addEventListener("click", function (e) {
          e.preventDefault()
          const section = this.getAttribute("data-section")
          loadSection(section)
        })
      })
    } else {
      document.getElementById("mensajes-recientes-container").innerHTML =
        '<p class="text-center text-danger">Error al cargar mensajes</p>'
    }
  } catch (error) {
    console.error("Error al cargar mensajes recientes:", error)
    document.getElementById("mensajes-recientes-container").innerHTML =
      '<p class="text-center text-danger">Error al cargar mensajes</p>'
  }
}

// Cargar eventos recientes
async function loadEventosRecientes() {
  try {
    const response = await api.getEventos()

    if (response.success) {
      const eventos = response.data
      const container = document.getElementById("eventos-recientes-container")

      if (!eventos || eventos.length === 0) {
        container.innerHTML = '<p class="text-center">No hay eventos próximos</p>'
        return
      }

      // Mostrar solo los 3 más próximos
      const eventosRecientes = eventos.slice(0, 3)

      let html = ""
      eventosRecientes.forEach((evento) => {
        html += `
          <div class="event-card mb-2">
            <h6>${evento.titulo}</h6>
            <p class="event-dates small">
              ${formatDate(evento.fecha_inicio)} - ${formatDate(evento.fecha_fin)}
            </p>
            <p>${truncateText(evento.descripcion, 100)}</p>
          </div>
        `
      })

      container.innerHTML = html
    } else {
      document.getElementById("eventos-recientes-container").innerHTML =
        '<p class="text-center text-danger">Error al cargar eventos</p>'
    }
  } catch (error) {
    console.error("Error al cargar eventos recientes:", error)
    document.getElementById("eventos-recientes-container").innerHTML =
      '<p class="text-center text-danger">Error al cargar eventos</p>'
  }
}

// Inicializar formulario de login
function initLoginForm() {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("admin-email").value
    const password = document.getElementById("admin-password").value
    const remember = document.getElementById("remember-me").checked

    try {
      // Realizar login
      const response = await api.login(email, password)

      if (response.success) {
        // Guardar token y datos de usuario
        saveSession(response.data.user.name, response.data.token, remember)

        // Actualizar API
        api.token = response.data.token
        api.adminName = response.data.user.name

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"))
        modal.hide()

        showNotification("Inicio de sesión exitoso")

        // Cargar dashboard
        loadSection("dashboard")
      } else {
        document.getElementById("login-error").classList.remove("d-none")
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      document.getElementById("login-error").classList.remove("d-none")
    }
  })
}

// Inicializar logout
function initLogout() {
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault()

    logout()
    showNotification("Sesión cerrada correctamente")
  })
}
