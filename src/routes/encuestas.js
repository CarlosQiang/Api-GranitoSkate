import express from "express"
import { createEncuesta, getAllEncuestas, deleteEncuesta } from "../controllers/encuestas.controller.js"
import { checkAdmin } from "../middlewares/auth.js"
import { validateRequiredFields, validateRating } from "../middlewares/validators.js"

const router = express.Router()

// POST /api/encuestas - Crear nueva encuesta
router.post(
  "/",
  validateRequiredFields(["shopify_customer_id", "id_pedido", "satisfaccion"]),
  validateRating("satisfaccion"),
  createEncuesta,
)

// GET /api/encuestas - Obtener todas las encuestas (admin)
router.get("/", checkAdmin, getAllEncuestas)

// DELETE /api/encuestas/:id - Eliminar encuesta (admin)
router.delete("/:id", checkAdmin, deleteEncuesta)

export default router
