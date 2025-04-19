-- Base de datos 1: tienda_skate_tema (Contenido del tema)

-- Tabla: reseñas públicas
CREATE TABLE resenas (
  id BIGSERIAL PRIMARY KEY,
  nombre_cliente TEXT,
  id_producto TEXT,
  valoracion INTEGER CHECK (valoracion BETWEEN 1 AND 5),
  comentario TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla: eventos de la tienda
CREATE TABLE eventos (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE
);

-- Tabla: banners (por si haces un slider en el home)
CREATE TABLE banners (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT,
  subtitulo TEXT,
  imagen_url TEXT,
  enlace TEXT,
  orden INTEGER
);

-- Tabla: preguntas frecuentes
CREATE TABLE faq (
  id BIGSERIAL PRIMARY KEY,
  pregunta TEXT,
  respuesta TEXT
);

-- Tabla: bloques de contenido en el home (por ejemplo, combos)
CREATE TABLE home_blocks (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT,
  descripcion TEXT,
  tipo TEXT, -- texto, imagen, video, etc.
  contenido JSONB,
  orden INTEGER
);

-- Base de datos 2: tienda_skate_app (Interacción de usuarios)

-- Tabla: usuarios (identificados por Shopify)
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  shopify_customer_id TEXT UNIQUE,
  email TEXT,
  nombre TEXT,
  fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Tabla: productos guardados como favoritos
CREATE TABLE favoritos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  id_producto TEXT,
  nombre_producto TEXT,
  fecha_agregado TIMESTAMP DEFAULT NOW()
);

-- Tabla: builder de Skate personalizado
CREATE TABLE build_skates (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  nombre_build TEXT,
  tabla_id TEXT,
  ruedas_id TEXT,
  ejes_id TEXT,
  grip_id TEXT,
  otros_componentes JSONB,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla: mensajes enviados por los clientes
CREATE TABLE mensajes (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  asunto TEXT,
  mensaje TEXT,
  estado TEXT DEFAULT 'pendiente', -- pendiente / respondido / cerrado
  respuesta_admin TEXT,
  fecha_envio TIMESTAMP DEFAULT NOW()
);

-- Tabla: encuestas post-compra
CREATE TABLE encuestas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  id_pedido TEXT,
  satisfaccion INTEGER CHECK (satisfaccion BETWEEN 1 AND 5),
  comentario TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Tabla: visitas a productos
CREATE TABLE visitas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT REFERENCES usuarios(id),
  id_producto TEXT,
  fecha_visita TIMESTAMP DEFAULT NOW()
);

-- Tabla: log de acciones de admin (ver mensajes, responder, etc.)
CREATE TABLE acciones_admin (
  id BIGSERIAL PRIMARY KEY,
  admin_nombre TEXT,
  tipo_accion TEXT,
  detalles JSONB,
  fecha_accion TIMESTAMP DEFAULT NOW()
);

-- Tabla: administradores (nueva)
CREATE TABLE admins (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,
  nombre TEXT,
  role TEXT DEFAULT 'admin', -- admin / superadmin
  fecha_registro TIMESTAMP DEFAULT NOW(),
  ultimo_login TIMESTAMP
);

-- Insertar un administrador por defecto (contraseña: admin123)
INSERT INTO admins (email, password, nombre, role)
VALUES ('admin@granitoskate.com', '$2a$10$XFAhzJSJz0TmgVxJqgVkWOW.UEZqRusLGkXBt1Fz.4mBi.MN7jK6W', 'Administrador', 'superadmin');
