import express from "express"
import { createVisita, getVisitasByProducto } from "../controllers/visitas.controller.js"
import { checkAdmin } from "../middlewares/auth.js"
import { validateRequiredFields } from "../middlewares/validators.js"

const router = express.Router()

// POST /api/visitas - Registrar visita a producto
router.post("/", validateRequiredFields(["id_producto"]), createVisita)

// GET /api/visitas/:producto_id - Obtener visitas de un producto (admin)
router.get("/:producto_id", checkAdmin, getVisitasByProducto)

export default router
