import express from "express"
import {
  customerCreateWebhook,
  customerUpdateWebhook,
  customerDeleteWebhook,
  orderCreateWebhook,
  productUpdateWebhook,
} from "../controllers/webhooks.controller.js"

const router = express.Router()

// Middleware para procesar el cuerpo de la solicitud como texto sin procesar
// Esto es importante para la validación HMAC
const rawBodyMiddleware = express.raw({ type: "application/json" })

// Webhooks de clientes
router.post("/customers/create", rawBodyMiddleware, customerCreateWebhook)
router.post("/customers/update", rawBodyMiddleware, customerUpdateWebhook)
router.post("/customers/delete", rawBodyMiddleware, customerDeleteWebhook)

// Webhooks de pedidos
router.post("/orders/create", rawBodyMiddleware, orderCreateWebhook)

// Webhooks de productos
router.post("/products/update", rawBodyMiddleware, productUpdateWebhook)

export default router
