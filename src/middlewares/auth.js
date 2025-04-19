import dotenv from "dotenv"

dotenv.config()

// Middleware para verificar si la petición viene del administrador
export const checkAdmin = (req, res, next) => {
  const apiKey = req.headers["x-api-key"]

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: "No autorizado. Se requiere clave de API válida.",
    })
  }

  next()
}

// Middleware para validar que el usuario existe
export const validateUser = async (req, res, next) => {
  const userId = req.params.id || req.body.usuario_id

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Se requiere ID de usuario",
    })
  }

  // La validación real se hará en los controladores
  next()
}
