import express from "express"
import { getAllEventos, createEvento, deleteEvento } from "../controllers/eventos.controller.js"
import { checkAdmin } from "../middlewares/auth.js"
import { validateRequiredFields, validateDates } from "../middlewares/validators.js"

const router = express.Router()

// GET /api/eventos - Obtener todos los eventos
router.get("/", getAllEventos)

// POST /api/eventos - Crear nuevo evento (admin)
router.post(
  "/",
  checkAdmin,
  validateRequiredFields(["titulo", "descripcion", "fecha_inicio", "fecha_fin"]),
  validateDates("fecha_inicio", "fecha_fin"),
  createEvento,
)

// DELETE /api/eventos/:id - Eliminar evento (admin)
router.delete("/:id", checkAdmin, deleteEvento)

export default router
