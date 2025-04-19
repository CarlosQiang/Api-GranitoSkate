import express from "express"
import { createMensaje, getAllMensajes, updateMensaje, deleteMensaje } from "../controllers/mensajes.controller.js"
import { checkAdmin } from "../middlewares/auth.js"
import { validateRequiredFields } from "../middlewares/validators.js"

const router = express.Router()

// POST /api/mensajes - Crear nuevo mensaje
router.post("/", validateRequiredFields(["shopify_customer_id", "asunto", "mensaje"]), createMensaje)

// GET /api/mensajes - Obtener todos los mensajes (admin)
router.get("/", checkAdmin, getAllMensajes)

// PATCH /api/mensajes/:id - Actualizar estado y respuesta de mensaje (admin)
router.patch("/:id", checkAdmin, validateRequiredFields(["estado"]), updateMensaje)

// DELETE /api/mensajes/:id - Eliminar mensaje (admin)
router.delete("/:id", checkAdmin, deleteMensaje)

export default router
