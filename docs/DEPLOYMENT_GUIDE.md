# Guia de Despliegue y Migracion de Base de Datos: Punto Joven

Esta guia describe como desplegar el proyecto Punto Joven usando el Dockerfile creado, y como migrar la base de datos local (SQL Server) a un entorno de produccion.

---

## 1. Opciones de Despliegue de la Aplicacion

Dado que la aplicacion cuenta con un servidor Express persistente que realiza conexiones a bases de datos y maneja subidas de archivos, la opcion recomendada es un alojamiento basado en contenedores Docker o Node.js persistente.

### Opcion A: Despliegue en Plataformas de Contenedores
Plataformas como Render, Railway o Fly.io leen automaticamente el Dockerfile en el repositorio de GitHub y lo despliegan sin necesidad de configurar servidores de forma manual.
1. Render (Web Service): Conectar el repositorio de GitHub, seleccionar "Web Service", elegir el entorno "Docker" y se desplegara usando el puerto 3000 expuesto en el Dockerfile.
2. Railway: Conectar el repositorio de GitHub, crear un nuevo servicio a partir del repositorio y Railway detectara y compilara el Dockerfile.

### Opcion B: Azure App Service
Dado que el proyecto utiliza tecnologias Microsoft (como Azure SQL Database), se puede desplegar la aplicacion directamente en Azure App Service:
- Se puede crear un recurso de "App Service" seleccionando la opcion de Contenedor Docker y configurar un flujo de despliegue continuo con GitHub Actions.

---

## 2. Opciones para Alojar la Base de Datos en Produccion

La base de datos utilizada es Microsoft SQL Server. Para produccion, se presentan las siguientes alternativas:

1. Azure SQL Database (La mas recomendada e institucional):
   - Crear un recurso de base de datos SQL en Azure.
   - Esto proporcionara un host como elservidor.database.windows.net.
   - Ventaja: Alta disponibilidad, seguridad avanzada y compatibilidad directa.
2. SQL Server en un Contenedor Docker (En una VPS propia):
   - Al contratar una VPS (DigitalOcean, AWS EC2, Azure VM), se puede levantar SQL Server en su propio contenedor Docker junto a la aplicacion mediante docker-compose.
   - Ventaja: Economico (todo corre en el mismo servidor).
3. Servidor de Base de Datos Dedicado (AWS RDS para SQL Server o similar).

---

## 3. Como Migrar la Base de Datos de Entorno Local a Produccion

El backend de la aplicacion tiene una caracteristica: el script server/db-init.ts inicializa automaticamente el esquema (tablas, indices, columnas y alters) al arrancar el servidor.

Si se despliega la base de datos en produccion vacia, la aplicacion creara las tablas automaticamente al conectarse por primera vez.

---

## 4. Variables de Entorno para Produccion

En el servidor de produccion (Render, Railway, Azure), se deben configurar las siguientes Variables de Entorno (sustituyendo el archivo .env local). Esto garantiza que el codigo local siga usando la BD local sin alteraciones.

```env
SQLSERVER_HOST=elservidor-produccion.database.windows.net
SQLSERVER_PORT=1433
SQLSERVER_USER=el_usuario_produccion
SQLSERVER_PASSWORD=la_contraseña_produccion
ADMIN_SECRET=ClaveSuperSeguraParaProduccion2026!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dedbensec@gmail.com
SMTP_PASS=mdjaclrklcawnqdv
SUPPORT_EMAIL=dedbensec@gmail.com
```
