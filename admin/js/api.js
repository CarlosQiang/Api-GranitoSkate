// Importar configuración (simulando, ya que no tenemos el archivo CONFIG)
const CONFIG = {
  storageKey: "adminConfig",
  defaults: {
    apiUrl: "http://localhost:3000",
    apiKey: "defaultApiKey",
    adminName: "Admin",
  },
}

// API Client para comunicarse con el backend
class ApiClient {
  constructor() {
    this.loadConfig()
  }

  // Cargar configuración
  loadConfig() {
    const storedConfig = localStorage.getItem(CONFIG.storageKey)
    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      this.apiUrl = config.apiUrl || CONFIG.defaults.apiUrl
      this.token = config.token || null
      this.adminName = config.adminName || CONFIG.defaults.adminName
    } else {
      this.apiUrl = CONFIG.defaults.apiUrl
      this.token = null
      this.adminName = CONFIG.defaults.adminName
    }
  }

  // Guardar configuración
  saveConfig(apiUrl, token, adminName) {
    this.apiUrl = apiUrl
    this.token = token
    this.adminName = adminName

    localStorage.setItem(
      CONFIG.storageKey,
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
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async verifyToken() {
    return this.request("/auth/verify")
  }

  async changePassword(currentPassword, newPassword) {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  // Métodos para cada recurso

  // Estadísticas
  async getStats() {
    return this.request("/admin/stats")
  }

  // Usuarios
  async getUsuarios() {
    return this.request("/usuarios")
  }

  async getUsuarioById(id) {
    return this.request(`/usuarios/${id}`)
  }

  // Favoritos
  async getFavoritos() {
    return this.request("/favoritos")
  }

  async deleteFavorito(id) {
    return this.request(`/favoritos/${id}`, { method: "DELETE" })
  }

  // Builds
  async getBuilds() {
    return this.request("/builds")
  }

  async getBuildById(id) {
    return this.request(`/builds/${id}`)
  }

  async deleteBuild(id) {
    return this.request(`/builds/${id}`, { method: "DELETE" })
  }

  // Mensajes
  async getMensajes(estado = null) {
    const query = estado ? `?estado=${estado}` : ""
    return this.request(`/mensajes${query}`)
  }

  async updateMensaje(id, data) {
    return this.request(`/mensajes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteMensaje(id) {
    return this.request(`/mensajes/${id}`, { method: "DELETE" })
  }

  // Encuestas
  async getEncuestas() {
    return this.request("/encuestas")
  }

  async deleteEncuesta(id) {
    return this.request(`/encuestas/${id}`, { method: "DELETE" })
  }

  // Eventos
  async getEventos() {
    return this.request("/eventos")
  }

  async createEvento(data) {
    return this.request("/eventos", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteEvento(id) {
    return this.request(`/eventos/${id}`, { method: "DELETE" })
  }

  // Reseñas
  async getResenas() {
    return this.request("/resenas")
  }

  async updateResena(id, data) {
    return this.request(`/resenas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteResena(id) {
    return this.request(`/resenas/${id}`, { method: "DELETE" })
  }

  // Visitas
  async getVisitasByProducto(productoId) {
    return this.request(`/visitas/${productoId}`)
  }

  // Shopify
  async getShopifyProducts(limit = 50, page = 1) {
    return this.request(`/shopify/products?limit=${limit}&page=${page}`)
  }

  async getShopifyOrders(limit = 50, status = 'any') {
    return this.request(`/shopify/orders?limit=${limit}&status=${status}`)
  }

  async getShopifyCustomers(limit = 50) {
    return this.request(`/shopify/customers?limit=${limit}`)
  }

  async getShopDetails() {
    return this.request('/shopify/shop')
  }

  async syncCustomer(customerId) {
    return this.request(`/shopify/sync-customer/${customerId}`, {
      method: "POST"
    })
  }

  async setupWebhooks() {
    return this.request('/shopify/setup-webhooks', {
      method: "POST"
    })
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
