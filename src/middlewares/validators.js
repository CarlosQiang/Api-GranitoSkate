import { errorResponse } from "../utils/responseHandler.js"

// Middleware para validar campos requeridos
export const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === "") {
        return errorResponse(res, `El campo '${field}' es requerido`, 400)
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
      return errorResponse(res, `El campo '${field}' debe ser un número entre 1 y 5`, 400)
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
      return errorResponse(res, "Formato de fecha inválido", 400)
    }

    if (startDate > endDate) {
      return errorResponse(res, "La fecha de inicio debe ser anterior a la fecha de fin", 400)
    }

    next()
  }
}

// Middleware para validar email
export const validateEmail = (field) => {
  return (req, res, next) => {
    const email = req.body[field]
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      return errorResponse(res, `El campo '${field}' debe ser un email válido`, 400)
    }

    next()
  }
}

// Middleware para validar longitud de contraseña
export const validatePasswordLength = (field, minLength = 6) => {
  return (req, res, next) => {
    const password = req.body[field]

    if (password.length < minLength) {
      return errorResponse(res, `El campo '${field}' debe tener al menos ${minLength} caracteres`, 400)
    }

    next()
  }
}
