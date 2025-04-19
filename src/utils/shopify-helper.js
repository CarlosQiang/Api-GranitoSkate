// Utilidades para interactuar con Shopify si es necesario
import dotenv from "dotenv"

dotenv.config()

// Función para validar un webhook de Shopify (opcional)
export const validateShopifyWebhook = (req) => {
  const hmac = req.headers["x-shopify-hmac-sha256"]
  // Implementar validación HMAC si se necesita
  return true
}

// Función para formatear datos de productos (opcional)
export const formatProductData = (shopifyProduct) => {
  if (!shopifyProduct) return null

  return {
    id: shopifyProduct.id,
    title: shopifyProduct.title,
    handle: shopifyProduct.handle,
    price: shopifyProduct.variants?.[0]?.price || "0",
    image: shopifyProduct.images?.[0]?.src || "",
    // Otros campos que necesites
  }
}
