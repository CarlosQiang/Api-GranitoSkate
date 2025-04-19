// Función simple para registrar acciones de administrador
export const logAdminAction = async (pool, adminName, actionType, details) => {
  try {
    const query = `
      INSERT INTO acciones_admin (admin_nombre, tipo_accion, detalles)
      VALUES ($1, $2, $3)
      RETURNING id
    `

    const values = [adminName, actionType, details]
    const result = await pool.query(query, values)

    return result.rows[0].id
  } catch (error) {
    console.error("Error al registrar acción de administrador:", error)
    return null
  }
}
