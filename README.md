# GranitoSkate API v6

API REST desarrollada con Node.js y Express para una tienda online de skateboarding integrada con Shopify.

## Características

- Autenticación JWT para el panel de administración
- Integración con Shopify API
- Webhooks para sincronización automática
- Panel de administración
- Base de datos PostgreSQL (Neon.tech)
- Despliegue en Vercel

## Estructura del Proyecto

\`\`\`
/
├── admin/             # Panel de administración
├── src/               # Código fuente de la API
│   ├── config/        # Configuraciones (DB, etc.)
│   ├── controllers/   # Controladores
│   ├── db/            # Esquemas y migraciones
│   ├── middlewares/   # Middlewares
│   ├── routes/        # Rutas
│   ├── utils/         # Utilidades
│   └── index.js       # Punto de entrada
├── .env               # Variables de entorno (no incluido en el repositorio)
├── .env.example       # Ejemplo de variables de entorno
├── package.json       # Dependencias y scripts
└── vercel.json        # Configuración para Vercel
\`\`\`

## Requisitos

- Node.js 14.x o superior
- PostgreSQL (local para desarrollo o Neon.tech para producción)
- Cuenta en Vercel para despliegue
- Cuenta en Shopify Partners

## Instalación

1. Clona este repositorio:
   \`\`\`bash
   git clone https://github.com/tu-usuario/granito-skate-api.git
   cd granito-skate-api
   \`\`\`

2. Instala las dependencias:
   \`\`\`bash
   npm install
   \`\`\`

3. Crea un archivo `.env` basado en `.env.example` y configura tus variables de entorno.

4. Inicia el servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

## Configuración de Bases de Datos

1. Crea dos bases de datos en Neon.tech:
   - `tienda_skate_tema`: Para contenido público (eventos, reseñas, etc.)
   - `tienda_skate_app`: Para datos de usuarios (favoritos, builds, etc.)

2. Ejecuta el script SQL en `src/db/schema.sql` en ambas bases de datos.

## Configuración de Shopify

1. Crea una app privada en Shopify Partners.
2. Configura los webhooks en Shopify:
   - `customers/create`: `https://tu-api.vercel.app/api/webhooks/customers/create`
   - `customers/update`: `https://tu-api.vercel.app/api/webhooks/customers/update`
   - `customers/delete`: `https://tu-api.vercel.app/api/webhooks/customers/delete`
   - `orders/create`: `https://tu-api.vercel.app/api/webhooks/orders/create`
   - `products/update`: `https://tu-api.vercel.app/api/webhooks/products/update`

## Despliegue en Vercel

1. Instala la CLI de Vercel:
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. Despliega el proyecto:
   \`\`\`bash
   vercel
   \`\`\`

3. Para producción:
   \`\`\`bash
   vercel --prod
   \`\`\`

## Acceso al Panel de Administración

- URL: `http://localhost:3000/admin` (desarrollo) o `https://tu-api.vercel.app/admin` (producción)
- Credenciales por defecto:
  - Email: `admin@granitoskate.com`
  - Contraseña: `admin123`

**¡Importante!** Cambia la contraseña por defecto después del primer inicio de sesión.

## Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo administrador
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/change-password` - Cambiar contraseña

### Webhooks
- `POST /api/webhooks/customers/create` - Webhook para creación de cliente
- `POST /api/webhooks/customers/update` - Webhook para actualización de cliente
- `POST /api/webhooks/customers/delete` - Webhook para eliminación de cliente
- `POST /api/webhooks/orders/create` - Webhook para creación de pedido
- `POST /api/webhooks/products/update` - Webhook para actualización de producto

### Usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario

### Favoritos
- `GET /api/favoritos/:usuario_id` - Obtener favoritos de un usuario
- `POST /api/favoritos` - Agregar favorito
- `DELETE /api/favoritos/:id` - Eliminar favorito

### Builds
- `GET /api/builds/:usuario_id` - Obtener builds de un usuario
- `POST /api/builds` - Crear nuevo build
- `DELETE /api/builds/:id` - Eliminar build

### Mensajes
- `POST /api/mensajes` - Crear nuevo mensaje
- `GET /api/mensajes` - Obtener todos los mensajes (admin)
- `PATCH /api/mensajes/:id` - Actualizar estado y respuesta de mensaje (admin)
- `DELETE /api/mensajes/:id` - Eliminar mensaje (admin)

### Encuestas
- `POST /api/encuestas` - Crear nueva encuesta
- `GET /api/encuestas` - Obtener todas las encuestas (admin)
- `DELETE /api/encuestas/:id` - Eliminar encuesta (admin)

### Visitas
- `POST /api/visitas` - Registrar visita a producto
- `GET /api/visitas/:producto_id` - Obtener visitas de un producto (admin)

### Eventos
- `GET /api/eventos` - Obtener todos los eventos
- `POST /api/eventos` - Crear nuevo evento (admin)
- `DELETE /api/eventos/:id` - Eliminar evento (admin)

### Reseñas
- `GET /api/resenas/:producto_id` - Obtener reseñas por producto
- `POST /api/resenas` - Crear nueva reseña
- `PATCH /api/resenas/:id` - Actualizar reseña (admin)
- `DELETE /api/resenas/:id` - Eliminar reseña (admin)

### Admin
- `GET /api/admin/stats` - Obtener estadísticas generales
- `GET /api/admin/log` - Obtener log de acciones de administrador

## Licencia

MIT
\`\`\`

Ahora, vamos a crear un archivo .gitignore básico:
