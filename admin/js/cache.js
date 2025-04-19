// Funciones para manejar caché en el panel de administración

// Obtener datos en caché
export async function getCachedData(cacheKey, fetchFunction, expirationMinutes = 5) {
  try {
    const cachedData = localStorage.getItem(cacheKey)

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData)
      const now = new Date().getTime()
      const expirationTime = expirationMinutes * 60 * 1000

      // Verificar si los datos no han expirado
      if (now - timestamp < expirationTime) {
        return data
      }
    }

    // Si no hay datos en caché o han expirado, obtener nuevos datos
    const response = await fetchFunction()

    if (response.success) {
      // Guardar en caché
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: response.data,
          timestamp: new Date().getTime(),
        }),
      )

      return response.data
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error(`Error al obtener datos para ${cacheKey}:`, error)
    throw error
  }
}

// Limpiar caché
export function clearCache() {
  // Eliminar todos los elementos de caché
  const cacheKeys = [
    "stats_cache",
    "mensajes_cache",
    "eventos_cache",
    "usuarios_cache",
    "favoritos_cache",
    "builds_cache",
    "encuestas_cache",
    "resenas_cache",
  ]

  cacheKeys.forEach((key) => localStorage.removeItem(key))
}
