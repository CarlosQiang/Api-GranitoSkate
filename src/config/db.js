import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

// Crear pools de conexión para ambas bases de datos
const temaDB = new pg.Pool({
  connectionString: process.env.TEMA_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

const appDB = new pg.Pool({
  connectionString: process.env.APP_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Función para probar las conexiones a las bases de datos
export const testDatabaseConnections = async () => {
  try {
    // Probar conexión a la base de datos del tema
    const temaClient = await temaDB.connect()
    console.log("Conexión a la base de datos del tema establecida")
    temaClient.release()

    // Probar conexión a la base de datos de la aplicación
    const appClient = await appDB.connect()
    console.log("Conexión a la base de datos de la aplicación establecida")
    appClient.release()

    return true
  } catch (error) {
    console.error("Error al conectar con las bases de datos:", error)
    return false
  }
}

// Exportar las conexiones
export { temaDB, appDB }
