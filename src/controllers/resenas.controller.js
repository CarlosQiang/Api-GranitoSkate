import { temaDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"

// Obtener reseñas por producto
export const getResenasByProducto = async (req, res) => {
  const { producto_id } = req.params

  try {
    const query = `
      SELECT id, nombre_cliente, id_producto, valoracion, comentario, fecha_creacion
      FROM resenas
      WHERE id_producto = $1
      ORDER BY fecha_creacion DESC
    `

    const result = await temaDB.query(query, [producto_id])

    return successResponse(res, result.rows, "Reseñas obtenidas exitosamente")
  } catch (error) {
    console.error("Error al obtener reseñas:", error)
    return errorResponse(res, "Error al obtener reseñas", 500, error)
  }
}

// Crear nueva reseña
export const createResena = async (req, res) => {
  const { nombre_cliente, id_producto, valoracion, comentario } = req.body

  try {
    const query = `
      INSERT INTO resenas (nombre_cliente, id_producto, valoracion, comentario)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre_cliente, id_producto, valoracion, comentario, fecha_creacion
    `

    const values = [nombre_cliente, id_producto, valoracion, comentario]
    const result = await temaDB.query(query, values)

    return successResponse(res, result.rows[0], "Reseña creada exitosamente", 201)
  } catch (error) {
    console.error("Error al crear reseña:", error)
    return errorResponse(res, "Error al crear reseña", 500, error)
  }
}

// Actualizar reseña (admin)
export const updateResena = async (req, res) => {
  const { id } = req.params
  const { valoracion, comentario } = req.body

  try {
    const query = `
      UPDATE resenas
      SET valoracion = $1, comentario = $2
      WHERE id = $3
      RETURNING id, nombre_cliente, id_producto, valoracion, comentario, fecha_creacion
    `

    const values = [valoracion, comentario, id]
    const result = await temaDB.query(query, values)

    if (result.rows.length === 0) {
      return errorResponse(res, "Reseña no encontrada", 404)
    }

    return successResponse(res, result.rows[0], "Reseña actualizada exitosamente")
  } catch (error) {
    console.error("Error al actualizar reseña:", error)
    return errorResponse(res, "Error al actualizar reseña", 500, error)
  }
}

// Eliminar reseña (admin)
export const deleteResena = async (req, res) => {
  const { id } = req.params

  try {
    const query = "DELETE FROM resenas WHERE id = $1 RETURNING id"
    const result = await temaDB.query(query, [id])

    if (result.rows.length === 0) {
      return errorResponse(res, "Reseña no encontrada", 404)
    }

    return successResponse(res, { id: result.rows[0].id }, "Reseña eliminada exitosamente")
  } catch (error) {
    console.error("Error al eliminar reseña:", error)
    return errorResponse(res, "Error al eliminar reseña", 500, error)
  }
}
