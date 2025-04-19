import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config()

// Validar que un webhook viene realmente de Shopify
export const validateShopifyWebhook = (req) => {
  try {
    const hmacHeader = req.headers["x-shopify-hmac-sha256"]

    if (!hmacHeader) {
      return false
    }

    const shopifySecret = process.env.SHOPIFY_WEBHOOK_SECRET

    if (!shopifySecret) {
      console.error("Error: SHOPIFY_WEBHOOK_SECRET no está configurado")
      return false
    }

    // Obtener el cuerpo de la solicitud como string
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body)

    // Calcular el HMAC
    const hmac = crypto.createHmac("sha256", shopifySecret).update(body, "utf8").digest("base64")

    // Comparar el HMAC calculado con el recibido
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(hmacHeader))
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

// Formatear datos de pedido de Shopify
export const formatShopifyOrder = (order) => {
  return {
    id: order.id,
    order_number: order.order_number,
    email: order.email,
    created_at: order.created_at,
    updated_at: order.updated_at,
    processed_at: order.processed_at,
    customer: order.customer
      ? {
          id: order.customer.id,
          email: order.customer.email,
          name: `${order.customer.first_name} ${order.customer.last_name}`.trim(),
        }
      : null,
    shipping_address: order.shipping_address
      ? {
          name: order.shipping_address.name,
          address1: order.shipping_address.address1,
          address2: order.shipping_address.address2,
          city: order.shipping_address.city,
          province: order.shipping_address.province,
          country: order.shipping_address.country,
          zip: order.shipping_address.zip,
          phone: order.shipping_address.phone,
        }
      : null,
    billing_address: order.billing_address
      ? {
          name: order.billing_address.name,
          address1: order.billing_address.address1,
          address2: order.billing_address.address2,
          city: order.billing_address.city,
          province: order.billing_address.province,
          country: order.billing_address.country,
          zip: order.billing_address.zip,
          phone: order.billing_address.phone,
        }
      : null,
    currency: order.currency,
    total_price: order.total_price,
    subtotal_price: order.subtotal_price,
    total_tax: order.total_tax,
    total_discounts: order.total_discounts,
    total_shipping: order.total_shipping_price_set?.shop_money?.amount || "0.00",
    financial_status: order.financial_status,
    fulfillment_status: order.fulfillment_status,
    line_items: order.line_items.map((item) => ({
      id: item.id,
      title: item.title,
      variant_title: item.variant_title,
      quantity: item.quantity,
      price: item.price,
      sku: item.sku,
      product_id: item.product_id,
      variant_id: item.variant_id,
    })),
  }
}

// Formatear datos de cliente de Shopify
export const formatShopifyCustomer = (customer) => {
  return {
    id: customer.id,
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    phone: customer.phone,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
    orders_count: customer.orders_count,
    total_spent: customer.total_spent,
    tags: customer.tags,
    addresses: customer.addresses
      ? customer.addresses.map((address) => ({
          id: address.id,
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          province: address.province,
          country: address.country,
          zip: address.zip,
          phone: address.phone,
          default: address.default,
        }))
      : [],
  }
}
