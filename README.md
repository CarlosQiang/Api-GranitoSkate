# API para Tienda de Skateboarding

API REST desarrollada con Node.js y Express para una tienda online de skateboarding integrada con Shopify.

## Estructura del Proyecto

\`\`\`
/
├── src/
│   ├── config/         # Configuraciones (base de datos, variables de entorno)
│   ├── controllers/    # Lógica de negocio
│   ├── db/             # Conexiones a las bases de datos
│   ├── middlewares/    # Middleware para autenticación, validación, etc.
│   ├── routes/         # Rutas de la API organizadas por recurso
│   ├── utils/          # Funciones de utilidad
│   └── index.js        # Punto de entrada de la aplicación
├── .env                # Variables de entorno (no incluido en el repositorio)
├── .env.example        # Ejemplo de variables de entorno
├── vercel.json         # Configuración para despliegue en Vercel
└── package.json        # Dependencias y scripts
\`\`\`

## Requisitos

- Node.js 14.x o superior
- PostgreSQL (local para desarrollo o Neon.tech para producción)
- Cuenta en Vercel para despliegue

## Instalación

1. Clona este repositorio:
   \`\`\`bash
   git clone https://github.com/tu-usuario/tienda-skate-api.git
   cd tienda-skate-api
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

## Bases de Datos

El proyecto utiliza dos bases de datos PostgreSQL:

1. **tienda_skate_tema**: Contiene datos públicos del tema (eventos, reseñas, etc.)
2. **tienda_skate_app**: Contiene datos de interacción de usuarios (favoritos, builds, etc.)

## Endpoints de la API

### Usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario

### Favoritos
- `GET /api/favoritos/:usuario_id` - Obtener favoritos de un usuario
- `POST /api/favoritos` - Agregar favorito
- `DELETE /api/favoritos/:id` - Eliminar favorito

### Builds de Skate
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

## Seguridad

Las rutas de administrador están protegidas mediante un token de API que debe enviarse en el encabezado `x-api-key`.

## Despliegue

Para desplegar en Vercel:

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
