import { appDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"

// Registrar visita a producto
export const createVisita = async (req, res) => {
  const { shopify_customer_id, id_producto } = req.body

  try {
    // Si no hay customer_id, simplemente no registramos la visita
    if (!shopify_customer_id) {
      return successResponse(res, null, "Visita anónima no registrada")
    }

    // Obtenemos el ID interno del usuario
    const userQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const userResult = await appDB.query(userQuery, [shopify_customer_id])

    if (userResult.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const usuario_id = userResult.rows[0].id

    // Registramos la visita
    const query = `
      INSERT INTO visitas (usuario_id, id_producto)
      VALUES ($1, $2)
      RETURNING id, id_producto, fecha_visita
    `

    const values = [usuario_id, id_producto]
    const result = await appDB.query(query, values)

    return successResponse(res, result.rows[0], "Visita registrada exitosamente", 201)
  } catch (error) {
    console.error("Error al registrar visita:", error)
    return errorResponse(res, "Error al registrar visita", 500, error)
  }
}

// Obtener visitas de un producto
export const getVisitasByProducto = async (req, res) => {
  const { producto_id } = req.params

  try {
    const query = `
      SELECT v.id, v.fecha_visita,
             u.shopify_customer_id, u.email, u.nombre
      FROM visitas v
      JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id_producto = $1
      ORDER BY v.fecha_visita DESC
    `

    const result = await appDB.query(query, [producto_id])

    return successResponse(res, result.rows, "Visitas obtenidas exitosamente")
  } catch (error) {
    console.error("Error al obtener visitas:", error)
    return errorResponse(res, "Error al obtener visitas", 500, error)
  }
}
