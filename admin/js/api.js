// API Client para comunicarse con el backend
class ApiClient {
  constructor() {
    this.loadConfig()
  }

  // Cargar configuración
  loadConfig() {
    const storedConfig = localStorage.getItem("adminConfig")
    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      this.apiUrl = config.apiUrl || window.location.origin
      this.token = config.token || null
      this.adminName = config.adminName || "Admin"
    } else {
      this.apiUrl = window.location.origin
      this.token = null
      this.adminName = "Admin"
    }
  }

  // Guardar configuración
  saveConfig(apiUrl, token, adminName) {
    this.apiUrl = apiUrl
    this.token = token
    this.adminName = adminName

    localStorage.setItem(
      "adminConfig",
      JSON.stringify({
        apiUrl,
        token,
        adminName,
        lastUpdate: new Date().toISOString(),
      }),
    )
  }

  // Método para hacer peticiones a la API
  async request(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    }

    // Añadir token de autenticación si existe
    if (this.token) {
      defaultOptions.headers["Authorization"] = `Bearer ${this.token}`
    }

    const url = `${this.apiUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      })

      // Si la respuesta no es exitosa
      if (!response.ok) {
        // Si es un error de autenticación
        if (response.status === 401) {
          throw new Error("Unauthorized")
        }

        const errorData = await response.json()
        throw new Error(errorData.message || "Error en la petición")
      }

      return await response.json()
    } catch (error) {
      console.error("Error en la petición a la API:", error)
      throw error
    }
  }

  // Métodos de autenticación
  async login(email, password) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async verifyToken() {
    return this.request("/api/auth/verify")
  }

  async changePassword(currentPassword, newPassword) {
    return this.request("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  // Métodos para cada recurso

  // Estadísticas
  async getStats() {
    return this.request("/api/admin/stats")
  }

  // Usuarios
  async getUsuarios() {
    return this.request("/api/usuarios")
  }

  async getUsuarioById(id) {
    return this.request(`/api/usuarios/${id}`)
  }

  // Favoritos
  async getFavoritos() {
    return this.request("/api/favoritos")
  }

  async deleteFavorito(id) {
    return this.request(`/api/favoritos/${id}`, { method: "DELETE" })
  }

  // Builds
  async getBuilds() {
    return this.request("/api/builds")
  }

  async getBuildById(id) {
    return this.request(`/api/builds/${id}`)
  }

  async deleteBuild(id) {
    return this.request(`/api/builds/${id}`, { method: "DELETE" })
  }

  // Mensajes
  async getMensajes(estado = null) {
    const query = estado ? `?estado=${estado}` : ""
    return this.request(`/api/mensajes${query}`)
  }

  async updateMensaje(id, data) {
    return this.request(`/api/mensajes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteMensaje(id) {
    return this.request(`/api/mensajes/${id}`, { method: "DELETE" })
  }

  // Encuestas
  async getEncuestas() {
    return this.request("/api/encuestas")
  }

  async deleteEncuesta(id) {
    return this.request(`/api/encuestas/${id}`, { method: "DELETE" })
  }

  // Eventos
  async getEventos() {
    return this.request("/api/eventos")
  }

  async createEvento(data) {
    return this.request("/api/eventos", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteEvento(id) {
    return this.request(`/api/eventos/${id}`, { method: "DELETE" })
  }

  // Reseñas
  async getResenas() {
    return this.request("/api/resenas")
  }

  async updateResena(id, data) {
    return this.request(`/api/resenas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteResena(id) {
    return this.request(`/api/resenas/${id}`, { method: "DELETE" })
  }

  // Visitas
  async getVisitasByProducto(productoId) {
    return this.request(`/api/visitas/${productoId}`)
  }

  // Probar conexión
  async testConnection() {
    try {
      await this.request("/")
      return true
    } catch (error) {
      return false
    }
  }
}

// Instancia global de la API
const api = new ApiClient()
