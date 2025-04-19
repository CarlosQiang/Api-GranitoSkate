import crypto from "crypto"
import dotenv from "dotenv"
import Shopify from "shopify-api-node"

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

// Validar que un webhook viene realmente de Shopify
export const validateShopifyWebhook = (req) => {
  try {
    const hmacHeader = req.headers["x-shopify-hmac-sha256"]

    if (!hmacHeader) {
      console.warn("Cabecera HMAC no encontrada en la solicitud")
      return false
    }

    const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET

    if (!shopifySecret) {
      console.error("Error: SHOPIFY_WEBHOOK_SECRET no está configurado")
      return false
    }

    // Obtener el cuerpo de la solicitud como string
    let body = ""
    if (typeof req.body === "string") {
      body = req.body
    } else if (Buffer.isBuffer(req.body)) {
      body = req.body.toString("utf8")
    } else {
      body = JSON.stringify(req.body)
    }

    // Calcular el HMAC
    const hmac = crypto.createHmac("sha256", shopifySecret).update(body, "utf8").digest("base64")

    // Comparar el HMAC calculado con el recibido
    return hmac === hmacHeader
  } catch (error) {
    console.error("Error al validar webhook de Shopify:", error)
    return false
  }
}

// Formatear datos de producto de Shopify
export const formatShopifyProduct = (product) => {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.body_html,
    published: product.published_at ? true : false,
    created_at: product.created_at,
    updated_at: product.updated_at,
    vendor: product.vendor,
    product_type: product.product_type,
    tags: product.tags,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      sku: variant.sku,
      inventory_quantity: variant.inventory_quantity,
      inventory_management: variant.inventory_management,
    })),
    images: product.images.map((image) => ({
      id: image.id,
      src: image.src,
      position: image.position,
      alt: image.alt,
    })),
  }
}
