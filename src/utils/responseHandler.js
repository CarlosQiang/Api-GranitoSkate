// Función para manejar respuestas exitosas
export const successResponse = (res, data = null, message = "Operación exitosa", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

// Función para manejar errores
export const errorResponse = (res, message = "Error en la operación", statusCode = 400, error = null) => {
  const response = {
    success: false,
    message,
  }

  // Solo incluir detalles del error en desarrollo
  if (error && process.env.NODE_ENV === "development") {
    response.error = error.toString()
  }

  return res.status(statusCode).json(response)
}

// Función para manejar respuestas de recursos no encontrados
export const notFoundResponse = (res, message = "Recurso no encontrado") => {
  return errorResponse(res, message, 404)
}

// Función para manejar respuestas de errores de validación
export const validationErrorResponse = (res, errors) => {
  return errorResponse(res, "Error de validación", 422, errors)
}

// Función para manejar respuestas de errores de autenticación
export const unauthorizedResponse = (res, message = "No autorizado") => {
  return errorResponse(res, message, 401)
}

// Función para manejar respuestas de errores de permisos
export const forbiddenResponse = (res, message = "Acceso denegado") => {
  return errorResponse(res, message, 403)
}
