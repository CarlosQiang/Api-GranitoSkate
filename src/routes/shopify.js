import express from "express"
import {
  getShopInfo,
  getProducts,
  getOrders,
  getCustomers,
  setupWebhooks,
  getWebhooks,
  deleteWebhook,
  syncCustomer,
} from "../controllers/shopify.controller.js"
import { checkAdmin } from "../middlewares/auth.js"

const router = express.Router()

// Todas las rutas de Shopify requieren autenticación de administrador
router.use(checkAdmin)

// GET /api/shopify/shop - Obtener información de la tienda
router.get("/shop", getShopInfo)

// GET /api/shopify/products - Obtener productos
router.get("/products", getProducts)

// GET /api/shopify/orders - Obtener pedidos
router.get("/orders", getOrders)

// GET /api/shopify/customers - Obtener clientes
router.get("/customers", getCustomers)

// POST /api/shopify/setup-webhooks - Configurar webhooks
router.post("/setup-webhooks", setupWebhooks)

// GET /api/shopify/webhooks - Listar webhooks
router.get("/webhooks", getWebhooks)

// DELETE /api/shopify/webhooks/:id - Eliminar webhook
router.delete("/webhooks/:id", deleteWebhook)

// POST /api/shopify/sync-customer/:id - Sincronizar un cliente específico
router.post("/sync-customer/:id", syncCustomer)

export default router
