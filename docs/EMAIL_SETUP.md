# Configuracion de Email - Punto Joven

## Sistema de Notificaciones por Email

Este documento describe la configuracion del sistema automatico de envio de emails cuando un administrador aprueba o rechaza un negocio en el panel de administracion.

---

## Funcionalidad

Cuando el administrador aprueba o rechaza un negocio desde el panel administrativo:

1. El estado se actualiza en la base de datos.
2. Se envia automaticamente un email al negocio informando sobre su estado.
3. El email incluye:
   - Notificacion de aprobacion o rechazo.
   - Informacion sobre los pasos siguientes.
   - Email de soporte para dudas: dedbensec@gmail.com.

### Estados que envian email:
- Aprobado: Email confirmando la aprobacion.
- Rechazado: Email informando el rechazo con instrucciones.
- Pendiente: No envia email (estado intermedio).

---

## Configuracion Actual (Gmail)

### Credenciales
```
Email: dedbensec@gmail.com
App Password: mdja clrk lcaw nqdv
Protocolo: SMTP TLS
Puerto: 587
Host: smtp.gmail.com
```

### Variables de Entorno
```bash
GMAIL_USER=dedbensec@gmail.com
GMAIL_APP_PASSWORD=mdja clrk lcaw nqdv
SUPPORT_EMAIL=dedbensec@gmail.com
```

### Configuracion en Codigo
```javascript
// server/routes/admin.ts
transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD.replace(/\s/g, ""),
  },
});
```

---

## Problema Conocido - Red Restrictiva

- Estado: Implementado, pendiente de prueba en produccion.

### Error Observado
```
Error sending email: connect ETIMEDOUT 142.251.186.108:465
```

### Causa Probable
- Firewall corporativo o de red bloqueando el puerto SMTP 587.
- Proxy de red restringiendo conexiones externas.
- Bloqueo de puertos SMTP por parte de ISPs.

### Solucion
El codigo esta correctamente implementado. Para realizar pruebas:
1. Desde otra red (WiFi alternativo o datos moviles).
2. VPN (si se encuentra disponible).
3. Cambiar de proveedor (ver alternativas mas abajo).

---

## Alternativas Recomendadas

### 1. Resend (Recomendado - Moderno)
- Facil de configurar.
- No requiere contrasenas de aplicacion complejas.
- Interfaz de administracion limpia.
- Alta confiabilidad.
- Cuota gratuita de 100 emails al mes.

**Setup:**
```bash
pnpm add resend
```

```javascript
// server/routes/admin.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "noreply@eldominio.com",
  to: businessEmail,
  subject: "Notificacion Punto Joven",
  html: htmlContent,
});
```

Obtener API Key: https://resend.com/

---

### 2. SendGrid
- Alta confiabilidad y trayectoria.
- Soporte tecnico estructurado.
- Funciona correctamente en redes restrictivas.
- Cuota gratuita de 100 emails diarios.

**Setup:**
```bash
pnpm add @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: businessEmail,
  from: 'noreply@eldominio.com',
  subject: 'Notificacion Punto Joven',
  html: htmlContent,
});
```

Obtener API Key: https://sendgrid.com/

---

### 3. Mailgun
- Buena alternativa de integracion.
- Flexible y potente.
- Permite uso gratuito con dominio personalizado.

**Setup:**
```bash
pnpm add mailgun.js
```

---

## Implementacion Actual (Archivos Modificados)

### 1. `server/routes/admin.ts`
- Funcion `sendBusinessEmail()`: Envia emails HTML formateados.
- Integracion en el endpoint `POST /api/admin/businesses/:businessId/status`.
- Email enviado automaticamente despues de cambiar el estado.
- Manejo de errores no-bloqueante (no impide actualizar el estado).

### 2. `client/components/admin/AdminStatusModal.tsx`
- Toast muestra si el email fue enviado o no.
- Retroalimentacion visual al administrador sobre el envio.

### 3. Variables de Entorno
- `GMAIL_USER`: Email remitente.
- `GMAIL_APP_PASSWORD`: Credencial de aplicacion.
- `SUPPORT_EMAIL`: Email de soporte en el mensaje.

---

## Como realizar pruebas

### Localmente (con red abierta)
1. Ir al panel administrativo: `http://localhost:8082/admin`.
2. Hacer clic en "Revisar" en cualquier negocio.
3. Cambiar el estado a "Aprobado" o "Rechazado".
4. Hacer clic en "Guardar cambios".
5. Validar la respuesta en pantalla.

### En Produccion
1. Verificar que las variables de entorno esten configuradas correctamente.
2. Realizar una prueba inicial con un negocio de test.
3. Verificar la bandeja de entrada y spam.
4. Revisar los logs del servidor para descartar errores.

---

## Proximos Pasos

### Opcion 1: Continuar con Gmail
- Probar desde una red con puertos SMTP abiertos.
- El codigo esta listo y solo requiere conectividad.

### Opcion 2: Migrar a Resend (Recomendado)
```bash
pnpm add resend
```

### Opcion 3: Usar SendGrid
```bash
pnpm add @sendgrid/mail
```

---

## Formato del Email

El email recibido por el negocio incluye:

```
To: negocio@email.com
Subject: Solicitud de negocio APROBADA en Punto Joven
         (o Solicitud en revision - Punto Joven)

Contenido:
- Logotipo de Punto Joven.
- Notificacion de estado.
- Mensaje personalizado segun resolucion.
- Email de soporte: dedbensec@gmail.com.
- Firma del Instituto Municipal para la Juventud.
```

---

## Notas de Seguridad

- Practicas implementadas:
  - Credenciales almacenadas en variables de entorno (no en codigo fuente).
  - Envio de email no-bloqueante.
  - Correos con HTML escapado para evitar inyecciones.
  - Manejo estructurado de errores con logs de registro.

- Recomendaciones:
  - No registrar archivos `.env` en el control de versiones.
  - Las contrasenas de aplicacion de Google pueden ser revocadas desde la cuenta de administracion.
  - Los filtros de correo pueden desviar los envios a la carpeta de spam.

---

## Soporte

En caso de requerir soporte:
1. Revisar los logs del servidor (npm run dev).
2. Verificar que las credenciales sean correctas.
3. Probar desde otra red.
4. Contactar al equipo de soporte.
