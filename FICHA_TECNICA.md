# Ficha Tecnica de la Plataforma Punto Joven (Compajefra)

Este documento detalla las especificaciones tecnicas, infraestructura y caracteristicas del sistema de gestion y registro Punto Joven.

## 1. Stack Tecnologico y Lenguaje

- Lenguaje principal: TypeScript y JavaScript (Node.js).
- Frontend: React 18 con React Router 6 (Single Page Application - SPA).
- Estilos y UI: Tailwind CSS v3, Radix UI y Lucide React.
- Animaciones y UX: Framer Motion, GSAP, Anime.js y Lenis (Desplazamiento suave).
- Elementos 3D: Cobe (Globo terraqueo 3D interactivo en la pagina de inicio).
- Backend: Node.js con Express framework.
- Base de datos: Microsoft SQL Server (mssql de npm), compatible con bases de datos locales y Azure SQL Database.

## 2. Docker y Contenedores

- Estatus: El proyecto cuenta con soporte oficial para Docker.
- Dockerfile: Se incluye un Dockerfile de dos etapas (multi-stage) optimizado para entornos de produccion.
- Configuracion:
  - Etapa 1 (builder): Instala pnpm, copia dependencias, compila los assets del frontend y el codigo del backend en bundles limpios, y poda las dependencias de desarrollo.
  - Etapa 2 (runner): Utiliza una imagen ligera de Node.js (node:22-slim) para correr el bundle generado.

## 3. Puertos Utilizados

- Servidor de Desarrollo Local (Vite + Express):
  - Puerto predeterminado: 8080 (se accede via http://localhost:8080).
  - Comportamiento: Integra el backend y el frontend en el mismo puerto usando el servidor dev de Vite como middleware de Express.
- Servidor de Produccion (Docker / Express compilado):
  - Puerto predeterminado: 3000 (se accede via http://localhost:3000).
  - Comportamiento: Expuesto en el Dockerfile para que la plataforma de hosting pueda mapear el trafico de produccion de manera directa.

## 4. Base de Datos

- Sistema de Base de Datos: Microsoft SQL Server.
- Esquema de Tablas:
  - Base de datos de Comercios (NEGOCIOS/EMPRESAS): Almacena las cuentas de negocios, historial de estatus de aprobacion y logs de auditoria.
  - Base de datos de Beneficiarios (JOVENES/BENEFICIOS): Almacena las cuentas de los jovenes registrados (menores y mayores de edad), identificaciones, fotografias y logs de auditoria.
- Automatizacion: El script de inicializacion (server/db-init.ts) crea y estructura las tablas automaticamente al arrancar la aplicacion si estas no existen todavia.
- La base de datos es LOCAL, por lo tanto, si se desea migrar se debe consultar la documentacion en docs/DEPLOYMENT_GUIDE.md para ver como migrar la base de datos a Azure SQL Database u otro proveedor de bases de datos (AWS, GCP, etc).

## 5. Administracion de la Pagina (Auto-administrable)

- Estatus: Si, la pagina es auto-administrable por completo.
- Modulo de Administracion: Cuenta con una ruta administrativa (/admin) protegida por contrasena basada en la variable de entorno ADMIN_SECRET.
- Funcionalidades del Panel:
  - Visualizacion de estadisticas y metricas agregadas en tiempo real.
  - Tabla de aprobacion de negocios y comercios afiliados.
  - Tabla de aprobacion de jovenes beneficiarios.
  - Modales de decision para aprobar o rechazar registros con comentarios que se guardan en el historial.
  - Sistema automatizado de notificaciones por email que informa a los solicitantes sobre la resolucion de sus tramites.

## 6. Caracteristicas de la Plataforma

- Registro Dinamico de Jovenes: Divide automaticamente el flujo entre menores de edad (capturando datos del tutor y credencial escolar) y mayores de edad (capturando INE y comprobante de domicilio) a partir de la fecha de nacimiento ingresada.
- Camara Integrada: Permite a los beneficiarios tomarse su fotografia selfie de forma directa en el navegador durante el registro.
- Credencial Digital: Genera una tarjeta digital dinamica con el folio del beneficiario y un codigo QR unico que vincula al validador publico.
- Buscador de Afiliados: Catalogo publico interactivo donde los usuarios pueden buscar negocios que ofrecen descuentos y filtrarlos por categoria o zona geografica.
- Validador de Tarjetas: Modulo publico que permite escanear codigos QR o ingresar el folio de forma manual para comprobar la validez de una credencial en tiempo real.
- Sistema de e-mail: se implementa un sistema donde se le notifica al usuario si su cuenta fue aprobada o rechazada. En caso de ser aprobada, se le envía la liga para su credencial digital, una foto de la credencial y el TOKEN para acceder a su tarjeta desde la página.
