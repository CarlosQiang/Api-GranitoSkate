// Middleware para validar campos requeridos
export const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === "") {
        return res.status(400).json({
          success: false,
          message: `El campo '${field}' es requerido`,
        })
      }
    }
    next()
  }
}

// Middleware para validar valoraciones (1-5)
export const validateRating = (field) => {
  return (req, res, next) => {
    const rating = Number.parseInt(req.body[field])
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: `El campo '${field}' debe ser un número entre 1 y 5`,
      })
    }
    next()
  }
}

// Middleware para validar fechas
export const validateDates = (startField, endField) => {
  return (req, res, next) => {
    const startDate = new Date(req.body[startField])
    const endDate = new Date(req.body[endField])

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido",
      })
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "La fecha de inicio debe ser anterior a la fecha de fin",
      })
    }

    next()
  }
}
