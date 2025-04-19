import express from "express"
import { getResenasByProducto, createResena, updateResena, deleteResena } from "../controllers/resenas.controller.js"
import { checkAdmin } from "../middlewares/auth.js"
import { validateRequiredFields, validateRating } from "../middlewares/validators.js"

const router = express.Router()

// GET /api/resenas/:producto_id - Obtener reseñas por producto
router.get("/:producto_id", getResenasByProducto)

// POST /api/resenas - Crear nueva reseña
router.post(
  "/",
  validateRequiredFields(["nombre_cliente", "id_producto", "valoracion"]),
  validateRating("valoracion"),
  createResena,
)

// PATCH /api/resenas/:id - Actualizar reseña (admin)
router.patch("/:id", checkAdmin, validateRequiredFields(["valoracion"]), validateRating("valoracion"), updateResena)

// DELETE /api/resenas/:id - Eliminar reseña (admin)
router.delete("/:id", checkAdmin, deleteResena)

export default router
