import express from "express"
import { getFavoritosByUsuario, addFavorito, deleteFavorito } from "../controllers/favoritos.controller.js"
import { validateRequiredFields } from "../middlewares/validators.js"

const router = express.Router()

// GET /api/favoritos/:usuario_id - Obtener favoritos de un usuario
router.get("/:usuario_id", getFavoritosByUsuario)

// POST /api/favoritos - Agregar favorito
router.post("/", validateRequiredFields(["shopify_customer_id", "id_producto", "nombre_producto"]), addFavorito)

// DELETE /api/favoritos/:id - Eliminar favorito
router.delete("/:id", deleteFavorito)

export default router
