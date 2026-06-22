# Guia de Setup - Panel de Administracion Compajefra

## Descripcion General

Se ha implementado un panel de administracion completo para gestionar:
- Aprobacion de Negocios (negocios que se registran en el programa)
- Aprobacion de Jovenes Beneficiarios (cuando su formulario este listo)
- Dashboard estadistico con metricas en tiempo real

---

## Pasos de Implementacion

### 1. Ejecutar Script SQL

Primero, se debe ejecutar el script SQL que preparara la base de datos.

**Ubicacion:** `sql/setup-admin.sql`

**Pasos:**
1. Abrir SQL Server Management Studio (SSMS) o el cliente SQL preferido.
2. Conectarse a la instancia de SQL Server Express (localhost, usuario: sa, contrasena: Pollito92.).
3. Seleccionar la BD: NEGOCIOS.
4. Abrir el archivo `sql/setup-admin.sql`.
5. Ejecutar el script completo (F5 o boton "Execute").

**Lo que hace el script:**
```
- Crea tabla: admin_users (usuarios administradores)
- Crea tabla: young_beneficiaries (jovenes beneficiarios)
- Crea tabla: beneficiary_status_history (auditoria de cambios)
- Crea tabla: admin_audit_log (registro de acciones admin)
- Crea indices para optimizar busquedas
- Agrega usuario admin inicial:
  - Email: admin@compajefra.mx
  - Contrasena temporal: AdminCompajefra2025!
```

**IMPORTANTE:** Se debe cambiar la contrasena temporal en la primera sesion.

---

### 2. Configurar ADMIN_SECRET en .env

Se debe abrir el archivo `.env` y configurar la clave de administrador:

```env
ADMIN_SECRET=clave-segura-aqui
```

**Recomendaciones:**
- Usar una contrasena fuerte (minimo 16 caracteres).
- Incluir mayusculas, minusculas, numeros y caracteres especiales.
- Ejemplo: `CompajefraAdmin2025!@#SecureKey`

---

### 3. Acceder al Panel

#### Ruta de Login:
```
http://localhost:3000/admin/login
```

#### Ruta del Dashboard:
```
http://localhost:3000/admin
```

#### Para acceder:
1. Ir a `/admin/login`.
2. Ingresar el valor de `ADMIN_SECRET` configurado en el archivo `.env`.
3. Se realizara la redireccion automatica al dashboard.

---

## Funcionalidades del Panel

### 1. Resumen de Estadisticas
- Total de negocios registrados.
- Negocios pendientes, aprobados y rechazados.
- Total de jovenes beneficiarios.
- Jovenes pendientes, aprobados y rechazados.

### 2. Gestion de Negocios
- Listar: Todos los negocios con filtros por estado.
- Buscar: Por nombre, dueno o email.
- Ver detalles: Logo, foto del establecimiento y datos completos.
- Cambiar estado: Aprobar, rechazar o poner pendiente.
- Agregar comentario: Explicacion del motivo de rechazo o aprobacion.

### 3. Gestion de Jovenes Beneficiarios
- Listar: Todos los jovenes beneficiarios.
- Buscar: Por nombre, CURP o email.
- Ver detalles: Foto, datos personales y folio.
- Cambiar estado: Aprobar o rechazar solicitudes.
- Auditoria: Historial de cambios.

### 4. Panel Activo
- Muestra datos de la BD en tiempo real.
- Actualizaciones instantaneas.
- Notificaciones de cambios.

---

## Flujo de Aprobacion

### Negocio:
```
1. Negocio se registra -> Estado: "pending"
2. El administrador revisa datos y documentos
3. El administrador aprueba -> Estado: "approved" (se guarda fecha de aprobacion)
4. Negocio recibe confirmacion y puede empezar a ofrecer beneficios

O

3. El administrador rechaza -> Estado: "rejected" (con comentario de motivo)
4. Negocio recibe notificacion de rechazo
```

### Joven Beneficiario:
```
1. Joven se registra -> Estado: "pending"
2. El administrador revisa datos y documentos
3. El administrador aprueba -> Se activa la credencial digital
4. Joven puede usar los beneficios en comercios

O

3. El administrador rechaza -> Joven recibe notificacion (necesita reenviar info)
```

---

## Estructura de Archivos Agregados

```
server/
├── routes/
│   └── admin.ts                    # Rutas de API para admin
│
client/
├── pages/
│   ├── AdminDashboard.tsx          # Pagina principal del dashboard
│   └── AdminLogin.tsx              # Pagina de login
│
├── components/admin/
│   ├── AdminStats.tsx              # Cards de estadisticas
│   ├── AdminBusinessTable.tsx       # Tabla de negocios
│   ├── AdminBeneficiariesTable.tsx # Tabla de jovenes
│   └── AdminStatusModal.tsx        # Modal para cambiar estado
│
sql/
└── setup-admin.sql                 # Script de inicializacion de BD
│
shared/
└── api.ts                          # Tipos compartidos
```

---

## Endpoints de API

### Dashboard
```
GET /api/admin/dashboard
Headers: x-admin-secret: <ADMIN_SECRET>
Response: AdminDashboardStats (estadisticas generales)
```

### Negocios
```
GET /api/admin/businesses?status=pending&search=&limit=50&offset=0
Headers: x-admin-secret: <ADMIN_SECRET>
Response: { items: BusinessAccount[], total: number }

POST /api/admin/businesses/:businessId/status
Headers: x-admin-secret: <ADMIN_SECRET>
Body: { status: "approved" | "pending" | "rejected", comment?: string }
```

### Jovenes Beneficiarios
```
GET /api/admin/beneficiaries?status=pending&search=&limit=50&offset=0
Headers: x-admin-secret: <ADMIN_SECRET>
Response: { items: YoungBeneficiary[], total: number }

POST /api/admin/beneficiaries/:beneficiaryId/status
Headers: x-admin-secret: <ADMIN_SECRET>
Body: { status: "approved" | "pending" | "rejected", comment?: string }
```

---

## Interfaz de Usuario

### Diseno
- Tema: Utiliza los colores de marca (primario: #88163e, secundario: #bc955b)
- Animaciones: Transiciones suaves con Framer Motion
- Componentes: Radix UI + Tailwind CSS
- Responsivo: Funciona en desktop, tablet y movil

### Paleta de Colores de Estados
- Pendiente: Amarillo
- Aprobado: Verde
- Rechazado: Rojo

---

## Seguridad

### Medidas Implementadas
1. ADMIN_SECRET: Validacion en cada request.
2. Headers: Uso de `x-admin-secret` en lugar de token en la URL.
3. Almacenamiento local: La clave se guarda en localStorage del navegador.
4. Auditoria: Todos los cambios se registran en `admin_audit_log`.

### Recomendaciones
- No compartir la clave `ADMIN_SECRET` por canales inseguros.
- Cambiar la clave regularmente.
- Implementar login con usuario/contrasena en produccion.
- Usar HTTPS en produccion.

---

## Notas Importantes

### Contrasena Inicial de Admin
```
Email: admin@compajefra.mx
Contrasena temporal: AdminCompajefra2025!
```

Se recomienda cambiar la contrasena temporal en la primera sesion.

### Para Produccion
Antes de realizar el lanzamiento a produccion:
1. Implementar hash de contrasenas (bcrypt).
2. Agregar login con usuario/contrasena.
3. Usar JWT para sesiones.
4. Implementar 2FA.
5. Auditoria mejorada.
6. Rate limiting.
7. HTTPS obligatorio.

---

## Proximos Pasos

### Formulario de Jovenes Beneficiarios
Aun necesita ser implementado:
- Crear pagina de registro `/registro-beneficiarios`
- Validar CURP
- Captura de foto
- Validacion de edad (15-29 anos)
- Generacion automatica de folio (BJ-2025-XXXXX)
- Integracion con endpoint de registro

### Mejoras de Admin
- Exportar reportes (Excel, PDF)
- Graficas de tendencias
- Mensajes automaticos a negocios/jovenes
- Multi-admin con roles
- Validacion de documentos (OCR)

---

## Soporte

Si se presentan problemas:
1. Verificar que el script SQL se haya ejecutado correctamente.
2. Revisar que ADMIN_SECRET este configurado en el archivo .env.
3. Comprobar que el servidor este en ejecucion (npm run dev).
4. Revisar la consola del navegador (F12) en busca de errores.

---

## Checklist de Implementacion

- Ejecutar script SQL (`sql/setup-admin.sql`)
- Configurar ADMIN_SECRET en `.env`
- Iniciar servidor (`npm run dev`)
- Acceder a `/admin/login`
- Ingresar ADMIN_SECRET
- Verificar que el dashboard carga correctamente
- Revisar tabla de negocios
- Probar cambio de estado de un negocio
- Verificar que se guarden los comentarios
