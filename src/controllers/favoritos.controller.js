import { appDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"

// Obtener favoritos de un usuario
export const getFavoritosByUsuario = async (req, res) => {
  const { usuario_id } = req.params

  try {
    // Primero obtenemos el ID interno del usuario
    const userQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const userResult = await appDB.query(userQuery, [usuario_id])

    if (userResult.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const internalUserId = userResult.rows[0].id

    // Obtenemos los favoritos
    const query = `
      SELECT id, id_producto, nombre_producto, fecha_agregado
      FROM favoritos
      WHERE usuario_id = $1
      ORDER BY fecha_agregado DESC
    `

    const result = await appDB.query(query, [internalUserId])

    return successResponse(res, result.rows, "Favoritos obtenidos exitosamente")
  } catch (error) {
    console.error("Error al obtener favoritos:", error)
    return errorResponse(res, "Error al obtener favoritos", 500, error)
  }
}

// Agregar favorito
export const addFavorito = async (req, res) => {
  const { shopify_customer_id, id_producto, nombre_producto } = req.body

  try {
    // Obtenemos el ID interno del usuario
    const userQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const userResult = await appDB.query(userQuery, [shopify_customer_id])

    if (userResult.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const usuario_id = userResult.rows[0].id

    // Verificamos si ya existe el favorito
    const checkQuery = "SELECT id FROM favoritos WHERE usuario_id = $1 AND id_producto = $2"
    const checkResult = await appDB.query(checkQuery, [usuario_id, id_producto])

    if (checkResult.rows.length > 0) {
      return successResponse(res, { id: checkResult.rows[0].id }, "El producto ya está en favoritos")
    }

    // Agregamos el favorito
    const query = `
      INSERT INTO favoritos (usuario_id, id_producto, nombre_producto)
      VALUES ($1, $2, $3)
      RETURNING id, id_producto, nombre_producto, fecha_agregado
    `

    const values = [usuario_id, id_producto, nombre_producto]
    const result = await appDB.query(query, values)

    return successResponse(res, result.rows[0], "Favorito agregado exitosamente", 201)
  } catch (error) {
    console.error("Error al agregar favorito:", error)
    return errorResponse(res, "Error al agregar favorito", 500, error)
  }
}

// Eliminar favorito
export const deleteFavorito = async (req, res) => {
  const { id } = req.params

  try {
    const query = "DELETE FROM favoritos WHERE id = $1 RETURNING id"
    const result = await appDB.query(query, [id])

    if (result.rows.length === 0) {
      return errorResponse(res, "Favorito no encontrado", 404)
    }

    return successResponse(res, { id: result.rows[0].id }, "Favorito eliminado exitosamente")
  } catch (error) {
    console.error("Error al eliminar favorito:", error)
    return errorResponse(res, "Error al eliminar favorito", 500, error)
  }
}
