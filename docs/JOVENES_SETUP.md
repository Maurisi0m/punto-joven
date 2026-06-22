# Sistema de Jovenes Beneficiarios - Guia de Configuracion y Prueba

## Estado Actual

- Base de Datos JOVENES: Creada
- Tablas: 4 tablas principales creadas
- API Router: `/api/joven` configurada
- Formulario Frontend: 4 pasos implementado
- Login Jovenes: Pagina dedicada `/login-joven`

---

## Pasos para Probar

### 1. Verificar Variables de Env
Se debe asegurar la configuracion de estas variables en el archivo .env o en las variables de entorno del sistema:

```env
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_USER=usuario_sql
SQLSERVER_PASSWORD=contraseña_sql
SQLSERVER_DB=Compajefra
SQLSERVER_INSTANCE=SQLEXPRESS
```

Nota: La base de datos JOVENES se conecta automaticamente con las credenciales indicadas.

### 2. Reiniciar el Servidor de Desarrollo
```bash
pnpm dev
```

El servidor debe:
- Conectarse a la BD JOVENES.
- Crear y verificar las tablas.
- Inicializar sin errores.

### 3. Acceder a la Pagina de Registro
Navegar a: `http://localhost:8080/registro`

Se presentaran:
- 3 opciones: "Soy joven beneficiario", "Soy comercio o negocio", "Necesito ayuda".
- Hacer clic en "Soy joven beneficiario".

### 4. Completar el Formulario de Joven
El formulario cuenta con 4 pasos:

#### Paso 1: Informacion Personal
- Nombre: Ejemplo "Juan"
- Apellido Paterno: Ejemplo "Lopez"
- Apellido Materno: Ejemplo "Garcia"
- Fecha de nacimiento: Entre 14 y 18 anos.

#### Paso 2: Identificacion
- CURP: 18 caracteres validos (Ejemplo `LOPG000101HDFRML00`).
- Nivel de estudios: Seleccionar (secundaria/bachillerato/universidad).
- Telefono: 10 digitos.

#### Paso 3: Domicilio
- Calle y numero: Ejemplo "Avenida Benito Juarez 100".
- Colonia o Departamento: (opcional).
- Ciudad: Ejemplo "Pachuca de Soto".
- Municipio: Ejemplo "Pachuca".
- Estado: Ejemplo "Hidalgo".

#### Paso 4: Acceso a Cuenta
- Correo: Email valido.
- Contrasena: Minimo 8 caracteres.
- Aceptar terminos: Marcar la casilla correspondiente.

Hacer clic en "Finalizar Registro".

### 5. Verificar que se guardo en la Base de Datos
Opcion A - SQL Server:
```sql
USE [JOVENES];
SELECT * FROM young_beneficiaries;
```

Opcion B - Desde el panel administrativo.

---

## Probar Login de Jovenes

1. Navegar a: `http://localhost:8080/login-joven`.
2. Ingresar el email y la contrasena que se utilizo en el registro.
3. Se mostrara el estado actual: "En Revision" (inicial), "Aprobado" o "Rechazado".

---

## Datos de Prueba (CURP Validos)

En caso de requerir CURPs validos para pruebas:

| Nombre | CURP | Edad |
|--------|------|------|
| Juan Lopez Garcia | LOPG010101HDFRML00 | 14 |
| Maria Garcia Sanchez | GASM000101MDFRLR00 | 18 |
| Carlos Rodriguez Perez | ROPC000101HDFRRD00 | 16 |

---

## Endpoints API Disponibles

### Registro de Jovenes
```bash
POST http://localhost:8080/api/joven/register
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido_paterno": "Lopez",
  "apellido_materno": "Garcia",
  "curp": "LOPG010101HDFRML00",
  "fecha_nacimiento": "2010-01-01",
  "estudio": "secundaria",
  "phone": "7712345678",
  "email": "juan@ejemplo.com",
  "password": "Contraseña123",
  "calle": "Avenida Benito Juarez 100",
  "colonia_depa": "Centro",
  "ciudad": "Pachuca de Soto",
  "municipio": "Pachuca",
  "estado": "Hidalgo"
}
```

Respuesta exitosa (201):
```json
{
  "beneficiaryId": 1,
  "status": "pending",
  "message": "Registro exitoso. La solicitud esta en revision..."
}
```

### Login de Jovenes
```bash
POST http://localhost:8080/api/joven/login
Content-Type: application/json

{
  "email": "juan@ejemplo.com",
  "password": "Contraseña123"
}
```

Respuesta exitosa (200):
```json
{
  "beneficiaryId": 1,
  "nombre": "Juan Lopez Garcia",
  "curp": "LOPG010101HDFRML00",
  "status": "pending",
  "statusComment": null,
  "approvedAt": null
}
```

---

## Resolucion de Problemas

### Error: "Database JOVENES does not exist"
- Verificar que se haya ejecutado el script `server/sql/create-jovenes-db.sql`.
- Reiniciar SQL Server.
- Intentar nuevamente.

### Error: "Email ya esta registrado"
- El email ya existe en la base de datos.
- Utilizar otro email para las pruebas.

### Error: "CURP invalida"
- CURP debe tener exactamente 18 caracteres.
- Formato: 4 letras + 6 numeros + 1 letra (H/M) + 5 letras + 1 caracter + 1 numero.
- Ejemplo valido: `LOPG010101HDFRML00`

### Error: "Debes tener entre 14 y 18 años"
- Verificar la fecha de nacimiento.
- Comprobar el calculo de la edad.

---

## Estructura de Base de Datos

```
BASE DE DATOS: JOVENES
│
├── young_beneficiaries (Principal)
│   ├── beneficiary_id (PK)
│   ├── email (UNIQUE)
│   ├── password_hash
│   ├── nombre, apellido_paterno, apellido_materno
│   ├── curp (UNIQUE)
│   ├── fecha_nacimiento, edad
│   ├── estudio (secundaria/bachillerato/universidad)
│   ├── phone, calle, colonia_depa, ciudad, municipio, estado
│   ├── status (pending/approved/rejected)
│   ├── created_at, approved_at, updated_at
│   └── (indices: email, curp, status, ciudad, edad)
│
├── beneficiary_status_history
│   ├── history_id (PK)
│   ├── beneficiary_id (FK)
│   ├── old_status, new_status
│   ├── comment, changed_at
│
├── young_beneficiaries_documents
│   ├── document_id (PK)
│   ├── beneficiary_id (FK)
│   ├── document_type, document_url
│   └── uploaded_at
│
└── young_beneficiaries_audit_log
    ├── log_id (PK)
    ├── beneficiary_id (FK)
    ├── action, details, admin_email
    └── action_at
```

---

## Estado de la Implementacion

- Registro de jovenes (formulario 4 pasos): Listo
- Login de jovenes: Listo
- Validacion de datos: Listo
- Almacenamiento en BD JOVENES: Listo
- Sistema de estatus (pending/approved/rejected): Listo
- Auditoria y historial: Listo

---

## Prximos Pasos (Opcionales)

En caso de requerir la completitud del sistema:

1. Panel Admin para Jovenes - Pagina para aprobar y rechazar solicitudes.
2. Generacion de QR y Credencial - Para jovenes aprobados.
3. Notificaciones por Email - Confirmacion de registro y aprobacion.
4. Dashboard de Jovenes - Visualizacion de beneficios disponibles.
5. Integracion con Negocios - Validar credenciales de jovenes en comercios.
