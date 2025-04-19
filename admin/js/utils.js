// Funciones de utilidad para el panel de administración

// Formatear fecha
export function formatDate(dateString) {
  if (!dateString) return "-"

  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Truncar texto
export function truncateText(text, maxLength) {
  if (!text) return "-"

  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + "..."
}

// Formatear valoración (estrellas)
export function formatRating(rating) {
  if (!rating) return "-"

  let stars = ""
  for (let i = 0; i < rating; i++) {
    stars += "★"
  }
  for (let i = rating; i < 5; i++) {
    stars += "☆"
  }

  return stars
}

// Validar email
export function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// Validar URL
export function validateUrl(url) {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// Generar ID único
export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// Formatear precio
export function formatPrice(price, currency = "EUR") {
  if (!price) return "-"

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
  }).format(price)
}

// Obtener diferencia de tiempo en formato legible
export function getTimeAgo(dateString) {
  if (!dateString) return "-"

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  if (diffSec < 60) {
    return `Hace ${diffSec} segundos`
  } else if (diffMin < 60) {
    return `Hace ${diffMin} minutos`
  } else if (diffHour < 24) {
    return `Hace ${diffHour} horas`
  } else if (diffDay < 30) {
    return `Hace ${diffDay} días`
  } else {
    return formatDate(dateString)
  }
}
