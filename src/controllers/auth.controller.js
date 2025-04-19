import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { appDB } from "../config/db.js"
import { successResponse, errorResponse } from "../utils/responseHandler.js"
import { logAdminAction } from "../utils/logger.js"

// Iniciar sesión
export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    // Buscar administrador por email
    const query = "SELECT id, email, password, nombre, role FROM admins WHERE email = $1"
    const result = await appDB.query(query, [email])

    if (result.rows.length === 0) {
      return errorResponse(res, "Credenciales inválidas", 401)
    }

    const admin = result.rows[0]

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return errorResponse(res, "Credenciales inválidas", 401)
    }

    // Generar token JWT
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    // Actualizar último login
    await appDB.query("UPDATE admins SET ultimo_login = NOW() WHERE id = $1", [admin.id])

    // Registrar acción
    await logAdminAction(appDB, admin.nombre, "login", { email: admin.email })

    // Respuesta exitosa
    return successResponse(
      res,
      {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.nombre,
          role: admin.role,
        },
      },
      "Inicio de sesión exitoso",
    )
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return errorResponse(res, "Error al iniciar sesión", 500, error)
  }
}

// Registrar nuevo administrador
export const register = async (req, res) => {
  const { email, password, nombre, role = "admin" } = req.body

  try {
    // Verificar si el email ya está registrado
    const checkQuery = "SELECT id FROM admins WHERE email = $1"
    const checkResult = await appDB.query(checkQuery, [email])

    if (checkResult.rows.length > 0) {
      return errorResponse(res, "El email ya está registrado", 400)
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Crear nuevo administrador
    const query = `
      INSERT INTO admins (email, password, nombre, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, nombre, role
    `

    const values = [email, hashedPassword, nombre, role]
    const result = await appDB.query(query, values)

    // Registrar acción
    await logAdminAction(appDB, "Sistema", "registro_admin", {
      email,
      nombre,
      role,
    })

    // Respuesta exitosa
    return successResponse(
      res,
      {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].nombre,
        role: result.rows[0].role,
      },
      "Administrador registrado exitosamente",
      201,
    )
  } catch (error) {
    console.error("Error al registrar administrador:", error)
    return errorResponse(res, "Error al registrar administrador", 500, error)
  }
}

// Verificar token
export const verifyToken = async (req, res) => {
  try {
    // El middleware verifyToken ya verificó el token
    // Solo necesitamos obtener los datos actualizados del usuario
    const query = "SELECT id, email, nombre, role FROM admins WHERE id = $1"
    const result = await appDB.query(query, [req.user.id])

    if (result.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const admin = result.rows[0]

    return successResponse(
      res,
      {
        id: admin.id,
        email: admin.email,
        name: admin.nombre,
        role: admin.role,
      },
      "Token válido",
    )
  } catch (error) {
    console.error("Error al verificar token:", error)
    return errorResponse(res, "Error al verificar token", 500, error)
  }
}

// Refrescar token
export const refreshToken = async (req, res) => {
  try {
    // El middleware verifyToken ya verificó el token
    // Generar nuevo token
    const token = jwt.sign({ id: req.user.id, email: req.user.email, role: req.user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    return successResponse(res, { token }, "Token refrescado exitosamente")
  } catch (error) {
    console.error("Error al refrescar token:", error)
    return errorResponse(res, "Error al refrescar token", 500, error)
  }
}

// Cambiar contraseña
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body

  try {
    // Obtener datos del administrador
    const query = 'SELECT id, password FROM admins WHERE id = $1";assword FROM admins WHERE id = $1'
    const result = await appDB.query(query, [req.user.id])

    if (result.rows.length === 0) {
      return errorResponse(res, "Usuario no encontrado", 404)
    }

    const admin = result.rows[0]

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password)

    if (!isPasswordValid) {
      return errorResponse(res, "Contraseña actual incorrecta", 400)
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Actualizar contraseña
    await appDB.query("UPDATE admins SET password = $1 WHERE id = $2", [hashedPassword, admin.id])

    // Registrar acción
    await logAdminAction(appDB, req.user.email, "cambio_password", {
      admin_id: admin.id,
    })

    return successResponse(res, null, "Contraseña actualizada exitosamente")
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    return errorResponse(res, "Error al cambiar contraseña", 500, error)
  }
}
