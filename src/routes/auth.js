import express from "express"
import { login, register, verifyToken, refreshToken, changePassword } from "../controllers/auth.controller.js"
import { verifyToken as verifyTokenMiddleware } from "../middlewares/auth.js"
import { validateRequiredFields, validateEmail, validatePasswordLength } from "../middlewares/validators.js"

const router = express.Router()

// POST /api/auth/login - Iniciar sesión
router.post("/login", validateRequiredFields(["email", "password"]), validateEmail("email"), login)

// POST /api/auth/register - Registrar nuevo administrador
router.post(
  "/register",
  validateRequiredFields(["email", "password", "nombre"]),
  validateEmail("email"),
  validatePasswordLength("password", 6),
  register,
)

// GET /api/auth/verify - Verificar token
router.get("/verify", verifyTokenMiddleware, verifyToken)

// POST /api/auth/refresh - Refrescar token
router.post("/refresh", verifyTokenMiddleware, refreshToken)

// POST /api/auth/change-password - Cambiar contraseña
router.post(
  "/change-password",
  verifyTokenMiddleware,
  validateRequiredFields(["currentPassword", "newPassword"]),
  validatePasswordLength("newPassword", 6),
  changePassword,
)

export default router
