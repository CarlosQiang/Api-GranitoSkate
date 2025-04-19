import express from "express"
import { getUsuarioById, createUsuario } from "../controllers/usuarios.controller.js"
import { validateRequiredFields } from "../middlewares/validators.js"

const router = express.Router()

// GET /api/usuarios/:id - Obtener usuario por ID
router.get("/:id", getUsuarioById)

// POST /api/usuarios - Crear nuevo usuario
router.post("/", validateRequiredFields(["shopify_customer_id", "email"]), createUsuario)

export default router
