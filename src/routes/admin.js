import express from "express"
import { getStats, getAdminLog } from "../controllers/admin.controller.js"
import { checkAdmin } from "../middlewares/auth.js"

const router = express.Router()

// GET /api/admin/stats - Obtener estadísticas generales
router.get("/stats", checkAdmin, getStats)

// GET /api/admin/log - Obtener log de acciones de administrador
router.get("/log", checkAdmin, getAdminLog)

export default router
