import Shopify from "shopify-api-node"
import dotenv from "dotenv"

dotenv.config()

let shopify = null

// Inicializar cliente de Shopify
export const initShopify = () => {
  if (!process.env.SHOPIFY_SHOP_NAME || !process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_PASSWORD) {
    console.warn("Advertencia: Credenciales de Shopify no configuradas")
    return null
  }

  try {
    shopify = new Shopify({
      shopName: process.env.SHOPIFY_SHOP_NAME,
      apiKey: process.env.SHOPIFY_API_KEY,
      password: process.env.SHOPIFY_API_PASSWORD,
      apiVersion: process.env.SHOPIFY_API_VERSION || "2023-10",
    })

    return shopify
  } catch (error) {
    console.error("Error al inicializar Shopify:", error)
    return null
  }
}

// Probar conexión a Shopify
export const testShopifyConnection = async () => {
  try {
    if (!shopify) {
      initShopify()
    }

    if (!shopify) return false

    // Intentar obtener información de la tienda
    const shop = await shopify.shop.get()
    return !!shop
  } catch (error) {
    console.error("Error al probar conexión con Shopify:", error)
    return false
  }
}

// Obtener cliente de Shopify
export const getShopify = () => {
  if (!shopify) {
    return initShopify()
  }
  return shopify
}

// Configurar webhooks de Shopify
export const setupShopifyWebhooks = async (baseUrl) => {
  try {
    if (!shopify) {
      initShopify()
    }

    if (!shopify) {
      console.error("No se pudo inicializar Shopify para configurar webhooks")
      return false
    }

    // Definir los webhooks que queremos configurar
    const webhooks = [
      {
        topic: "customers/create",
        address: `${baseUrl}/api/webhooks/customer/create`,
        format: "json",
      },
      {
        topic: "customers/update",
        address: `${baseUrl}/api/webhooks/customer/update`,
        format: "json",
      },
      {
        topic: "orders/create",
        address: `${baseUrl}/api/webhooks/order/create`,
        format: "json",
      },
      {
        topic: "orders/cancelled",
        address: `${baseUrl}/api/webhooks/order/cancelled`,
        format: "json",
      },
      {
        topic: "products/update",
        address: `${baseUrl}/api/webhooks/product/update`,
        format: "json",
      },
    ]

    // Obtener webhooks existentes
    const existingWebhooks = await shopify.webhook.list()

    // Crear o actualizar cada webhook
    for (const webhook of webhooks) {
      // Verificar si ya existe un webhook con este topic y address
      const existing = existingWebhooks.find((w) => w.topic === webhook.topic && w.address === webhook.address)

      if (existing) {
        console.log(`Webhook para ${webhook.topic} ya existe, ID: ${existing.id}`)
      } else {
        // Crear nuevo webhook
        const newWebhook = await shopify.webhook.create(webhook)
        console.log(`Webhook para ${webhook.topic} creado, ID: ${newWebhook.id}`)
      }
    }

    return true
  } catch (error) {
    console.error("Error al configurar webhooks de Shopify:", error)
    return false
  }
}

// Listar webhooks configurados
export const listShopifyWebhooks = async () => {
  try {
    if (!shopify) {
      initShopify()
    }

    if (!shopify) return []

    const webhooks = await shopify.webhook.list()
    return webhooks
  } catch (error) {
    console.error("Error al listar webhooks de Shopify:", error)
    return []
  }
}

// Eliminar un webhook
export const deleteShopifyWebhook = async (webhookId) => {
  try {
    if (!shopify) {
      initShopify()
    }

    if (!shopify) return false

    await shopify.webhook.delete(webhookId)
    return true
  } catch (error) {
    console.error(`Error al eliminar webhook ${webhookId}:`, error)
    return false
  }
}
