import express from "express"
import { getBuildsByUsuario, createBuild, deleteBuild } from "../controllers/builds.controller.js"
import { validateRequiredFields } from "../middlewares/validators.js"

const router = express.Router()

// GET /api/builds/:usuario_id - Obtener builds de un usuario
router.get("/:usuario_id", getBuildsByUsuario)

// POST /api/builds - Crear nuevo build
router.post("/", validateRequiredFields(["shopify_customer_id", "nombre_build", "tabla_id"]), createBuild)

// DELETE /api/builds/:id - Eliminar build
router.delete("/:id", deleteBuild)

export default router
