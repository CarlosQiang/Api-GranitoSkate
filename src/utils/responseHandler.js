// Funciones para manejar respuestas de la API de manera consistente

// Respuesta exitosa
export const successResponse = (res, data = null, message = "Operación exitosa", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

// Respuesta de error
export const errorResponse = (res, message = "Error en la operación", statusCode = 400, error = null) => {
  const response = {
    success: false,
    message,
  }

  // Solo incluir detalles del error en desarrollo
  if (process.env.NODE_ENV === "development" && error) {
    response.error = error.message || error
  }

  return res.status(statusCode).json(response)
}

// Respuesta para recursos no encontrados
export const notFoundResponse = (res, message = "Recurso no encontrado") => {
  return errorResponse(res, message, 404)
}

// Respuesta para errores de validación
export const validationErrorResponse = (res, errors) => {
  return errorResponse(res, "Error de validación", 422, errors)
}

// Respuesta para errores de autenticación
export const unauthorizedResponse = (res, message = "No autorizado") => {
  return errorResponse(res, message, 401)
}

// Respuesta para errores de permisos
export const forbiddenResponse = (res, message = "Acceso denegado") => {
  return errorResponse(res, message, 403)
}
