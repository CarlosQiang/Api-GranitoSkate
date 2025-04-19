import { testDatabaseConnections } from "./config/db.js"

// Probar conexiones a bases de datos
testDatabaseConnections()
  .then(success => {
    if (success) {
      console.log("✅ Conexiones a bases de datos establecidas correctamente")
    } else {
      console.error("❌ Error al conectar a las bases de datos")
    }
  })
import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import { rateLimit } from "express-rate-limit"

// Importar rutas
import usuariosRoutes from "./routes/usuarios.js"
import favoritosRoutes from "./routes/favoritos.js"
import buildsRoutes from "./routes/builds.js"
import mensajesRoutes from "./routes/mensajes.js"
import encuestasRoutes from "./routes/encuestas.js"
import visitasRoutes from "./routes/visitas.js"
import eventosRoutes from "./routes/eventos.js"
import resenasRoutes from "./routes/resenas.js"
import adminRoutes from "./routes/admin.js"

// Configuración
dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(helmet()) // Seguridad
app.use(cors()) // Permitir CORS
app.use(express.json()) // Parsear JSON

// Rate limiting para prevenir abusos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Rutas
app.use("/api/usuarios", usuariosRoutes)
app.use("/api/favoritos", favoritosRoutes)
app.use("/api/builds", buildsRoutes)
app.use("/api/mensajes", mensajesRoutes)
app.use("/api/encuestas", encuestasRoutes)
app.use("/api/visitas", visitasRoutes)
app.use("/api/eventos", eventosRoutes)
app.use("/api/resenas", resenasRoutes)
app.use("/api/admin", adminRoutes)

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API de Tienda Skate funcionando correctamente" })
})

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})

export default app
