import { appDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"
import { logAdminAction } from "../utils/logger.js"

// Crear nuevo mensaje
export const createMensaje = async (req, res) => {
  const { shopify_customer_id, asunto, mensaje } = req.body

  try {
    // Obtenemos el ID interno del usuario
    const userQuery = "SELECT id FROM usuarios WHERE shopify_customer_id = $1"
    const userResult = await appDB.query(userQuery, [shopify_customer_id])

    if (userResult.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const usuario_id = userResult.rows[0].id

    // Creamos el mensaje
    const query = `
      INSERT INTO mensajes (usuario_id, asunto, mensaje)
      VALUES ($1, $2, $3)
      RETURNING id, asunto, mensaje, estado, fecha_envio
    `

    const values = [usuario_id, asunto, mensaje]
    const result = await appDB.query(query, values)

    return successResponse(res, result.rows[0], "Mensaje enviado exitosamente", 201)
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    return errorResponse(res, "Error al crear mensaje", 500, error)
  }
}

// Obtener todos los mensajes (admin)
export const getAllMensajes = async (req, res) => {
  const { estado } = req.query

  try {
    let query = `
      SELECT m.id, m.asunto, m.mensaje, m.estado, m.respuesta_admin, m.fecha_envio,
             u.shopify_customer_id, u.email, u.nombre
      FROM mensajes m
      JOIN usuarios u ON m.usuario_id = u.id
    `

    const values = []

    if (estado) {
      query += " WHERE m.estado = $1"
      values.push(estado)
    }

    query += " ORDER BY m.fecha_envio DESC"

    const result = await appDB.query(query, values)

    // Registrar acción de administrador
    const adminName = req.headers["admin-name"] || "Admin"
    await logAdminAction(appDB, adminName, "consulta_mensajes", { filtro: estado || "todos" })

    return successResponse(res, result.rows, "Mensajes obtenidos exitosamente")
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
    return errorResponse(res, "Error al obtener mensajes", 500, error)
  }
}

// Actualizar estado y respuesta de mensaje (admin)
export const updateMensaje = async (req, res) => {
  const { id } = req.params
  const { estado, respuesta_admin } = req.body

  try {
    const query = `
      UPDATE mensajes
      SET estado = $1, respuesta_admin = $2
      WHERE id = $3
      RETURNING id, asunto, mensaje, estado, respuesta_admin, fecha_envio
    `

    const values = [estado, respuesta_admin, id]
    const result = await appDB.query(query, values)

    if (result.rows.length === 0) {
      return errorResponse(res, "Mensaje no encontrado", 404)
    }

    // Registrar acción de administrador
    const adminName = req.headers["admin-name"] || "Admin"
    await logAdminAction(appDB, adminName, "respuesta_mensaje", {
      mensaje_id: id,
      nuevo_estado: estado,
    })

    return successResponse(res, result.rows[0], "Mensaje actualizado exitosamente")
  } catch (error) {
    console.error("Error al actualizar mensaje:", error)
    return errorResponse(res, "Error al actualizar mensaje", 500, error)
  }
}

// Eliminar mensaje (admin)
export const deleteMensaje = async (req, res) => {
  const { id } = req.params

  try {
    const query = "DELETE FROM mensajes WHERE id = $1 RETURNING id"
    const result = await appDB.query(query, [id])

    if (result.rows.length === 0) {
      return errorResponse(res, "Mensaje no encontrado", 404)
    }

    // Registrar acción de administrador
    const adminName = req.headers["admin-name"] || "Admin"
    await logAdminAction(appDB, adminName, "eliminacion_mensaje", { mensaje_id: id })

    return successResponse(res, { id: result.rows[0].id }, "Mensaje eliminado exitosamente")
  } catch (error) {
    console.error("Error al eliminar mensaje:", error)
    return errorResponse(res, "Error al eliminar mensaje", 500, error)
  }
}
