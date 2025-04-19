import { getShopify, setupShopifyWebhooks, listShopifyWebhooks, deleteShopifyWebhook } from "../config/shopify.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"
import { logAdminAction } from "../utils/logger.js"
import { appDB } from "../config/db.js"

// Obtener información de la tienda
export const getShopInfo = async (req, res) => {
  try {
    const shopify = getShopify()

    if (!shopify) {
      return errorResponse(res, "Shopify no está configurado", 500)
    }

    const shop = await shopify.shop.get()
    return successResponse(res, shop, "Información de la tienda obtenida correctamente")
  } catch (error) {
    console.error("Error al obtener información de la tienda:", error)
    return errorResponse(res, "Error al obtener información de la tienda", 500, error)
  }
}

// Obtener productos
export const getProducts = async (req, res) => {
  try {
    const shopify = getShopify()

    if (!shopify) {
      return errorResponse(res, "Shopify no está configurado", 500)
    }

    const { limit = 50, page = 1 } = req.query

    const products = await shopify.product.list({
      limit: Number.parseInt(limit),
      page: Number.parseInt(page),
    })

    return successResponse(res, products, "Productos obtenidos correctamente")
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return errorResponse(res, "Error al obtener productos", 500, error)
  }
}

// Obtener pedidos
export const getOrders = async (req, res) => {
  try {
    const shopify = getShopify()

    if (!shopify) {
      return errorResponse(res, "Shopify no está configurado", 500)
    }

    const { limit = 50, status = "any" } = req.query

    const orders = await shopify.order.list({
      limit: Number.parseInt(limit),
      status: status,
    })

    return successResponse(res, orders, "Pedidos obtenidos correctamente")
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return errorResponse(res, "Error al obtener pedidos", 500, error)
  }
}

// Obtener clientes
export const getCustomers = async (req, res) => {
  try {
    const shopify = getShopify()

    if (!shopify) {
      return errorResponse(res, "Shopify no está configurado", 500)
    }

    const { limit = 50 } = req.query

    const customers = await shopify.customer.list({
      limit: Number.parseInt(limit),
    })

    return successResponse(res, customers, "Clientes obtenidos correctamente")
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return errorResponse(res, "Error al obtener clientes", 500, error)
  }
}

// Configurar webhooks
export const setupWebhooks = async (req, res) => {
  try {
    // Obtener la URL base desde la solicitud o configuración
    const baseUrl = req.body.baseUrl || process.env.API_URL || req.headers.origin || "https://tu-api.vercel.app"

    // Registrar acción
    await logAdminAction(appDB, req.headers["admin-name"] || "Admin", "setup_webhooks", {
      baseUrl,
    })

    const success = await setupShopifyWebhooks(baseUrl)

    if (success) {
      return successResponse(res, { baseUrl }, "Webhooks configurados correctamente")
    } else {
      return errorResponse(res, "Error al configurar webhooks", 500)
    }
  } catch (error) {
    console.error("Error al configurar webhooks:", error)
    return errorResponse(res, "Error al configurar webhooks", 500, error)
  }
}

// Listar webhooks
export const getWebhooks = async (req, res) => {
  try {
    const webhooks = await listShopifyWebhooks()
    return successResponse(res, webhooks, "Webhooks obtenidos correctamente")
  } catch (error) {
    console.error("Error al obtener webhooks:", error)
    return errorResponse(res, "Error al obtener webhooks", 500, error)
  }
}

// Eliminar webhook
export const deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params

    // Registrar acción
    await logAdminAction(appDB, req.headers["admin-name"] || "Admin", "delete_webhook", {
      webhook_id: id,
    })

    const success = await deleteShopifyWebhook(id)

    if (success) {
      return successResponse(res, { id }, "Webhook eliminado correctamente")
    } else {
      return errorResponse(res, "Error al eliminar webhook", 500)
    }
  } catch (error) {
    console.error("Error al eliminar webhook:", error)
    return errorResponse(res, "Error al eliminar webhook", 500, error)
  }
}

// Sincronizar un cliente específico
export const syncCustomer = async (req, res) => {
  try {
    const shopify = getShopify()

    if (!shopify) {
      return errorResponse(res, "Shopify no está configurado", 500)
    }

    const { id } = req.params

    // Obtener cliente de Shopify
    const customer = await shopify.customer.get(id)

    if (!customer) {
      return errorResponse(res, "Cliente no encontrado en Shopify", 404)
    }

    // Verificar si el cliente ya existe en nuestra base de datos
    const checkQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const checkResult = await appDB.query(checkQuery, [customer.id.toString()])

    let userId

    if (checkResult.rows.length > 0) {
      // Actualizar usuario existente
      userId = checkResult.rows[0].id

      const updateQuery = `
        UPDATE usuarios
        SET email = $1, nombre = $2
        WHERE id = $3
      `

      const values = [customer.email, `${customer.first_name || ""} ${customer.last_name || ""}`.trim(), userId]

      await appDB.query(updateQuery, values)
    } else {
      // Crear nuevo usuario
      const insertQuery = `
        INSERT INTO usuarios (shopify_customer_id, email, nombre)
        VALUES ($1, $2, $3)
        RETURNING id
      `

      const values = [
        customer.id.toString(),
        customer.email,
        `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
      ]

      const result = await appDB.query(insertQuery, values)
      userId = result.rows[0].id
    }

    // Registrar acción
    await logAdminAction(appDB, req.headers["admin-name"] || "Admin", "sync_customer", {
      shopify_customer_id: customer.id,
      email: customer.email,
      usuario_id: userId,
    })

    return successResponse(res, { customer, internal_id: userId }, "Cliente sincronizado correctamente")
  } catch (error) {
    console.error("Error al sincronizar cliente:", error)
    return errorResponse(res, "Error al sincronizar cliente", 500, error)
  }
}
