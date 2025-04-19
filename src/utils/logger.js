// Función para registrar acciones de administrador en la base de datos

// Registrar acción de administrador
export const logAdminAction = async (db, adminNombre, tipoAccion, detalles = {}) => {
  try {
    const query = `
      INSERT INTO acciones_admin (admin_nombre, tipo_accion, detalles)
      VALUES ($1, $2, $3)
      RETURNING id
    `

    const values = [adminNombre, tipoAccion, detalles]

    const result = await db.query(query, values)
    return result.rows[0].id
  } catch (error) {
    console.error("Error al registrar acción de administrador:", error)
    // No lanzamos el error para evitar interrumpir el flujo principal
    return null
  }
}

// Obtener log de acciones de administrador
export const getAdminActionLog = async (db, limit = 100, offset = 0) => {
  try {
    const query = `
      SELECT id, admin_nombre, tipo_accion, detalles, fecha_accion
      FROM acciones_admin
      ORDER BY fecha_accion DESC
      LIMIT $1 OFFSET $2
    `

    const result = await db.query(query, [limit, offset])
    return result.rows
  } catch (error) {
    console.error("Error al obtener log de acciones:", error)
    throw error
  }
}

// Obtener log de acciones por administrador
export const getAdminActionLogByAdmin = async (db, adminNombre, limit = 100, offset = 0) => {
  try {
    const query = `
      SELECT id, admin_nombre, tipo_accion, detalles, fecha_accion
      FROM acciones_admin
      WHERE admin_nombre = $1
      ORDER BY fecha_accion DESC
      LIMIT $2 OFFSET $3
    `

    const result = await db.query(query, [adminNombre, limit, offset])
    return result.rows
  } catch (error) {
    console.error("Error al obtener log de acciones por administrador:", error)
    throw error
  }
}

// Obtener log de acciones por tipo
export const getAdminActionLogByType = async (db, tipoAccion, limit = 100, offset = 0) => {
  try {
    const query = `
      SELECT id, admin_nombre, tipo_accion, detalles, fecha_accion
      FROM acciones_admin
      WHERE tipo_accion = $1
      ORDER BY fecha_accion DESC
      LIMIT $2 OFFSET $3
    `

    const result = await db.query(query, [tipoAccion, limit, offset])
    return result.rows
  } catch (error) {
    console.error("Error al obtener log de acciones por tipo:", error)
    throw error
  }
}
