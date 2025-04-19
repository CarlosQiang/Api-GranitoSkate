import pkg from "pg"
const { Pool } = pkg
import dotenv from "dotenv"

dotenv.config()

// Conexión a la base de datos del tema (pública)
export const temaDB = new Pool({
  connectionString: process.env.TEMA_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Conexión a la base de datos de la app (usuarios)
export const appDB = new Pool({
  connectionString: process.env.APP_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Función para probar las conexiones
export const testDatabaseConnections = async () => {
  try {
    const temaClient = await temaDB.connect()
    console.log("Conexión a base de datos TEMA establecida")
    temaClient.release()

    const appClient = await appDB.connect()
    console.log("Conexión a base de datos APP establecida")
    appClient.release()

    return true
  } catch (error) {
    console.error("Error al conectar a las bases de datos:", error)
    return false
  }
}
