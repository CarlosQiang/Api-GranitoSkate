import { temaDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"

// Obtener todos los eventos
export const getAllEventos = async (req, res) => {
  try {
    const query = `
      SELECT id, titulo, descripcion, fecha_inicio, fecha_fin
      FROM eventos
      WHERE fecha_fin >= CURRENT_DATE
      ORDER BY fecha_inicio ASC
    `

    const result = await temaDB.query(query)

    return successResponse(res, result.rows, "Eventos obtenidos exitosamente")
  } catch (error) {
    console.error("Error al obtener eventos:", error)
    return errorResponse(res, "Error al obtener eventos", 500, error)
  }
}

// Crear nuevo evento (admin)
export const createEvento = async (req, res) => {
  const { titulo, descripcion, fecha_inicio, fecha_fin } = req.body

  try {
    const query = `
      INSERT INTO eventos (titulo, descripcion, fecha_inicio, fecha_fin)
      VALUES ($1, $2, $3, $4)
      RETURNING id, titulo, descripcion, fecha_inicio, fecha_fin
    `

    const values = [titulo, descripcion, fecha_inicio, fecha_fin]
    const result = await temaDB.query(query, values)

    return successResponse(res, result.rows[0], "Evento creado exitosamente", 201)
  } catch (error) {
    console.error("Error al crear evento:", error)
    return errorResponse(res, "Error al crear evento", 500, error)
  }
}

// Eliminar evento (admin)
export const deleteEvento = async (req, res) => {
  const { id } = req.params

  try {
    const query = "DELETE FROM eventos WHERE id = $1 RETURNING id"
    const result = await temaDB.query(query, [id])

    if (result.rows.length === 0) {
      return errorResponse(res, "Evento no encontrado", 404)
    }

    return successResponse(res, { id: result.rows[0].id }, "Evento eliminado exitosamente")
  } catch (error) {
    console.error("Error al eliminar evento:", error)
    return errorResponse(res, "Error al eliminar evento", 500, error)
  }
}
