import { appDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"

// Crear nueva encuesta
export const createEncuesta = async (req, res) => {
  const { shopify_customer_id, id_pedido, satisfaccion, comentario } = req.body

  try {
    // Obtenemos el ID interno del usuario
    const userQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const userResult = await appDB.query(userQuery, [shopify_customer_id])

    if (userResult.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const usuario_id = userResult.rows[0].id

    // Verificamos si ya existe una encuesta para este pedido
    const checkQuery = "SELECT id FROM encuestas WHERE usuario_id = $1 AND id_pedido = $2"
    const checkResult = await appDB.query(checkQuery, [usuario_id, id_pedido])

    if (checkResult.rows.length > 0) {
      return errorResponse(res, "Ya existe una encuesta para este pedido", 400)
    }

    // Creamos la encuesta
    const query = `
      INSERT INTO encuestas (usuario_id, id_pedido, satisfaccion, comentario)
      VALUES ($1, $2, $3, $4)
      RETURNING id, id_pedido, satisfaccion, comentario, fecha_creacion
    `

    const values = [usuario_id, id_pedido, satisfaccion, comentario]
    const result = await appDB.query(query, values)

    return successResponse(res, result.rows[0], "Encuesta enviada exitosamente", 201)
  } catch (error) {
    console.error("Error al crear encuesta:", error)
    return errorResponse(res, "Error al crear encuesta", 500, error)
  }
}

// Obtener todas las encuestas (admin)
export const getAllEncuestas = async (req, res) => {
  try {
    const query = `
      SELECT e.id, e.id_pedido, e.satisfaccion, e.comentario, e.fecha_creacion,
             u.shopify_customer_id, u.email, u.nombre
      FROM encuestas e
      JOIN usuarios u ON e.usuario_id = u.id
      ORDER BY e.fecha_creacion DESC
    `

    const result = await appDB.query(query)

    return successResponse(res, result.rows, "Encuestas obtenidas exitosamente")
  } catch (error) {
    console.error("Error al obtener encuestas:", error)
    return errorResponse(res, "Error al obtener encuestas", 500, error)
  }
}

// Eliminar encuesta (admin)
export const deleteEncuesta = async (req, res) => {
  const { id } = req.params

  try {
    const query = "DELETE FROM encuestas WHERE id = $1 RETURNING id"
    const result = await appDB.query(query, [id])

    if (result.rows.length === 0) {
      return errorResponse(res, "Encuesta no encontrada", 404)
    }

    return successResponse(res, { id: result.rows[0].id }, "Encuesta eliminada exitosamente")
  } catch (error) {
    console.error("Error al eliminar encuesta:", error)
    return errorResponse(res, "Error al eliminar encuesta", 500, error)
  }
}
