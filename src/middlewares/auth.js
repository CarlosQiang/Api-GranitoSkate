import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { appDB } from "../config/db.js"
import { errorResponse } from "../utils/responseHandler.js"

dotenv.config()

// Middleware para verificar token JWT
export const verifyToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return errorResponse(res, "Acceso denegado. Token no proporcionado", 401)
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return errorResponse(res, "Token inválido o expirado", 401)
      }

      // Añadir datos del usuario al request
      req.user = decoded
      next()
    })
  } catch (error) {
    return errorResponse(res, "Error al verificar token", 500, error)
  }
}

// Middleware para verificar si la petición viene del administrador
export const checkAdmin = (req, res, next) => {
  const apiKey = req.headers["x-api-key"]

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return errorResponse(res, "No autorizado. Se requiere clave de API válida.", 401)
  }

  next()
}

// Middleware para verificar rol de administrador
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return errorResponse(res, "Acceso denegado", 401)
    }

    // Verificar si el usuario es administrador
    const query = "SELECT role FROM admins WHERE id = $1"
    const result = await appDB.query(query, [req.user.id])

    if (result.rows.length === 0 || result.rows[0].role !== "admin") {
      return errorResponse(res, "Acceso denegado. Se requiere rol de administrador", 403)
    }

    next()
  } catch (error) {
    return errorResponse(res, "Error al verificar rol de administrador", 500, error)
  }
}

// Middleware para validar que el usuario existe
export const validateUser = async (req, res, next) => {
  const userId = req.params.id || req.body.usuario_id

  if (!userId) {
    return errorResponse(res, "Se requiere ID de usuario", 400)
  }

  // La validación real se hará en los controladores
  next()
}
