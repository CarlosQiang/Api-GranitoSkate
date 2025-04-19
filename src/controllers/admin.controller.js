import { appDB, temaDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"
import { logAdminAction } from "../utils/logger.js"

// Obtener estadísticas generales
export const getStats = async (req, res) => {
  try {
    // Estadísticas de usuarios
    const usuariosQuery = "SELECT COUNT(*) as total_usuarios FROM usuarios"
    const usuariosResult = await appDB.query(usuariosQuery)

    // Estadísticas de mensajes
    const mensajesQuery = `
      SELECT 
        COUNT(*) as total_mensajes,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as mensajes_pendientes
      FROM mensajes
    `
    const mensajesResult = await appDB.query(mensajesQuery)

    // Estadísticas de builds
    const buildsQuery = "SELECT COUNT(*) as total_builds FROM build_skates"
    const buildsResult = await appDB.query(buildsQuery)

    // Estadísticas de reseñas
    const resenasQuery = "SELECT COUNT(*) as total_resenas FROM resenas"
    const resenasResult = await temaDB.query(resenasQuery)

    // Estadísticas de eventos
    const eventosQuery = "SELECT COUNT(*) as total_eventos FROM eventos"
    const eventosResult = await temaDB.query(eventosQuery)

    const stats = {
      usuarios: Number.parseInt(usuariosResult.rows[0].total_usuarios),
      mensajes: {
        total: Number.parseInt(mensajesResult.rows[0].total_mensajes),
        pendientes: Number.parseInt(mensajesResult.rows[0].mensajes_pendientes),
      },
      builds: Number.parseInt(buildsResult.rows[0].total_builds),
      resenas: Number.parseInt(resenasResult.rows[0].total_resenas),
      eventos: Number.parseInt(eventosResult.rows[0].total_eventos),
    }

    // Registrar acción de administrador
    const adminName = req.headers["admin-name"] || "Admin"
    await logAdminAction(appDB, adminName, "consulta_estadisticas", {})

    return successResponse(res, stats, "Estadísticas obtenidas exitosamente")
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return errorResponse(res, "Error al obtener estadísticas", 500, error)
  }
}

// Obtener log de acciones de administrador
export const getAdminLog = async (req, res) => {
  const { limit = 50 } = req.query

  try {
    const query = `
      SELECT id, admin_nombre, tipo_accion, detalles, fecha_accion
      FROM acciones_admin
      ORDER BY fecha_accion DESC
      LIMIT $1
    `

    const result = await appDB.query(query, [limit])

    return successResponse(res, result.rows, "Log de administrador obtenido exitosamente")
  } catch (error) {
    console.error("Error al obtener log de administrador:", error)
    return errorResponse(res, "Error al obtener log de administrador", 500, error)
  }
}
