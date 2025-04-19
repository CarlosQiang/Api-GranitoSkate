import { appDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"

// Obtener usuario por ID
export const getUsuarioById = async (req, res) => {
  const { id } = req.params

  try {
    const query = `
      SELECT id, shopify_customer_id, email, nombre, fecha_registro
      FROM usuarios
      WHERE shopify_customer_id = $1
    `

    const result = await appDB.query(query, [id])

    if (result.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    return successResponse(res, result.rows[0], "Usuario encontrado")
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return errorResponse(res, "Error al obtener usuario", 500, error)
  }
}

// Crear nuevo usuario
export const createUsuario = async (req, res) => {
  const { shopify_customer_id, email, nombre } = req.body

  try {
    // Verificar si el usuario ya existe
    const checkQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const checkResult = await appDB.query(checkQuery, [shopify_customer_id])

    if (checkResult.rows.length > 0) {
      return successResponse(res, { id: checkResult.rows[0].id }, "Usuario ya existe", 200)
    }

    // Crear nuevo usuario
    const query = `
      INSERT INTO usuarios (shopify_customer_id, email, nombre)
      VALUES ($1, $2, $3)
      RETURNING id, shopify_customer_id, email, nombre, fecha_registro
    `

    const values = [shopify_customer_id, email, nombre]
    const result = await appDB.query(query, values)

    return successResponse(res, result.rows[0], "Usuario creado exitosamente", 201)
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return errorResponse(res, "Error al crear usuario", 500, error)
  }
}
