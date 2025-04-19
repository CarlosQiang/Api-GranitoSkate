// Import necessary functions and variables
import { checkSession, saveSession, logout, clearCache } from "./auth.js"
import { showNotification, showConfirmModal } from "./notifications.js"
import { getCachedData } from "./cache.js"
import { api } from "./api.js"
import { formatDate, truncateText, formatRating } from "./utils.js"
import { CONFIG } from "./config.js"
import * as bootstrap from "bootstrap"

// Funcionalidad principal del panel de administración
document.addEventListener("DOMContentLoaded", () => {
  // Verificar sesión
  if (!checkSession()) {
    return
  }

  // Inicializar componentes
  initNavigation()
  initDashboard()
  initConfigForm()
  initAdminActions()
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
    case "usuarios":
      loadUsuarios()
      break
    case "favoritos":
      loadFavoritos()
      break
    case "builds":
      loadBuilds()
      break
    case "mensajes":
      loadMensajes()
      break
    case "encuestas":
      loadEncuestas()
      break
    case "eventos":
      loadEventos()
      break
    case "resenas":
      loadResenas()
      break
    case "visitas":
      initVisitasFilter()
      break
    case "configuracion":
      loadConfiguracion()
      break
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
    const stats = await getCachedData("stats_cache", () => api.getStats())

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
  } catch (error) {
    console.error("Error al cargar datos del dashboard:", error)
    showNotification("Error al cargar datos del dashboard", "danger")
  }
}

// Cargar mensajes recientes
async function loadMensajesRecientes() {
  try {
    const mensajes = await getCachedData("mensajes_cache", () => api.getMensajes("pendiente"))
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
  } catch (error) {
    console.error("Error al cargar mensajes recientes:", error)
    document.getElementById("mensajes-recientes-container").innerHTML =
      '<p class="text-center text-danger">Error al cargar mensajes</p>'
  }
}

// Cargar eventos recientes
async function loadEventosRecientes() {
  try {
    const eventos = await getCachedData("eventos_cache", () => api.getEventos())
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
  } catch (error) {
    console.error("Error al cargar eventos recientes:", error)
    document.getElementById("eventos-recientes-container").innerHTML =
      '<p class="text-center text-danger">Error al cargar eventos</p>'
  }
}

// Cargar usuarios
async function loadUsuarios() {
  try {
    const usuarios = await getCachedData("usuarios_cache", () => api.getUsuarios())
    const tableBody = document.getElementById("usuarios-table-body")

    if (!usuarios || usuarios.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios registrados</td></tr>'
      return
    }

    let html = ""
    usuarios.forEach((usuario) => {
      html += `
        <tr>
          <td>${usuario.id}</td>
          <td>${usuario.shopify_customer_id}</td>
          <td>${usuario.email}</td>
          <td>${usuario.nombre || "-"}</td>
          <td>${formatDate(usuario.fecha_registro)}</td>
          <td>
            <button class="btn btn-sm btn-info ver-usuario-btn" data-id="${usuario.id}">
              <i class="bi bi-eye"></i>
            </button>
          </td>
        </tr>
      `
    })

    tableBody.innerHTML = html

    // Añadir event listeners
    document.querySelectorAll(".ver-usuario-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        // Implementar vista detallada de usuario
        showNotification("Funcionalidad en desarrollo")
      })
    })
  } catch (error) {
    console.error("Error al cargar usuarios:", error)
    document.getElementById("usuarios-table-body").innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Error al cargar usuarios</td></tr>'
  }
}

// Cargar favoritos
async function loadFavoritos() {
  try {
    const favoritos = await getCachedData("favoritos_cache", () => api.getFavoritos())
    const tableBody = document.getElementById("favoritos-table-body")

    if (!favoritos || favoritos.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay favoritos registrados</td></tr>'
      return
    }

    let html = ""
    favoritos.forEach((favorito) => {
      html += `
        <tr>
          <td>${favorito.id}</td>
          <td>${favorito.usuario_nombre || favorito.usuario_id}</td>
          <td>${favorito.id_producto}</td>
          <td>${favorito.nombre_producto}</td>
          <td>${formatDate(favorito.fecha_agregado)}</td>
          <td>
            <button class="btn btn-sm btn-danger eliminar-favorito-btn" data-id="${favorito.id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `
    })

    tableBody.innerHTML = html

    // Añadir event listeners
    document.querySelectorAll(".eliminar-favorito-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        eliminarFavorito(id)
      })
    })
  } catch (error) {
    console.error("Error al cargar favoritos:", error)
    document.getElementById("favoritos-table-body").innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Error al cargar favoritos</td></tr>'
  }
}

// Eliminar favorito
function eliminarFavorito(id) {
  showConfirmModal(CONFIG.messages.confirmDelete, async () => {
    try {
      const response = await api.deleteFavorito(id)

      if (response.success) {
        showNotification("Favorito eliminado correctamente")

        // Actualizar lista
        localStorage.removeItem("favoritos_cache")
        loadFavoritos()
      } else {
        showNotification("Error al eliminar favorito", "danger")
      }
    } catch (error) {
      console.error("Error al eliminar favorito:", error)
      showNotification("Error al eliminar favorito", "danger")
    }
  })
}

// Cargar builds
async function loadBuilds() {
  try {
    const builds = await getCachedData("builds_cache", () => api.getBuilds())
    const tableBody = document.getElementById("builds-table-body")

    if (!builds || builds.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay builds registrados</td></tr>'
      return
    }

    let html = ""
    builds.forEach((build) => {
      html += `
        <tr>
          <td>${build.id}</td>
          <td>${build.usuario_nombre || build.usuario_id}</td>
          <td>${build.nombre_build}</td>
          <td>${build.tabla_id}</td>
          <td>${build.ruedas_id}</td>
          <td>${build.ejes_id}</td>
          <td>${formatDate(build.fecha_creacion)}</td>
          <td>
            <button class="btn btn-sm btn-info ver-build-btn" data-id="${build.id}">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-danger eliminar-build-btn" data-id="${build.id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `
    })

    tableBody.innerHTML = html

    // Añadir event listeners
    document.querySelectorAll(".ver-build-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        verBuild(id)
      })
    })

    document.querySelectorAll(".eliminar-build-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        eliminarBuild(id)
      })
    })
  } catch (error) {
    console.error("Error al cargar builds:", error)
    document.getElementById("builds-table-body").innerHTML =
      '<tr><td colspan="8" class="text-center text-danger">Error al cargar builds</td></tr>'
  }
}

// Ver detalles de build
async function verBuild(id) {
  try {
    const build = await api.getBuildById(id)

    if (build.success) {
      const buildData = build.data

      // Actualizar modal
      document.getElementById("build-id").textContent = buildData.id
      document.getElementById("build-nombre").textContent = buildData.nombre_build
      document.getElementById("build-usuario").textContent = buildData.usuario_nombre || buildData.usuario_id
      document.getElementById("build-fecha").textContent = formatDate(buildData.fecha_creacion)
      document.getElementById("build-tabla").textContent = buildData.tabla_id
      document.getElementById("build-ruedas").textContent = buildData.ruedas_id
      document.getElementById("build-ejes").textContent = buildData.ejes_id
      document.getElementById("build-grip").textContent = buildData.grip_id || "-"

      // Otros componentes
      const otrosContainer = document.getElementById("build-otros-componentes")
      if (buildData.otros_componentes && Object.keys(buildData.otros_componentes).length > 0) {
        let html = '<ul class="list-group">'
        for (const [key, value] of Object.entries(buildData.otros_componentes)) {
          html += `<li class="list-group-item"><strong>${key}:</strong> ${value}</li>`
        }
        html += "</ul>"
        otrosContainer.innerHTML = html
      } else {
        otrosContainer.innerHTML = '<p class="text-muted">No hay componentes adicionales</p>'
      }

      // Mostrar modal
      const modal = new bootstrap.Modal(document.getElementById("verBuildModal"))
      modal.show()
    } else {
      showNotification("Error al obtener detalles del build", "danger")
    }
  } catch (error) {
    console.error("Error al obtener detalles del build:", error)
    showNotification("Error al obtener detalles del build", "danger")
  }
}

// Eliminar build
function eliminarBuild(id) {
  showConfirmModal(CONFIG.messages.confirmDelete, async () => {
    try {
      const response = await api.deleteBuild(id)

      if (response.success) {
        showNotification("Build eliminado correctamente")

        // Actualizar lista
        localStorage.removeItem("builds_cache")
        loadBuilds()
      } else {
        showNotification("Error al eliminar build", "danger")
      }
    } catch (error) {
      console.error("Error al eliminar build:", error)
      showNotification("Error al eliminar build", "danger")
    }
  })
}

// Cargar mensajes
async function loadMensajes() {
  try {
    const mensajes = await getCachedData("mensajes_cache", () => api.getMensajes())
    const container = document.getElementById("mensajes-container")

    if (!mensajes || mensajes.length === 0) {
      container.innerHTML = '<p class="text-center">No hay mensajes registrados</p>'
      return
    }

    let html = ""
    mensajes.forEach((mensaje) => {
      html += `
        <div class="message-card ${mensaje.estado}">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5>${mensaje.asunto}</h5>
              <p class="small text-muted">De: ${mensaje.nombre || "Usuario"} (${mensaje.email}) - ${formatDate(mensaje.fecha_envio)}</p>
            </div>
            <span class="badge bg-${mensaje.estado === "pendiente" ? "danger" : mensaje.estado === "respondido" ? "primary" : "secondary"}">${mensaje.estado}</span>
          </div>
          <p>${mensaje.mensaje}</p>
          
          ${
            mensaje.respuesta_admin
              ? `
            <div class="mt-3 p-3 bg-light rounded">
              <p class="mb-1"><strong>Respuesta:</strong></p>
              <p>${mensaje.respuesta_admin}</p>
            </div>
          `
              : ""
          }
          
          <div class="mt-3">
            ${
              mensaje.estado === "pendiente"
                ? `
              <button class="btn btn-sm btn-primary responder-mensaje-btn" data-id="${mensaje.id}" data-asunto="${mensaje.asunto}" data-mensaje="${mensaje.mensaje}">
                <i class="bi bi-reply"></i> Responder
              </button>
            `
                : ""
            }
            <button class="btn btn-sm btn-danger eliminar-mensaje-btn" data-id="${mensaje.id}">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      `
    })

    container.innerHTML = html

    // Añadir event listeners
    document.querySelectorAll(".responder-mensaje-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        const asunto = this.getAttribute("data-asunto")
        const mensaje = this.getAttribute("data-mensaje")

        // Actualizar modal
        document.getElementById("mensaje-id").value = id
        document.getElementById("mensaje-asunto").textContent = asunto
        document.getElementById("mensaje-contenido").textContent = mensaje
        document.getElementById("mensaje-respuesta").value = ""
        document.getElementById("mensaje-estado").value = "respondido"

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById("responderMensajeModal"))
        modal.show()
      })
    })

    document.querySelectorAll(".eliminar-mensaje-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        eliminarMensaje(id)
      })
    })

    // Filtros de mensajes
    document.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const filter = this.getAttribute("data-filter")

        // Actualizar botones
        document.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("active"))
        this.classList.add("active")

        // Filtrar mensajes
        if (filter === "todos") {
          document.querySelectorAll(".message-card").forEach((card) => (card.style.display = "block"))
        } else {
          document.querySelectorAll(".message-card").forEach((card) => {
            if (card.classList.contains(filter)) {
              card.style.display = "block"
            } else {
              card.style.display = "none"
            }
          })
        }
      })
    })

    // Inicializar modal de respuesta
    initResponderMensajeModal()
  } catch (error) {
    console.error("Error al cargar mensajes:", error)
    document.getElementById("mensajes-container").innerHTML =
      '<p class="text-center text-danger">Error al cargar mensajes</p>'
  }
}

// Inicializar modal de respuesta
function initResponderMensajeModal() {
  document.getElementById("enviar-respuesta-btn").addEventListener("click", async () => {
    const id = document.getElementById("mensaje-id").value
    const respuesta = document.getElementById("mensaje-respuesta").value
    const estado = document.getElementById("mensaje-estado").value

    if (!respuesta) {
      showNotification("Debes escribir una respuesta", "warning")
      return
    }

    try {
      const response = await api.updateMensaje(id, {
        respuesta_admin: respuesta,
        estado: estado,
      })

      if (response.success) {
        showNotification("Respuesta enviada correctamente")

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("responderMensajeModal"))
        modal.hide()

        // Actualizar lista
        localStorage.removeItem("mensajes_cache")
        loadMensajes()
      } else {
        showNotification("Error al enviar respuesta", "danger")
      }
    } catch (error) {
      console.error("Error al enviar respuesta:", error)
      showNotification("Error al enviar respuesta", "danger")
    }
  })
}

// Eliminar mensaje
function eliminarMensaje(id) {
  showConfirmModal(CONFIG.messages.confirmDelete, async () => {
    try {
      const response = await api.deleteMensaje(id)

      if (response.success) {
        showNotification("Mensaje eliminado correctamente")

        // Actualizar lista
        localStorage.removeItem("mensajes_cache")
        loadMensajes()
      } else {
        showNotification("Error al eliminar mensaje", "danger")
      }
    } catch (error) {
      console.error("Error al eliminar mensaje:", error)
      showNotification("Error al eliminar mensaje", "danger")
    }
  })
}

// Cargar encuestas
async function loadEncuestas() {
  try {
    const encuestas = await getCachedData("encuestas_cache", () => api.getEncuestas())
    const tableBody = document.getElementById("encuestas-table-body")

    if (!encuestas || encuestas.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay encuestas registradas</td></tr>'
      return
    }

    let html = ""
    encuestas.forEach((encuesta) => {
      html += `
        <tr>
          <td>${encuesta.id}</td>
          <td>${encuesta.usuario_nombre || encuesta.usuario_id}</td>
          <td>${encuesta.id_pedido}</td>
          <td>${formatRating(encuesta.satisfaccion)}</td>
          <td>${truncateText(encuesta.comentario, 50)}</td>
          <td>${formatDate(encuesta.fecha_creacion)}</td>
          <td>
            <button class="btn btn-sm btn-danger eliminar-encuesta-btn" data-id="${encuesta.id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `
    })

    tableBody.innerHTML = html

    // Añadir event listeners
    document.querySelectorAll(".eliminar-encuesta-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        eliminarEncuesta(id)
      })
    })
  } catch (error) {
    console.error("Error al cargar encuestas:", error)
    document.getElementById("encuestas-table-body").innerHTML =
      '<tr><td colspan="7" class="text-center text-danger">Error al cargar encuestas</td></tr>'
  }
}

// Eliminar encuesta
function eliminarEncuesta(id) {
  showConfirmModal(CONFIG.messages.confirmDelete, async () => {
    try {
      const response = await api.deleteEncuesta(id)

      if (response.success) {
        showNotification("Encuesta eliminada correctamente")

        // Actualizar lista
        localStorage.removeItem("encuestas_cache")
        loadEncuestas()
      } else {
        showNotification("Error al eliminar encuesta", "danger")
      }
    } catch (error) {
      console.error("Error al eliminar encuesta:", error)
      showNotification("Error al eliminar encuesta", "danger")
    }
  })
}

// Cargar eventos
async function loadEventos() {
  try {
    const eventos = await getCachedData("eventos_cache", () => api.getEventos())
    const container = document.getElementById("eventos-container")

    if (!eventos || eventos.length === 0) {
      container.innerHTML = '<p class="text-center">No hay eventos registrados</p>'
      return
    }

    let html = ""
    eventos.forEach((evento) => {
      html += `
        <div class="event-card">
          <div class="d-flex justify-content-between align-items-start">
            <h5>${evento.titulo}</h5>
            <button class="btn btn-sm btn-danger eliminar-evento-btn" data-id="${evento.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <p class="event-dates">
            Desde: ${formatDate(evento.fecha_inicio)} - Hasta: ${formatDate(evento.fecha_fin)}
          </p>
          <p>${evento.descripcion}</p>
        </div>
      `
    })

    container.innerHTML = html

    // Añadir event listeners
    document.querySelectorAll(".eliminar-evento-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        eliminarEvento(id)
      })
    })

    // Inicializar formulario de creación
    initEventoForm()
  } catch (error) {
    console.error("Error al cargar eventos:", error)
    document.getElementById("eventos-container").innerHTML =
      '<p class="text-center text-danger">Error al cargar eventos</p>'
  }
}

// Inicializar formulario de creación de eventos
function initEventoForm() {
  document.getElementById("evento-form").addEventListener("submit", async function (e) {
    e.preventDefault()

    const titulo = document.getElementById("evento-titulo").value
    const descripcion = document.getElementById("evento-descripcion").value
    const fechaInicio = document.getElementById("evento-fecha-inicio").value
    const fechaFin = document.getElementById("evento-fecha-fin").value

    // Validar fechas
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      showNotification("La fecha de inicio debe ser anterior a la fecha de fin", "warning")
      return
    }

    try {
      const response = await api.createEvento({
        titulo,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      })

      if (response.success) {
        showNotification("Evento creado correctamente")

        // Limpiar formulario
        this.reset()

        // Actualizar lista
        localStorage.removeItem("eventos_cache")
        loadEventos()
      } else {
        showNotification("Error al crear evento", "danger")
      }
    } catch (error) {
      console.error("Error al crear evento:", error)
      showNotification("Error al crear evento", "danger")
    }
  })
}

// Eliminar evento
function eliminarEvento(id) {
  showConfirmModal(CONFIG.messages.confirmDelete, async () => {
    try {
      const response = await api.deleteEvento(id)

      if (response.success) {
        showNotification("Evento eliminado correctamente")

        // Actualizar lista
        localStorage.removeItem("eventos_cache")
        loadEventos()
      } else {
        showNotification("Error al eliminar evento", "danger")
      }
    } catch (error) {
      console.error("Error al eliminar evento:", error)
      showNotification("Error al eliminar evento", "danger")
    }
  })
}

// Cargar reseñas
async function loadResenas() {
  try {
    const resenas = await getCachedData("resenas_cache", () => api.getResenas())
    const tableBody = document.getElementById("resenas-table-body")

    if (!resenas || resenas.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay reseñas registradas</td></tr>'
      return
    }

    let html = ""
    resenas.forEach((resena) => {
      html += `
        <tr>
          <td>${resena.id}</td>
          <td>${resena.nombre_cliente}</td>
          <td>${resena.id_producto}</td>
          <td>${formatRating(resena.valoracion)}</td>
          <td>${truncateText(resena.comentario, 50)}</td>
          <td>${formatDate(resena.fecha_creacion)}</td>
          <td>
            <button class="btn btn-sm btn-primary editar-resena-btn" data-id="${resena.id}" data-cliente="${resena.nombre_cliente}" data-producto="${resena.id_producto}" data-valoracion="${resena.valoracion}" data-comentario="${resena.comentario}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger eliminar-resena-btn" data-id="${resena.id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `
    })

    tableBody.innerHTML = html

    // Añadir event listeners
    document.querySelectorAll(".editar-resena-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        const cliente = this.getAttribute("data-cliente")
        const producto = this.getAttribute("data-producto")
        const valoracion = this.getAttribute("data-valoracion")
        const comentario = this.getAttribute("data-comentario")

        // Actualizar modal
        document.getElementById("resena-id").value = id
        document.getElementById("resena-cliente").textContent = cliente
        document.getElementById("resena-producto").textContent = producto
        document.getElementById("resena-valoracion").value = valoracion
        document.getElementById("resena-comentario").value = comentario

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById("editarResenaModal"))
        modal.show()
      })
    })

    document.querySelectorAll(".eliminar-resena-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        eliminarResena(id)
      })
    })

    // Inicializar modal de edición
    initEditarResenaModal()
  } catch (error) {
    console.error("Error al cargar reseñas:", error)
    document.getElementById("resenas-table-body").innerHTML =
      '<tr><td colspan="7" class="text-center text-danger">Error al cargar reseñas</td></tr>'
  }
}

// Inicializar modal de edición de reseñas
function initEditarResenaModal() {
  document.getElementById("guardar-resena-btn").addEventListener("click", async () => {
    const id = document.getElementById("resena-id").value
    const valoracion = document.getElementById("resena-valoracion").value
    const comentario = document.getElementById("resena-comentario").value

    try {
      const response = await api.updateResena(id, {
        valoracion,
        comentario,
      })

      if (response.success) {
        showNotification("Reseña actualizada correctamente")

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("editarResenaModal"))
        modal.hide()

        // Actualizar lista
        localStorage.removeItem("resenas_cache")
        loadResenas()
      } else {
        showNotification("Error al actualizar reseña", "danger")
      }
    } catch (error) {
      console.error("Error al actualizar reseña:", error)
      showNotification("Error al actualizar reseña", "danger")
    }
  })
}

// Eliminar reseña
function eliminarResena(id) {
  showConfirmModal(CONFIG.messages.confirmDelete, async () => {
    try {
      const response = await api.deleteResena(id)

      if (response.success) {
        showNotification("Reseña eliminada correctamente")

        // Actualizar lista
        localStorage.removeItem("resenas_cache")
        loadResenas()
      } else {
        showNotification("Error al eliminar reseña", "danger")
      }
    } catch (error) {
      console.error("Error al eliminar reseña:", error)
      showNotification("Error al eliminar reseña", "danger")
    }
  })
}

// Inicializar filtro de visitas
function initVisitasFilter() {
  document.getElementById("filter-visitas-btn").addEventListener("click", () => {
    const productoId = document.getElementById("producto-id-filter").value

    if (!productoId) {
      showNotification("Debes ingresar un ID de producto", "warning")
      return
    }

    loadVisitasByProducto(productoId)
  })
}

// Cargar visitas por producto
async function loadVisitasByProducto(productoId) {
  try {
    const visitas = await api.getVisitasByProducto(productoId)
    const tableBody = document.getElementById("visitas-table-body")

    if (!visitas.success || !visitas.data || visitas.data.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="4" class="text-center">No hay visitas registradas para este producto</td></tr>'
      return
    }

    let html = ""
    visitas.data.forEach((visita) => {
      html += `
        <tr>
          <td>${visita.id}</td>
          <td>${visita.usuario_nombre || visita.usuario_id}</td>
          <td>${visita.id_producto}</td>
          <td>${formatDate(visita.fecha_visita)}</td>
        </tr>
      `
    })

    tableBody.innerHTML = html
  } catch (error) {
    console.error("Error al cargar visitas:", error)
    document.getElementById("visitas-table-body").innerHTML =
      '<tr><td colspan="4" class="text-center text-danger">Error al cargar visitas</td></tr>'
  }
}

// Cargar configuración
function loadConfiguracion() {
  const storedConfig = localStorage.getItem(CONFIG.storageKey)

  if (storedConfig) {
    const config = JSON.parse(storedConfig)

    // Actualizar formulario
    document.getElementById("api-url").value = config.apiUrl || CONFIG.defaults.apiUrl
    document.getElementById("api-key").value = config.apiKey || CONFIG.defaults.apiKey

    // Actualizar información del sistema
    document.getElementById("last-update").textContent = config.lastUpdate ? formatDate(config.lastUpdate) : "-"

    // Verificar estado de la API
    checkApiStatus()
  } else {
    // Valores por defecto
    document.getElementById("api-url").value = CONFIG.defaults.apiUrl
    document.getElementById("api-key").value = CONFIG.defaults.apiKey
  }
}

// Verificar estado de la API
async function checkApiStatus() {
  const statusElement = document.getElementById("api-status")
  statusElement.textContent = "Verificando..."

  try {
    const isConnected = await api.testConnection()

    if (isConnected) {
      statusElement.textContent = "Conectado"
      statusElement.className = "text-success"
    } else {
      statusElement.textContent = "Desconectado"
      statusElement.className = "text-danger"
    }
  } catch (error) {
    statusElement.textContent = "Error de conexión"
    statusElement.className = "text-danger"
  }
}

// Inicializar formulario de configuración
function initConfigForm() {
  document.getElementById("api-config-form").addEventListener("submit", (e) => {
    e.preventDefault()

    const apiUrl = document.getElementById("api-url").value
    const apiKey = document.getElementById("api-key").value

    // Guardar configuración
    api.saveConfig(apiUrl, apiKey, api.adminName)

    showNotification(CONFIG.messages.settingsSaved)

    // Verificar estado de la API
    checkApiStatus()
  })
}

// Inicializar acciones de administrador
function initAdminActions() {
  // Limpiar caché
  document.getElementById("clear-cache-btn").addEventListener("click", () => {
    clearCache()
  })

  // Probar conexión
  document.getElementById("test-connection-btn").addEventListener("click", async () => {
    try {
      const isConnected = await api.testConnection()

      if (isConnected) {
        showNotification(CONFIG.messages.connectionSuccess)
      } else {
        showNotification(CONFIG.messages.connectionError, "danger")
      }
    } catch (error) {
      console.error("Error al probar conexión:", error)
      showNotification(CONFIG.messages.connectionError, "danger")
    }
  })

  // Restablecer panel
  document.getElementById("reset-admin-btn").addEventListener("click", () => {
    showConfirmModal(CONFIG.messages.resetConfirm, () => {
      localStorage.removeItem(CONFIG.storageKey)
      clearCache()
      showNotification(CONFIG.messages.resetSuccess)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    })
  })
}

// Inicializar login
document.getElementById("login-form").addEventListener("submit", async function(e) {
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

      showNotification(CONFIG.messages.loginSuccess)

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

// Inicializar logout
function initLogout() {
  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault()

    logout()
    showNotification(CONFIG.messages.logoutSuccess)
  })
}
