# Plataforma Punto Joven 

Plataforma full-stack para la gestion, registro y validacion de jovenes beneficiarios del programa Punto Joven, asi como la afiliacion y administracion de comercios locales. Desarrollada sobre un entorno React + Express integrado con SQL Server.

---

## Tabla de Contenidos
1. Caracteristicas Principales
2. Arquitectura y Tecnologias
3. Requisitos Previos
4. Instalacion y Configuracion Local
5. Variables de Entorno (.env)
6. Instrucciones de Despliegue
7. Uso de Docker
8. Estructura del Proyecto
9. Documentacion Adicional

---

## Caracteristicas Principales

- Registro de Jovenes (12-29 anos):
  - Registro automatizado segun edad: menores (12-17 anos con datos y documentos del tutor) y adultos (18-29 anos).
  - Captura de fotografia selfie en vivo desde la camara web o dispositivo movil.
  - Almacenamiento seguro de documentos digitales (CURP, identificaciones, comprobantes).
- Catalogo de Comercios y Negocios Afiliados:
  - Formulario paso a paso para la afiliacion de negocios.
  - Catalogo interactivo publico de comercios con filtros avanzados por categoria y zona geografica.
- Panel Administrativo Profesional:
  - Dashboard interactivo con estadisticas en tiempo real de los registros.
  - Tablas de gestion con filtros rapidos y busquedas textuales de beneficiarios y comercios.
  - Modales interactivos para el cambio de estatus de las solicitudes (pendiente, aprobado, rechazado) con comentarios de auditoria.
- Notificaciones Automaticas:
  - Envio automatico de notificaciones por correo electronico cuando el administrador aprueba o rechaza una solicitud.
  - Generacion dinamica de un codigo QR unico para los jovenes aprobados que se integra automaticamente en su credencial.
- Validacion de Credenciales Digitales:
  - Modulo publico de escaneo de QR y busqueda manual por folio para la validacion de la vigencia de la credencial por parte de los comercios.

---

## Arquitectura y Tecnologias

La aplicacion esta construida sobre una estructura robusta y moderna full-stack:

- Frontend: React 18, React Router 6 (SPA Mode), TypeScript, Tailwind CSS v3, Radix UI y Lucide React.
- Visuales e Interaccion: Framer Motion, GSAP, Anime.js, Lenis (Smooth Scroll) y Cobe (Globo 3D interactivo en la landing page).
- Backend: Node.js, Express (API REST expuesta bajo el prefijo /api/).
- Base de Datos: SQL Server (mssql). Cuenta con inicializacion automatica de tablas y esquema al arrancar el servidor (server/db-init.ts).
- Servicios: Nodemailer para notificaciones mediante SMTP (Gmail).

---

## Requisitos Previos

Antes de comenzar, se debe asegurar la instalacion en el sistema de:
- Node.js (version 20.x o superior)
- PNPM (gestor de paquetes preferido, instalalo globalmente con npm install -g pnpm)
- SQL Server (Edicion Express local, LocalDB o una instancia en la nube de Azure SQL)

---

## Instalacion y Configuracion Local

Se deben seguir estos pasos para poner en marcha el proyecto en el entorno local:

### 1. Clonar el Repositorio e Instalar Dependencias
Instala los modulos necesarios utilizando pnpm:
```bash
pnpm install
```

### 2. Configurar el Archivo de Entorno
Se debe crear o editar el archivo .env en la raiz del proyecto configurando los accesos de base de datos y llaves secretas. La estructura requerida se detalla en la seccion de Variables de Entorno.

### 3. Iniciar el Servidor de Desarrollo
El proyecto utiliza una integracion de puerto unico (puerto 8080 por defecto) para ejecutar tanto la API en Express como el frontend con Vite y Hot Reload:
```bash
pnpm dev
```
La aplicacion estara disponible en http://localhost:8080.

---

## Variables de Entorno (.env)

Configura el archivo .env en la raiz con las siguientes variables:

```env
PORT=8080
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=PasswordSeguro
ADMIN_SECRET=ClaveSecretaSuperSegura2026!
GMAIL_USER=correo_emisor@gmail.com
GMAIL_APP_PASSWORD=contraseña_de_aplicacion_gmail
SUPPORT_EMAIL=correo_de_soporte@gmail.com
```

---

## Uso de Docker

El proyecto incluye soporte completo para Docker utilizando una compilacion multi-etapa que optimiza el tamaño y rendimiento de la imagen de produccion.

### 1. Construir la Imagen de Docker
Ejecuta el siguiente comando en la raiz del proyecto:
```bash
docker build -t punto-joven .
```

### 2. Ejecutar el Contenedor
Levanta el contenedor pasando las variables de entorno necesarias para la conexion:
```bash
docker run -d \
  -p 3000:3000 \
  -e SQLSERVER_HOST=host.docker.internal \
  -e SQLSERVER_PORT=1433 \
  -e SQLSERVER_USER=sa \
  -e SQLSERVER_PASSWORD=PasswordSQL \
  -e ADMIN_SECRET=AdminSecret \
  -e GMAIL_USER=correo@gmail.com \
  -e GMAIL_APP_PASSWORD=app_password \
  -e SUPPORT_EMAIL=correo@gmail.com \
  --name punto-joven-container \
  punto-joven
```
Nota: host.docker.internal permite que el contenedor Docker se comunique con la instancia de SQL Server que se ejecuta de forma local en el host (Windows).

---

## Estructura del Proyecto

El codigo esta estructurado de forma modular y limpia:

```
├── client/                 # Aplicacion Frontend React SPA
│   ├── components/         # Componentes React de UI (Captura de camara, Credencial Digital, etc.)
│   ├── components/ui/      # Biblioteca de componentes UI preconstruidos (Radix + Tailwind)
│   ├── pages/              # Paginas de las rutas (Inicio, Registro, Afiliados, Login, Admin)
│   └── App.tsx             # Punto de entrada de React y rutas de la SPA
├── server/                 # Servidor Backend Express
│   ├── routes/             # Endpoints y rutas del servidor (admin, business, joven)
│   ├── db.ts               # Conexion y pools de SQL Server
│   ├── db-init.ts          # Script de auto-inicializacion de base de datos
│   └── index.ts            # Configuracion principal y middleware de Express
├── shared/                 # Tipos TypeScript compartidos entre cliente y servidor
├── docs/                   # Documentacion tecnica de soporte
├── sql/                    # Scripts manuales de base de datos
└── Dockerfile              # Dockerfile de produccion
```

---

## Documentacion Adicional

Para configuraciones y especificaciones mas detalladas, revisa los documentos dentro de la carpeta docs/:

- Guia de Administracion (docs/ADMIN_SETUP.md) - Inicializacion del panel de admin y base de datos.
- Notificaciones por Correo (docs/EMAIL_SETUP.md) - Configuracion del servicio SMTP de correo y alternativas.
- Registro de Jovenes (docs/JOVENES_SETUP.md) - Flujo y datos de prueba para beneficiarios.
- Guia de Despliegue y Base de Datos (docs/DEPLOYMENT_GUIDE.md) - Migracion de base de datos SQL local a Azure SQL y despliegue a produccion.
