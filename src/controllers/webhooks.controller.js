import { appDB } from "../config/db.js"
import { validateShopifyWebhook } from "../utils/shopify-helper.js"
import { logAdminAction } from "../utils/logger.js"

// Webhook para activación de cliente (customer/create)
export const customerCreateWebhook = async (req, res) => {
  try {
    // Validar que el webhook viene realmente de Shopify
    if (!validateShopifyWebhook(req)) {
      console.warn("Webhook inválido: la firma HMAC no coincide")
      return res.status(401).send("Webhook inválido")
    }

    const customer = req.body

    console.log("Webhook recibido - customer/create:", customer.id)

    // Verificar si el cliente ya existe en nuestra base de datos
    const checkQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const checkResult = await appDB.query(checkQuery, [customer.id.toString()])

    if (checkResult.rows.length > 0) {
      console.log(`Cliente ${customer.id} ya existe en la base de datos`)
      return res.status(200).send("OK") // Siempre devolver 200 a Shopify
    }

    // Crear nuevo usuario en nuestra base de datos
    const query = `
      INSERT INTO usuarios (shopify_customer_id, email, nombre)
      VALUES ($1, $2, $3)
      RETURNING id
    `

    const values = [
      customer.id.toString(),
      customer.email,
      `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
    ]

    const result = await appDB.query(query, values)

    // Registrar acción
    await logAdminAction(appDB, "Webhook Shopify", "customer_create", {
      shopify_customer_id: customer.id,
      email: customer.email,
    })

    console.log(`Cliente ${customer.id} creado en la base de datos con ID interno ${result.rows[0].id}`)

    return res.status(200).send("OK")
  } catch (error) {
    console.error("Error en webhook customer/create:", error)
    // Siempre devolver 200 a Shopify para evitar reintentos
    return res.status(200).send("Error procesado")
  }
}

// Webhook para actualización de cliente (customer/update)
export const customerUpdateWebhook = async (req, res) => {
  try {
    // Validar que el webhook viene realmente de Shopify
    if (!validateShopifyWebhook(req)) {
      console.warn("Webhook inválido: la firma HMAC no coincide")
      return res.status(401).send("Webhook inválido")
    }

    const customer = req.body

    console.log("Webhook recibido - customer/update:", customer.id)

    // Actualizar usuario en nuestra base de datos
    const query = `
      UPDATE usuarios
      SET email = $1, nombre = $2
      WHERE shopify_customer_id = $3
      RETURNING id
    `

    const values = [
      customer.email,
      `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
      customer.id.toString(),
    ]

    const result = await appDB.query(query, values)

    if (result.rows.length === 0) {
      // Si no existe, lo creamos
      return customerCreateWebhook(req, res)
    }

    // Registrar acción
    await logAdminAction(appDB, "Webhook Shopify", "customer_update", {
      shopify_customer_id: customer.id,
      email: customer.email,
    })

    console.log(`Cliente ${customer.id} actualizado en la base de datos`)

    return res.status(200).send("OK")
  } catch (error) {
    console.error("Error en webhook customer/update:", error)
    // Siempre devolver 200 a Shopify para evitar reintentos
    return res.status(200).send("Error procesado")
  }
}

// Webhook para eliminación de cliente (customer/delete)
export const customerDeleteWebhook = async (req, res) => {
  try {
    // Validar que el webhook viene realmente de Shopify
    if (!validateShopifyWebhook(req)) {
      console.warn("Webhook inválido: la firma HMAC no coincide")
      return res.status(401).send("Webhook inválido")
    }

    const customer = req.body

    console.log("Webhook recibido - customer/delete:", customer.id)

    // No eliminamos el usuario de nuestra base de datos, solo marcamos como eliminado
    const query = `
      UPDATE usuarios
      SET activo = false
      WHERE shopify_customer_id = $1
      RETURNING id
    `

    const result = await appDB.query(query, [customer.id.toString()])

    // Registrar acción
    await logAdminAction(appDB, "Webhook Shopify", "customer_delete", {
      shopify_customer_id: customer.id,
    })

    console.log(`Cliente ${customer.id} marcado como inactivo en la base de datos`)

    return res.status(200).send("OK")
  } catch (error) {
    console.error("Error en webhook customer/delete:", error)
    // Siempre devolver 200 a Shopify para evitar reintentos
    return res.status(200).send("Error procesado")
  }
}

// Webhook para creación de pedido (order/create)
export const orderCreateWebhook = async (req, res) => {
  try {
    // Validar que el webhook viene realmente de Shopify
    if (!validateShopifyWebhook(req)) {
      console.warn("Webhook inválido: la firma HMAC no coincide")
      return res.status(401).send("Webhook inválido")
    }

    const order = req.body

    console.log("Webhook recibido - order/create:", order.id)

    // Aquí puedes implementar la lógica para registrar el pedido en tu base de datos
    // Por ejemplo, enviar un email de bienvenida, actualizar inventario, etc.

    // Registrar acción
    await logAdminAction(appDB, "Webhook Shopify", "order_create", {
      order_id: order.id,
      customer_id: order.customer?.id,
    })

    return res.status(200).send("OK")
  } catch (error) {
    console.error("Error en webhook order/create:", error)
    // Siempre devolver 200 a Shopify para evitar reintentos
    return res.status(200).send("Error procesado")
  }
}

// Webhook para actualización de producto (product/update)
export const productUpdateWebhook = async (req, res) => {
  try {
    // Validar que el webhook viene realmente de Shopify
    if (!validateShopifyWebhook(req)) {
      console.warn("Webhook inválido: la firma HMAC no coincide")
      return res.status(401).send("Webhook inválido")
    }

    const product = req.body

    console.log("Webhook recibido - product/update:", product.id)

    // Aquí puedes implementar la lógica para actualizar el producto en tu base de datos

    // Registrar acción
    await logAdminAction(appDB, "Webhook Shopify", "product_update", {
      product_id: product.id,
      title: product.title,
    })

    return res.status(200).send("OK")
  } catch (error) {
    console.error("Error en webhook product/update:", error)
    // Siempre devolver 200 a Shopify para evitar reintentos
    return res.status(200).send("Error procesado")
  }
}
