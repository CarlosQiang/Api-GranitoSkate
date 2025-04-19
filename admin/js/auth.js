// Importar la instancia de la API (asegúrate de que la ruta sea correcta)
import { api } from "./api.js"

// Funciones de autenticación para el panel de administración

// Verificar sesión
function checkSession() {
  const storedConfig = localStorage.getItem("adminConfig")
  if (!storedConfig) {
    showLoginModal()
    return false
  }

  try {
    const config = JSON.parse(storedConfig)
    if (!config.token) {
      showLoginModal()
      return false
    }

    // Verificar si hay una fecha de última actualización y si ha pasado más de un día
    if (config.lastLogin) {
      const lastLogin = new Date(config.lastLogin)
      const now = new Date()
      const oneDayMs = 24 * 60 * 60 * 1000

      if (now - lastLogin > oneDayMs) {
        // Verificar token con el servidor
        api
          .verifyToken()
          .then(() => {
            // Token válido, actualizar fecha de login
            saveSession(config.adminName, config.token)
          })
          .catch(() => {
            // Token inválido o expirado
            showLoginModal()
            return false
          })
      }
    }

    return true
  } catch (error) {
    console.error("Error al verificar sesión:", error)
    showLoginModal()
    return false
  }
}

// Guardar datos de sesión
function saveSession(adminName, token, remember = false) {
  const storedConfig = localStorage.getItem("adminConfig")
  const config = storedConfig ? JSON.parse(storedConfig) : {}

  config.adminName = adminName
  config.token = token
  config.lastLogin = new Date().toISOString()

  if (!remember) {
    // Si no se marca "recordarme", la sesión expira en 1 día
    config.sessionExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  } else {
    // Si se marca "recordarme", la sesión no expira
    config.sessionExpires = null
  }

  localStorage.setItem("adminConfig", JSON.stringify(config))
}

// Cerrar sesión
function logout() {
  const storedConfig = localStorage.getItem("adminConfig")
  if (storedConfig) {
    const config = JSON.parse(storedConfig)
    // Mantener la configuración de la API pero eliminar datos de sesión
    delete config.token
    delete config.adminName
    delete config.lastLogin
    delete config.sessionExpires
    localStorage.setItem("adminConfig", JSON.stringify(config))
  }

  showLoginModal()
}

// Mostrar modal de login
function showLoginModal() {
  const loginModalElement = document.getElementById("loginModal")
  if (loginModalElement) {
    const loginModal = new bootstrap.Modal(loginModalElement)
    loginModal.show()
  } else {
    console.error("El elemento con ID 'loginModal' no se encontró en el DOM.")
  }
}
