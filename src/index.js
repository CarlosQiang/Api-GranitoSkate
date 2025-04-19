import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import { rateLimit } from "express-rate-limit"
import cookieParser from "cookie-parser"
import serveStatic from "serve-static"
import path from "path"
import { fileURLToPath } from "url"

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
import authRoutes from "./routes/auth.js"
import shopifyRoutes from "./routes/shopify.js"
import webhooksRoutes from "./routes/webhooks.js"

// Importar configuración de base de datos
import { testDatabaseConnections } from "./config/db.js"
import { testShopifyConnection } from "./utils/shopify-helper.js"

// Configuración
dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuración de CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    /\.myshopify\.com$/, // Permitir cualquier tienda de Shopify
    process.env.SHOPIFY_SHOP_NAME,
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key", "X-Shopify-Hmac-Sha256"],
}

// Middlewares
app.use(helmet()) // Seguridad
app.use(cors(corsOptions)) // Permitir CORS

// IMPORTANTE: No usar express.json() para rutas de webhooks
// porque necesitamos el cuerpo sin procesar para validar HMAC
// En su lugar, lo aplicamos a todas las rutas excepto /api/webhooks
app.use((req, res, next) => {
  if (req.path.startsWith("/api/webhooks")) {
    // No procesar el cuerpo para webhooks
    next()
  } else {
    // Procesar el cuerpo como JSON para otras rutas
    express.json()(req, res, next)
  }
})

app.use(cookieParser()) // Parsear cookies

// Rate limiting para prevenir abusos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Servir archivos estáticos del panel de administración
app.use("/admin", serveStatic(path.join(__dirname, "../admin")))

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/usuarios", usuariosRoutes)
app.use("/api/favoritos", favoritosRoutes)
app.use("/api/builds", buildsRoutes)
app.use("/api/mensajes", mensajesRoutes)
app.use("/api/encuestas", encuestasRoutes)
app.use("/api/visitas", visitasRoutes)
app.use("/api/eventos", eventosRoutes)
app.use("/api/resenas", resenasRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/shopify", shopifyRoutes)
app.use("/api/webhooks", webhooksRoutes)

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API de Tienda Skate funcionando correctamente" })
})

// Ruta para el panel de administración
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../admin/index.html"))
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
const startServer = async () => {
  try {
    // Probar conexiones a bases de datos
    const dbConnected = await testDatabaseConnections()
    if (!dbConnected) {
      console.error("Error: No se pudo conectar a las bases de datos")
      process.exit(1)
    }

    // Probar conexión a Shopify (si está configurado)
    if (process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_PASSWORD) {
      const shopifyConnected = await testShopifyConnection()
      if (shopifyConnected) {
        console.log("Conexión a Shopify establecida")
      } else {
        console.warn("Advertencia: No se pudo conectar a Shopify")
      }
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`)
      console.log(`Panel de administración: http://localhost:${PORT}/admin`)
      console.log(`URL para webhooks: http://localhost:${PORT}/api/webhooks/[evento]`)
    })
  } catch (error) {
    console.error("Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

startServer()

export default app
