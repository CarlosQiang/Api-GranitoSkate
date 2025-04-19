// Función para manejar respuestas exitosas
export const successResponse = (res, data, message = "Operación exitosa", statusCode = 200) => {
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

  if (error && process.env.NODE_ENV === "development") {
    response.error = error.toString()
  }

  return res.status(statusCode).json(response)
}
