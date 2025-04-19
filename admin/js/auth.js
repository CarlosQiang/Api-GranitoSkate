// Funciones de autenticación para el panel de administración
import { CONFIG, showLoginModal } from "./config.js"
import { api } from "./api.js"

// Verificar sesión
export function checkSession() {
  const storedConfig = localStorage.getItem(CONFIG.storageKey)
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
export function saveSession(adminName, token, remember = false) {
  const storedConfig = localStorage.getItem(CONFIG.storageKey)
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

  localStorage.setItem(CONFIG.storageKey, JSON.stringify(config))
}

// Cerrar sesión
export function logout() {
  const storedConfig = localStorage.getItem(CONFIG.storageKey)
  if (storedConfig) {
    const config = JSON.parse(storedConfig)
    // Mantener la configuración de la API pero eliminar datos de sesión
    delete config.token
    delete config.adminName
    delete config.lastLogin
    delete config.sessionExpires
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(config))
  }

  showLoginModal()
}

// Limpiar caché
export function clearCache() {
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
}
