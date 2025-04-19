import { appDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"

// Obtener builds de un usuario
export const getBuildsByUsuario = async (req, res) => {
  const { usuario_id } = req.params

  try {
    // Primero obtenemos el ID interno del usuario
    const userQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const userResult = await appDB.query(userQuery, [usuario_id])

    if (userResult.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const internalUserId = userResult.rows[0].id

    // Obtenemos los builds
    const query = `
      SELECT id, nombre_build, tabla_id, ruedas_id, ejes_id, grip_id, otros_componentes, fecha_creacion
      FROM build_skates
      WHERE usuario_id = $1
      ORDER BY fecha_creacion DESC
    `

    const result = await appDB.query(query, [internalUserId])

    return successResponse(res, result.rows, "Builds obtenidos exitosamente")
  } catch (error) {
    console.error("Error al obtener builds:", error)
    return errorResponse(res, "Error al obtener builds", 500, error)
  }
}

// Crear nuevo build
export const createBuild = async (req, res) => {
  const { shopify_customer_id, nombre_build, tabla_id, ruedas_id, ejes_id, grip_id, otros_componentes } = req.body

  try {
    // Obtenemos el ID interno del usuario
    const userQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const userResult = await appDB.query(userQuery, [shopify_customer_id])

    if (userResult.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const usuario_id = userResult.rows[0].id

    // Creamos el build
    const query = `
      INSERT INTO build_skates (
        usuario_id, nombre_build, tabla_id, ruedas_id, ejes_id, grip_id, otros_componentes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nombre_build, tabla_id, ruedas_id, ejes_id, grip_id, otros_componentes, fecha_creacion
    `

    const values = [usuario_id, nombre_build, tabla_id, ruedas_id, ejes_id, grip_id, otros_componentes || {}]

    const result = await appDB.query(query, values)

    return successResponse(res, result.rows[0], "Build creado exitosamente", 201)
  } catch (error) {
    console.error("Error al crear build:", error)
    return errorResponse(res, "Error al crear build", 500, error)
  }
}

// Eliminar build
export const deleteBuild = async (req, res) => {
  const { id } = req.params

  try {
    const query = "DELETE FROM build_skates WHERE id = $1 RETURNING id"
    const result = await appDB.query(query, [id])

    if (result.rows.length === 0) {
      return errorResponse(res, "Build no encontrado", 404)
    }

    return successResponse(res, { id: result.rows[0].id }, "Build eliminado exitosamente")
  } catch (error) {
    console.error("Error al eliminar build:", error)
    return errorResponse(res, "Error al eliminar build", 500, error)
  }
}
