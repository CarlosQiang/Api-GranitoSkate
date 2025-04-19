// Configuración global para el panel de administración

// Importar Bootstrap (si no se está importando en otro lugar)
import * as bootstrap from "bootstrap"

// Clave para almacenamiento local
const CONFIG = {
  storageKey: "granitoskate_admin_config",
  defaults: {
    apiUrl: window.location.origin,
    adminName: "Admin",
  },
  messages: {
    confirmDelete: "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.",
    settingsSaved: "Configuración guardada correctamente",
    connectionSuccess: "Conexión exitosa con la API",
    connectionError: "Error al conectar con la API",
    resetConfirm: "¿Estás seguro de que deseas restablecer el panel? Se perderán todas las configuraciones.",
    resetSuccess: "Panel restablecido correctamente",
    loginSuccess: "Sesión iniciada correctamente",
    logoutSuccess: "Sesión cerrada correctamente",
  },
}

// Función para mostrar el modal de login
function showLoginModal() {
  const loginModal = new bootstrap.Modal(document.getElementById("loginModal"))
  loginModal.show()
}

// Función para mostrar notificaciones
function showNotification(message, type = "success") {
  const toastContainer = document.querySelector(".toast-container")

  if (!toastContainer) {
    const container = document.createElement("div")
    container.className = "toast-container"
    document.body.appendChild(container)
  }

  const toast = document.createElement("div")
  toast.className = `toast bg-${type} text-white`
  toast.setAttribute("role", "alert")
  toast.setAttribute("aria-live", "assertive")
  toast.setAttribute("aria-atomic", "true")

  toast.innerHTML = `
    <div class="toast-header bg-${type} text-white">
      <strong class="me-auto">GranitoSkate Admin</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `

  document.querySelector(".toast-container").appendChild(toast)

  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000,
  })

  bsToast.show()

  // Eliminar el toast después de ocultarse
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove()
  })
}

// Función para mostrar modal de confirmación
function showConfirmModal(message, callback) {
  const confirmModal = document.getElementById("confirmModal")
  const confirmMessage = document.getElementById("confirm-message")
  const confirmActionBtn = document.getElementById("confirm-action-btn")

  // Actualizar mensaje
  confirmMessage.textContent = message

  // Actualizar acción del botón
  const oldConfirmAction = confirmActionBtn.onclick
  confirmActionBtn.onclick = () => {
    callback()
    const modal = bootstrap.Modal.getInstance(confirmModal)
    modal.hide()

    // Restaurar acción anterior
    setTimeout(() => {
      confirmActionBtn.onclick = oldConfirmAction
    }, 100)
  }

  // Mostrar modal
  const modal = new bootstrap.Modal(confirmModal)
  modal.show()
}

// Función para limpiar caché
function clearCache() {
  // Eliminar todos los elementos de caché
  const cacheKeys = [
    "stats_cache",
    "mensajes_cache",
    "eventos_cache",
    "usuarios_cache",
    "favoritos_cache",
    "builds_cache",
    "encuestas_cache",
    "resenas_cache",
  ]

  cacheKeys.forEach((key) => localStorage.removeItem(key))

  showNotification("Caché limpiado correctamente")
}

// Función para obtener datos en caché
async function getCachedData(cacheKey, fetchFunction, expirationMinutes = 5) {
  try {
    const cachedData = localStorage.getItem(cacheKey)

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData)
      const now = new Date().getTime()
      const expirationTime = expirationMinutes * 60 * 1000

      // Verificar si los datos no han expirado
      if (now - timestamp < expirationTime) {
        return data
      }
    }

    // Si no hay datos en caché o han expirado, obtener nuevos datos
    const response = await fetchFunction()

    if (response.success) {
      // Guardar en caché
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: response.data,
          timestamp: new Date().getTime(),
        }),
      )

      return response.data
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error(`Error al obtener datos para ${cacheKey}:`, error)
    throw error
  }
}

// Funciones de utilidad para formateo
function formatDate(dateString) {
  if (!dateString) return "-"

  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function truncateText(text, maxLength) {
  if (!text) return "-"

  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + "..."
}

function formatRating(rating) {
  if (!rating) return "-"

  let stars = ""
  for (let i = 0; i < rating; i++) {
    stars += "★"
  }
  for (let i = rating; i < 5; i++) {
    stars += "☆"
  }

  return stars
}

// Exportar variables y funciones
export {
  CONFIG,
  showLoginModal,
  showNotification,
  showConfirmModal,
  clearCache,
  getCachedData,
  formatDate,
  truncateText,
  formatRating,
}
