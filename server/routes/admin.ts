import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import nodemailer from "nodemailer";
import qrcode from "qrcode";
import { getPool, getPoolJovenes, sqlTypes } from "../db";
import type { AdminDashboardStats, UpdateBusinessStatusRequest, UpdateBeneficiaryStatusRequest } from "@shared/api";

const router = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "dedbensec@gmail.com";

// Email transporter configuration
let transporter: nodemailer.Transporter | null = null;

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // True para puerto 465, False para 587 o 25
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS.replace(/\s/g, ""),
    },
  });
}

async function sendBusinessEmail(
  to: string,
  businessName: string,
  status: "approved" | "rejected",
  comment?: string
): Promise<boolean> {
  if (!transporter) {
    console.error("Email transporter not configured");
    return false;
  }

  try {
    const isApproved = status === "approved";
    const subject = isApproved
      ? "Solicitud de afiliacion de negocio APROBADA - Punto Joven"
      : "Estatus de solicitud de negocio - Punto Joven";

    const statusMessage = isApproved
      ? "La solicitud de afiliacion ha sido aprobada. Ya se puede acceder a la cuenta."
      : "La solicitud de afiliacion se encuentra en revision.";

    const baseUrl = process.env.VITE_APP_URL || "http://localhost:8080";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #88163e 0%, #bc955b 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .status { padding: 15px; border-radius: 8px; margin: 20px 0; }
        .approved { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .rejected { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .pending { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        .button { display: inline-block; background: #88163e; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 10px 0; font-weight: bold; }
        h1 { color: #88163e; }
        strong { color: #88163e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Punto Joven</h2>
          <p>Instituto Municipal para la Juventud de Pachuca</p>
        </div>

        <div class="content">
          <h1>Hola, ${businessName}</h1>

          <div class="status ${status === "approved" ? "approved" : (status === "rejected" ? "rejected" : "pending")}">
            <strong>${statusMessage}</strong>
          </div>

          <p>Se agradece el interes en formar parte de la red de negocios aliados del programa Punto Joven.</p>

          ${
            isApproved
              ? `
            <p>El negocio ahora forma parte del programa Punto Joven, conectando a jovenes del municipio con descuentos y beneficios exclusivos.</p>
            <p>Ya se puede acceder a la cuenta con el correo electronico registrado y la contrasena que fue proporcionada en el formulario de registro.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/login" class="button">Acceder a la Cuenta</a>
            </div>

            <p>Instrucciones de acceso y gestion:</p>
            <ol>
              <li>Ingresar al enlace de acceso del panel de comercios.</li>
              <li>Iniciar sesion con el correo electronico y la contrasena registrada.</li>
              <li>En el panel, se podra actualizar la informacion del establecimiento, configurar o cambiar la descripcion de los descuentos ofrecidos, y subir logotipos actualizados.</li>
            </ol>
          `
              : `
            <p>La solicitud no ha podido ser aprobada en este momento.</p>
            ${comment ? `<p><strong>Motivo del rechazo:</strong> ${comment}</p>` : ""}
            <p>Se sugiere revisar los requisitos e intentar el registro nuevamente o ponerse en contacto con el equipo de soporte.</p>
          `
          }

          <p style="margin-top: 30px;">En caso de dudas o comentarios, escribir a:</p>
          <p><strong>${SUPPORT_EMAIL}</strong></p>
        </div>

        <div class="footer">
          <p>© 2024 Instituto Municipal para la Juventud de Pachuca - Punto Joven</p>
          <p>Este es un correo automatico, se solicita no responder a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: SMTP_USER,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`Email enviado a ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error instanceof Error ? error.message : error);
    return false;
  }
}

async function sendBeneficiaryEmail(
  to: string,
  name: string,
  status: "approved" | "rejected",
  token: string,
  curp: string,
  fotoCredencialUrl?: string,
  comment?: string
): Promise<boolean> {
  if (!transporter) {
    console.error("Email transporter not configured");
    return false;
  }

  try {
    const isApproved = status === "approved";
    const subject = isApproved
      ? "Solicitud de credencial de Punto Joven APROBADA"
      : "Estatus de solicitud de Punto Joven";

    const statusMessage = isApproved
      ? "La solicitud ha sido aprobada. La credencial digital esta lista para utilizarse."
      : "La solicitud ha sido rechazada.";

    let qrCodeDataUrl = "";
    const baseUrl = process.env.VITE_APP_URL || "http://localhost:8080";
    if (isApproved && token) {
      const validateUrl = `${baseUrl}/validar/${token}`;
      qrCodeDataUrl = await qrcode.toDataURL(validateUrl, { width: 300, margin: 2 });
    }

    const hasPhoto = !!fotoCredencialUrl;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #88163e 0%, #bc955b 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .status { padding: 15px; border-radius: 8px; margin: 20px 0; }
        .approved { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .rejected { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        .button { display: inline-block; background: #88163e; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: bold; }
        .card-container { max-width: 320px; margin: 20px auto; padding: 20px; border: 2px solid #88163e; border-radius: 12px; background-color: #fff; text-align: center; }
        .card-title { background-color: #88163e; color: #fff; padding: 10px; border-radius: 6px 6px 0 0; font-weight: bold; font-size: 16px; margin: -20px -20px 15px -20px; }
        .profile-img { width: 110px; height: 110px; border-radius: 50%; border: 3px solid #bc955b; object-fit: cover; margin: 10px auto; display: block; }
        .profile-fallback { width: 110px; height: 110px; border-radius: 50%; border: 3px solid #bc955b; background-color: #eee; color: #777; line-height: 110px; font-size: 12px; margin: 10px auto; display: block; }
        .qr-img { width: 140px; height: 140px; border: 1px solid #eee; padding: 5px; background: #fff; display: block; margin: 10px auto; }
        h1 { color: #88163e; }
        strong { color: #88163e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Punto Joven</h2>
          <p>Instituto Municipal para la Juventud de Pachuca</p>
        </div>

        <div class="content">
          <h1>Hola, ${name}</h1>

          <div class="status ${isApproved ? "approved" : "rejected"}">
            <strong>${statusMessage}</strong>
          </div>

          ${
            isApproved
              ? `
            <p>Se notifica que el registro como beneficiario en el programa Punto Joven ha sido aprobado.</p>
            <p>A continuacion, se presenta la credencial digital con el codigo QR unico. Los comercios afiliados podran escanear este codigo para validar el estatus y aplicar los descuentos vigentes.</p>
            
            <div class="card-container">
              <div class="card-title">CREDENCIAL DIGITAL</div>
              
              ${
                hasPhoto
                  ? `<img src="cid:selfie" alt="Foto de perfil" class="profile-img" />`
                  : `<div class="profile-fallback">Sin Foto</div>`
              }
              
              <div style="font-size: 16px; font-weight: bold; color: #88163e; margin: 5px 0;">${name}</div>
              <div style="font-size: 12px; color: #666; margin-bottom: 10px;">CURP: ${curp}</div>
              
              <div style="border-top: 1px dashed #ddd; margin: 10px 0; padding-top: 10px;">
                <div style="font-size: 10px; color: #888; text-transform: uppercase;">Folio de Validacion</div>
                <div style="font-size: 14px; font-weight: bold; color: #333; margin: 2px 0;">${token}</div>
              </div>
              
              ${
                qrCodeDataUrl
                  ? `<img src="cid:qrcode" class="qr-img" alt="Codigo QR" />`
                  : ""
              }
            </div>

            <p>Tambien se puede acceder a la credencial digital completa en linea haciendo clic en el siguiente boton:</p>
            <a href="${baseUrl}/validar/${token}" class="button">Ver Credencial Digital en Linea</a>
          `
              : `
            <p>La solicitud de credencial no ha sido aprobada en este momento.</p>
            ${comment ? `<p><strong>Motivo de rechazo:</strong> ${comment}</p>` : ""}
            <p>Se solicita revisar los datos e intentar el registro nuevamente o ponerse en contacto con el equipo de soporte.</p>
          `
          }
        </div>

        <div class="footer">
          <p>© 2024 Instituto Municipal para la Juventud de Pachuca - Punto Joven</p>
          <p>Este es un correo automatico, se solicita no responder directamente a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const attachments: any[] = [];

    if (isApproved && qrCodeDataUrl) {
      attachments.push({
        filename: "qrcode.png",
        path: qrCodeDataUrl,
        cid: "qrcode",
      });
    }

    if (isApproved && fotoCredencialUrl) {
      const match = fotoCredencialUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const contentType = match[1];
        const base64Data = match[2];
        attachments.push({
          filename: "selfie.jpg",
          content: Buffer.from(base64Data, "base64"),
          contentType: contentType,
          cid: "selfie",
        });
      }
    }

    await transporter.sendMail({
      from: SMTP_USER,
      to,
      subject,
      html: htmlContent,
      attachments,
    });

    console.log(`Email de beneficiario enviado a ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending beneficiary email:", error instanceof Error ? error.message : error);
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!ADMIN_SECRET) {
    return res.status(500).json({ message: "Falta configurar ADMIN_SECRET en el servidor" });
  }
  const header = req.headers["x-admin-secret"];
  if (header !== ADMIN_SECRET) {
    return res.status(401).json({ message: "No autorizado" });
  }
  next();
}

// =====================================================
// DASHBOARD - Estadísticas generales
// =====================================================

router.get("/dashboard", requireAdmin, async (_req, res) => {
  try {
    console.log("🔄 Fetching admin dashboard stats...");
    const pool = await getPool();
    console.log("✅ Connected to NEGOCIOS database");
    const poolJovenes = await getPoolJovenes();
    console.log("✅ Connected to JOVENES database");

    let businessStats = { recordset: [{ total: 0, pending: 0, approved: 0, rejected: 0 }] };
    let recentBusinesses = { recordset: [] };

    // Obtener estadísticas de negocios
    try {
      console.log("📊 Querying business statistics...");
      businessStats = await pool.request().query(`
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
          COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
          COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM business_accounts
      `);
      console.log("✅ Business stats fetched:", businessStats.recordset[0]);

      recentBusinesses = await pool.request().query(`
        SELECT TOP 5 * FROM business_accounts ORDER BY created_at DESC
      `);
    } catch (businessError) {
      console.error("❌ Error fetching business stats:", businessError instanceof Error ? businessError.message : businessError);
    }

    // Obtener estadísticas de beneficiarios (tabla legacy young_beneficiaries)
    let beneficiaryStats = { recordset: [{ total: 0, pending: 0, approved: 0, rejected: 0 }] };
    try {
      console.log("📊 Querying legacy beneficiary statistics...");
      beneficiaryStats = await poolJovenes.request().query(`
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
          COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
          COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM young_beneficiaries
      `);
      console.log("✅ Legacy Beneficiary stats fetched:", beneficiaryStats.recordset[0]);
    } catch (beneficiaryError) {
      console.error("❌ Error fetching legacy beneficiary stats:", beneficiaryError instanceof Error ? beneficiaryError.message : beneficiaryError);
    }

    // Obtener estadísticas de JÓVENES MENORES (12-17)
    let youngMinorsStats = { recordset: [{ total: 0, pending: 0, approved: 0, rejected: 0 }] };
    try {
      console.log("📊 Querying young minors statistics...");
      youngMinorsStats = await poolJovenes.request().query(`
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
          COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
          COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM young_minors
      `);
      console.log("✅ Young minors stats fetched:", youngMinorsStats.recordset[0]);
    } catch (error) {
      console.warn("⚠️ Warning fetching young minors stats:", error instanceof Error ? error.message : error);
    }

    // Obtener estadísticas de JÓVENES MAYORES (18-29)
    let youngAdultsStats = { recordset: [{ total: 0, pending: 0, approved: 0, rejected: 0 }] };
    try {
      console.log("📊 Querying young adults statistics...");
      youngAdultsStats = await poolJovenes.request().query(`
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
          COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
          COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
        FROM young_adults
      `);
      console.log("✅ Young adults stats fetched:", youngAdultsStats.recordset[0]);
    } catch (error) {
      console.warn("⚠️ Warning fetching young adults stats:", error instanceof Error ? error.message : error);
    }

    // Últimos beneficiarios registrados (5)
    let recentBeneficiaries = { recordset: [] };
    try {
      recentBeneficiaries = await poolJovenes.request().query(`
        SELECT TOP 5 * FROM young_beneficiaries ORDER BY created_at DESC
      `);
    } catch (beneficiaryError) {
      console.warn("Error fetching recent beneficiaries:", beneficiaryError instanceof Error ? beneficiaryError.message : beneficiaryError);
    }

    const businessData = businessStats.recordset[0];
    const beneficiaryData = beneficiaryStats.recordset[0];
    const youngMinorsData = youngMinorsStats.recordset[0];
    const youngAdultsData = youngAdultsStats.recordset[0];

    const stats: AdminDashboardStats = {
      businesses: {
        total: businessData?.total || 0,
        pending: businessData?.pending || 0,
        approved: businessData?.approved || 0,
        rejected: businessData?.rejected || 0,
      },
      beneficiaries: {
        total: beneficiaryData?.total || 0,
        pending: beneficiaryData?.pending || 0,
        approved: beneficiaryData?.approved || 0,
        rejected: beneficiaryData?.rejected || 0,
      },
      youngMinors: {
        total: youngMinorsData?.total || 0,
        pending: youngMinorsData?.pending || 0,
        approved: youngMinorsData?.approved || 0,
        rejected: youngMinorsData?.rejected || 0,
      },
      youngAdults: {
        total: youngAdultsData?.total || 0,
        pending: youngAdultsData?.pending || 0,
        approved: youngAdultsData?.approved || 0,
        rejected: youngAdultsData?.rejected || 0,
      },
      recentBusinesses: recentBusinesses.recordset || [],
      recentBeneficiaries: recentBeneficiaries.recordset || [],
    };

    console.log("📈 Final dashboard stats:", {
      businesses: stats.businesses,
      beneficiaries: stats.beneficiaries,
      youngMinors: stats.youngMinors,
      youngAdults: stats.youngAdults,
    });
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

// =====================================================
// EMPRESAS - Listado con filtros
// =====================================================

router.get("/businesses", requireAdmin, async (req, res) => {
  try {
    const { status, search, limit = "50", offset = "0" } = req.query;
    const pool = await getPool();

    // Verificar si la tabla existe
    const tableExists = await pool
      .request()
      .query(
        `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'business_accounts' AND TABLE_SCHEMA = 'dbo'`
      );

    if (tableExists.recordset[0].count === 0) {
      return res.json({
        items: [],
        total: 0,
      });
    }

    let query = "SELECT * FROM business_accounts WHERE 1=1";
    const parameters: any[] = [];

    if (status && status !== "all") {
      query += ` AND status = @status`;
      parameters.push({ name: "status", value: status });
    }

    if (search) {
      query += ` AND (business_name LIKE @search OR owner_name LIKE @search OR email LIKE @search)`;
      parameters.push({ name: "search", value: `%${search}%` });
    }

    query += ` ORDER BY created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    parameters.push({ name: "offset", value: Number(offset) });
    parameters.push({ name: "limit", value: Number(limit) });

    let request = pool.request();
    parameters.forEach(p => {
      if (p.name === "search") {
        request = request.input(p.name, sqlTypes.NVarChar, p.value);
      } else if (p.name === "status") {
        request = request.input(p.name, sqlTypes.VarChar(20), p.value);
      } else {
        request = request.input(p.name, sqlTypes.Int, p.value);
      }
    });

    const result = await request.query(query);

    // Obtener total
    const countQuery = status && status !== "all"
      ? "SELECT COUNT(*) as total FROM business_accounts WHERE status = @status"
      : "SELECT COUNT(*) as total FROM business_accounts";

    let countRequest = pool.request();
    if (status && status !== "all") {
      countRequest = countRequest.input("status", sqlTypes.VarChar(20), status);
    }

    const countResult = await countRequest.query(countQuery);

    res.json({
      items: result.recordset,
      total: countResult.recordset[0].total,
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.json({
      items: [],
      total: 0,
    });
  }
});

// =====================================================
// EMPRESAS - Cambiar estado de un negocio
// =====================================================

router.post("/businesses/:businessId/status", requireAdmin, async (req, res) => {
  try {
    const businessId = Number(req.params.businessId);
    if (Number.isNaN(businessId)) {
      return res.status(400).json({ message: "businessId inválido" });
    }

    const parsed = z
      .object({
        status: z.enum(["pending", "approved", "rejected"]),
        comment: z.string().max(500).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten().fieldErrors });
    }

    const pool = await getPool();

    try {
      // Verificar que existe
      const existing = await pool
        .request()
        .input("business_id", sqlTypes.Int, businessId)
        .query("SELECT status, business_name FROM business_accounts WHERE business_id = @business_id");

      if (existing.recordset.length === 0) {
        return res.status(404).json({ message: "Negocio no encontrado" });
      }

      const oldStatus = existing.recordset[0].status;
      const businessName = existing.recordset[0].business_name;

      // Actualizar estado
      await pool
        .request()
        .input("status", sqlTypes.VarChar(20), parsed.data.status)
        .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
        .input("business_id", sqlTypes.Int, businessId)
        .query(`
          UPDATE business_accounts
          SET status = @status,
              status_comment = @comment,
              approved_at = CASE WHEN @status = 'approved' THEN SYSUTCDATETIME() ELSE approved_at END,
              updated_at = SYSUTCDATETIME()
          WHERE business_id = @business_id
        `);

      // Registrar en historial (opcional - no bloquea si falla)
      try {
        await pool
          .request()
          .input("business_id", sqlTypes.Int, businessId)
          .input("old_status", sqlTypes.VarChar(20), oldStatus)
          .input("new_status", sqlTypes.VarChar(20), parsed.data.status)
          .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
          .query(`
            INSERT INTO business_status_history (business_id, old_status, new_status, comment)
            VALUES (@business_id, @old_status, @new_status, @comment)
          `);
      } catch (historyError) {
        console.warn("⚠️ Could not insert business status history (non-blocking):", historyError instanceof Error ? historyError.message : historyError);
      }

      // Get business email for sending notification
      const businessData = await pool
        .request()
        .input("business_id", sqlTypes.Int, businessId)
        .query("SELECT email FROM business_accounts WHERE business_id = @business_id");

      const businessEmail = businessData.recordset[0]?.email;
      let emailSent = false;

      // Send email notification (non-blocking)
      if (businessEmail && parsed.data.status !== "pending") {
        emailSent = await sendBusinessEmail(
          businessEmail,
          businessName,
          parsed.data.status as "approved" | "rejected",
          parsed.data.comment
        );
      }

      res.json({
        message: "Estado actualizado",
        businessId,
        businessName,
        oldStatus,
        newStatus: parsed.data.status,
        emailSent,
      });
    } catch (dbError) {
      return res.status(404).json({ message: "Tabla de negocios no disponible" });
    }
  } catch (error) {
    console.error("Error updating business status:", error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

// =====================================================
// BENEFICIARIOS - Listado con filtros
// =====================================================

router.get("/beneficiaries", requireAdmin, async (req, res) => {
  try {
    const { status, search, limit = "50", offset = "0" } = req.query;
    console.log("📋 Fetching beneficiaries, status:", status, "search:", search);
    const pool = await getPoolJovenes();
    console.log("✅ Connected to BENEFICIOS database for beneficiaries");

    let query = "SELECT * FROM young_beneficiaries WHERE 1=1";
    const parameters: any[] = [];

    if (status && status !== "all") {
      query += ` AND status = @status`;
      parameters.push({ name: "status", value: status });
    }

    if (search) {
      query += ` AND (nombre LIKE @search OR curp LIKE @search OR email LIKE @search)`;
      parameters.push({ name: "search", value: `%${search}%` });
    }

    query += ` ORDER BY created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    parameters.push({ name: "offset", value: Number(offset) });
    parameters.push({ name: "limit", value: Number(limit) });

    let request = pool.request();
    parameters.forEach(p => {
      if (p.name === "search") {
        request = request.input(p.name, sqlTypes.NVarChar, p.value);
      } else if (p.name === "status") {
        request = request.input(p.name, sqlTypes.VarChar(20), p.value);
      } else {
        request = request.input(p.name, sqlTypes.Int, p.value);
      }
    });

    const result = await request.query(query);
    console.log("✅ Beneficiaries query result:", result.recordset.length, "records");

    // Obtener total
    const countQuery = status && status !== "all"
      ? "SELECT COUNT(*) as total FROM young_beneficiaries WHERE status = @status"
      : "SELECT COUNT(*) as total FROM young_beneficiaries";

    let countRequest = pool.request();
    if (status && status !== "all") {
      countRequest = countRequest.input("status", sqlTypes.VarChar(20), status);
    }

    const countResult = await countRequest.query(countQuery);
    console.log("✅ Beneficiaries count:", countResult.recordset[0].total);

    res.json({
      items: result.recordset,
      total: countResult.recordset[0].total,
    });
  } catch (error) {
    console.error("Error fetching beneficiaries:", error instanceof Error ? error.message : error);
    console.error("Full error:", error);
    res.status(500).json({ message: "Error al obtener beneficiarios", error: error instanceof Error ? error.message : String(error) });
  }
});

// =====================================================
// BENEFICIARIOS - Cambiar estado de un beneficiario
// =====================================================

router.post("/beneficiaries/:beneficiaryId/status", requireAdmin, async (req, res) => {
  try {
    const beneficiaryId = Number(req.params.beneficiaryId);
    if (Number.isNaN(beneficiaryId)) {
      return res.status(400).json({ message: "beneficiaryId inválido" });
    }

    const parsed = z
      .object({
        status: z.enum(["pending", "approved", "rejected"]),
        comment: z.string().max(500).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten().fieldErrors });
    }

    const pool = await getPoolJovenes();

    // Verificar que existe
    const existing = await pool
      .request()
      .input("beneficiary_id", sqlTypes.Int, beneficiaryId)
      .query("SELECT status, nombre, email, token, curp FROM young_beneficiaries WHERE beneficiary_id = @beneficiary_id");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Beneficiario no encontrado" });
    }

    const oldStatus = existing.recordset[0].status;
    const nombre = existing.recordset[0].nombre;

    // Actualizar estado
    await pool
      .request()
      .input("status", sqlTypes.VarChar(20), parsed.data.status)
      .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
      .input("beneficiary_id", sqlTypes.Int, beneficiaryId)
      .query(`
        UPDATE young_beneficiaries
        SET status = @status,
            status_comment = @comment,
            approved_at = CASE WHEN @status = 'approved' THEN SYSUTCDATETIME() ELSE approved_at END,
            updated_at = SYSUTCDATETIME()
        WHERE beneficiary_id = @beneficiary_id
      `);

    // Registrar en historial (opcional - no bloquea si falla)
    try {
      await pool
        .request()
        .input("beneficiary_id", sqlTypes.Int, beneficiaryId)
        .input("old_status", sqlTypes.VarChar(20), oldStatus)
        .input("new_status", sqlTypes.VarChar(20), parsed.data.status)
        .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
        .query(`
          INSERT INTO beneficiary_status_history (beneficiary_id, old_status, new_status, comment)
          VALUES (@beneficiary_id, @old_status, @new_status, @comment)
        `);
    } catch (historyError) {
      console.warn("⚠️ Could not insert beneficiary status history (non-blocking):", historyError instanceof Error ? historyError.message : historyError);
    }

    // Enviar correo de notificación
    const email = existing.recordset[0].email;
    const token = existing.recordset[0].token;
    const curp = existing.recordset[0].curp;
    if (email && parsed.data.status !== "pending") {
      await sendBeneficiaryEmail(
        email,
        nombre,
        parsed.data.status as "approved" | "rejected",
        token,
        curp,
        undefined,
        parsed.data.comment
      );
    }

    res.json({
      message: "Estado actualizado",
      beneficiaryId,
      nombre,
      oldStatus,
      newStatus: parsed.data.status,
    });
  } catch (error) {
    console.error("Error updating beneficiary status:", error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

// =====================================================
// EMPRESAS - Eliminar negocio
// =====================================================

router.delete("/businesses/:businessId", requireAdmin, async (req, res) => {
  try {
    const businessId = Number(req.params.businessId);
    if (Number.isNaN(businessId)) {
      return res.status(400).json({ message: "businessId inválido" });
    }

    const pool = await getPool();

    // Verificar que existe
    const existing = await pool
      .request()
      .input("business_id", sqlTypes.Int, businessId)
      .query("SELECT business_name FROM business_accounts WHERE business_id = @business_id");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Negocio no encontrado" });
    }

    const businessName = existing.recordset[0].business_name;

    // Eliminar historial relacionado
    try {
      await pool
        .request()
        .input("business_id", sqlTypes.Int, businessId)
        .query("DELETE FROM business_status_history WHERE business_id = @business_id");
    } catch (historyError) {
      console.warn("⚠️ Could not delete business status history (non-blocking):", historyError instanceof Error ? historyError.message : historyError);
    }

    // Eliminar negocio
    await pool
      .request()
      .input("business_id", sqlTypes.Int, businessId)
      .query("DELETE FROM business_accounts WHERE business_id = @business_id");

    res.json({
      message: "Negocio eliminado correctamente",
      businessId,
      businessName,
    });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ message: "Error al eliminar el negocio" });
  }
});

// =====================================================
// BENEFICIARIOS - Eliminar beneficiario
// =====================================================

router.delete("/beneficiaries/:beneficiaryId", requireAdmin, async (req, res) => {
  try {
    const beneficiaryId = Number(req.params.beneficiaryId);
    if (Number.isNaN(beneficiaryId)) {
      return res.status(400).json({ message: "beneficiaryId inválido" });
    }

    const pool = await getPoolJovenes();

    // Verificar que existe
    const existing = await pool
      .request()
      .input("beneficiary_id", sqlTypes.Int, beneficiaryId)
      .query("SELECT nombre FROM young_beneficiaries WHERE beneficiary_id = @beneficiary_id");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Beneficiario no encontrado" });
    }

    const nombre = existing.recordset[0].nombre;

    // Eliminar historial relacionado
    try {
      await pool
        .request()
        .input("beneficiary_id", sqlTypes.Int, beneficiaryId)
        .query("DELETE FROM beneficiary_status_history WHERE beneficiary_id = @beneficiary_id");
    } catch (historyError) {
      console.warn("⚠️ Could not delete beneficiary status history (non-blocking):", historyError instanceof Error ? historyError.message : historyError);
    }

    // Eliminar beneficiario
    await pool
      .request()
      .input("beneficiary_id", sqlTypes.Int, beneficiaryId)
      .query("DELETE FROM young_beneficiaries WHERE beneficiary_id = @beneficiary_id");

    res.json({
      message: "Beneficiario eliminado correctamente",
      beneficiaryId,
      nombre,
    });
  } catch (error) {
    console.error("Error deleting beneficiary:", error);
    res.status(500).json({ message: "Error al eliminar el beneficiario" });
  }
});

// =====================================================
// JÓVENES MENORES (12-17) - Listado
// =====================================================

router.get("/young-minors", requireAdmin, async (req, res) => {
  try {
    const { status, search, limit = "50", offset = "0" } = req.query;
    const pool = await getPoolJovenes();

    // Verificar si la tabla existe
    const tableExists = await pool
      .request()
      .query(
        `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'young_minors' AND TABLE_SCHEMA = 'dbo'`
      );

    if (tableExists.recordset[0].count === 0) {
      console.warn("⚠️ Tabla young_minors no existe");
      return res.json({
        items: [],
        total: 0,
      });
    }

    // Listar columnas disponibles
    const columnsResult = await pool.request().query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_minors'
    `);
    console.log("📋 Columnas disponibles en young_minors:", columnsResult.recordset.map((c: any) => c.COLUMN_NAME));

    let query = "SELECT * FROM young_minors WHERE 1=1";
    const parameters: any[] = [];

    if (status && status !== "all") {
      query += ` AND status = @status`;
      parameters.push({ name: "status", value: status });
    }

    if (search) {
      query += ` AND (nombre LIKE @search OR email LIKE @search OR curp LIKE @search)`;
      parameters.push({ name: "search", value: `%${search}%` });
    }

    query += ` ORDER BY created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    parameters.push({ name: "offset", value: Number(offset) });
    parameters.push({ name: "limit", value: Number(limit) });

    let request = pool.request();
    parameters.forEach((p) => {
      if (p.name === "search") {
        request = request.input(p.name, sqlTypes.NVarChar, p.value);
      } else if (p.name === "status") {
        request = request.input(p.name, sqlTypes.VarChar(20), p.value);
      } else {
        request = request.input(p.name, sqlTypes.Int, p.value);
      }
    });

    const result = await request.query(query);
    console.log(`✅ Se encontraron ${result.recordset.length} menores`);

    if (result.recordset.length > 0) {
      console.log("📦 Campos del primer registro:", Object.keys(result.recordset[0]));
      console.log("📄 Primeros documentos:", {
        tutor_ine_url: result.recordset[0].tutor_ine_url ? "✅ Presente" : "❌ Falta",
        credencial_escolar_url: result.recordset[0].credencial_escolar_url ? "✅ Presente" : "❌ Falta",
        foto_credencial_url: result.recordset[0].foto_credencial_url ? "✅ Presente" : "❌ Falta",
      });
    }

    // Obtener total
    const countQuery =
      status && status !== "all"
        ? "SELECT COUNT(*) as total FROM young_minors WHERE status = @status"
        : "SELECT COUNT(*) as total FROM young_minors";

    let countRequest = pool.request();
    if (status && status !== "all") {
      countRequest = countRequest.input("status", sqlTypes.VarChar(20), status);
    }

    const countResult = await countRequest.query(countQuery);

    res.json({
      items: result.recordset,
      total: countResult.recordset[0].total,
    });
  } catch (error) {
    console.error("Error fetching young minors:", error instanceof Error ? error.message : error);
    console.error("Full error:", error);
    res.status(500).json({
      items: [],
      total: 0,
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
});

// =====================================================
// JÓVENES MAYORES (18-29) - Listado
// =====================================================

router.get("/young-adults", requireAdmin, async (req, res) => {
  try {
    const { status, search, limit = "50", offset = "0" } = req.query;
    const pool = await getPoolJovenes();

    // Verificar si la tabla existe
    const tableExists = await pool
      .request()
      .query(
        `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'young_adults' AND TABLE_SCHEMA = 'dbo'`
      );

    if (tableExists.recordset[0].count === 0) {
      console.warn("⚠️ Tabla young_adults no existe");
      return res.json({
        items: [],
        total: 0,
      });
    }

    // Listar columnas disponibles
    const columnsResult = await pool.request().query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_adults'
    `);
    console.log("📋 Columnas disponibles en young_adults:", columnsResult.recordset.map((c: any) => c.COLUMN_NAME));

    let query = "SELECT * FROM young_adults WHERE 1=1";
    const parameters: any[] = [];

    if (status && status !== "all") {
      query += ` AND status = @status`;
      parameters.push({ name: "status", value: status });
    }

    if (search) {
      query += ` AND (nombre LIKE @search OR email LIKE @search OR curp LIKE @search)`;
      parameters.push({ name: "search", value: `%${search}%` });
    }

    query += ` ORDER BY created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
    parameters.push({ name: "offset", value: Number(offset) });
    parameters.push({ name: "limit", value: Number(limit) });

    let request = pool.request();
    parameters.forEach((p) => {
      if (p.name === "search") {
        request = request.input(p.name, sqlTypes.NVarChar, p.value);
      } else if (p.name === "status") {
        request = request.input(p.name, sqlTypes.VarChar(20), p.value);
      } else {
        request = request.input(p.name, sqlTypes.Int, p.value);
      }
    });

    const result = await request.query(query);
    console.log(`✅ Se encontraron ${result.recordset.length} mayores de edad`);

    if (result.recordset.length > 0) {
      console.log("📦 Campos del primer registro:", Object.keys(result.recordset[0]));
      console.log("📄 Primeros documentos:", {
        ine_url: result.recordset[0].ine_url ? "✅ Presente" : "❌ Falta",
        comprobante_domicilio_url: result.recordset[0].comprobante_domicilio_url ? "✅ Presente" : "❌ Falta",
        foto_credencial_url: result.recordset[0].foto_credencial_url ? "✅ Presente" : "❌ Falta",
      });
    }

    // Obtener total
    const countQuery =
      status && status !== "all"
        ? "SELECT COUNT(*) as total FROM young_adults WHERE status = @status"
        : "SELECT COUNT(*) as total FROM young_adults";

    let countRequest = pool.request();
    if (status && status !== "all") {
      countRequest = countRequest.input("status", sqlTypes.VarChar(20), status);
    }

    const countResult = await countRequest.query(countQuery);

    res.json({
      items: result.recordset,
      total: countResult.recordset[0].total,
    });
  } catch (error) {
    console.error("Error fetching young adults:", error instanceof Error ? error.message : error);
    console.error("Full error:", error);
    res.status(500).json({
      items: [],
      total: 0,
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
});

// =====================================================
// JÓVENES MENORES (12-17) - Cambiar estado
// =====================================================

router.post("/young-minors/:minorId/status", requireAdmin, async (req, res) => {
  try {
    const minorId = Number(req.params.minorId);
    if (Number.isNaN(minorId)) {
      return res.status(400).json({ message: "minorId inválido" });
    }

    const parsed = z
      .object({
        status: z.enum(["pending", "approved", "rejected"]),
        comment: z.string().max(500).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten().fieldErrors });
    }

    const pool = await getPoolJovenes();

    // Verificar que existe
    const existing = await pool
      .request()
      .input("minor_id", sqlTypes.Int, minorId)
      .query("SELECT status, nombre, email, token, curp, foto_credencial_url FROM young_minors WHERE minor_id = @minor_id");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Menor no encontrado" });
    }

    const oldStatus = existing.recordset[0].status;
    const nombre = existing.recordset[0].nombre;

    // Actualizar estado
    await pool
      .request()
      .input("status", sqlTypes.VarChar(20), parsed.data.status)
      .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
      .input("minor_id", sqlTypes.Int, minorId)
      .query(`
        UPDATE young_minors
        SET status = @status,
            status_comment = @comment,
            approved_at = CASE WHEN @status = 'approved' THEN SYSUTCDATETIME() ELSE approved_at END,
            updated_at = SYSUTCDATETIME()
        WHERE minor_id = @minor_id
      `);

    // Registrar en historial (opcional)
    try {
      await pool
        .request()
        .input("minor_id", sqlTypes.Int, minorId)
        .input("old_status", sqlTypes.VarChar(20), oldStatus)
        .input("new_status", sqlTypes.VarChar(20), parsed.data.status)
        .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
        .query(`
          INSERT INTO beneficiary_status_history (beneficiary_id, old_status, new_status, comment)
          VALUES (@minor_id, @old_status, @new_status, @comment)
        `);
    } catch (historyError) {
      console.warn("⚠️ Could not insert minor status history:", historyError instanceof Error ? historyError.message : historyError);
    }

    // Enviar correo de notificación
    const email = existing.recordset[0].email;
    const token = existing.recordset[0].token;
    const curp = existing.recordset[0].curp;
    const fotoCredencialUrl = existing.recordset[0].foto_credencial_url;
    if (email && parsed.data.status !== "pending") {
      await sendBeneficiaryEmail(
        email,
        nombre,
        parsed.data.status as "approved" | "rejected",
        token,
        curp,
        fotoCredencialUrl,
        parsed.data.comment
      );
    }

    res.json({
      message: "Estado actualizado",
      minorId,
      nombre,
      oldStatus,
      newStatus: parsed.data.status,
    });
  } catch (error) {
    console.error("Error updating minor status:", error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

// =====================================================
// JÓVENES MENORES (12-17) - Eliminar
// =====================================================

router.delete("/young-minors/:minorId", requireAdmin, async (req, res) => {
  try {
    const minorId = Number(req.params.minorId);
    if (Number.isNaN(minorId)) {
      return res.status(400).json({ message: "minorId inválido" });
    }

    const pool = await getPoolJovenes();

    // Verificar que existe
    const existing = await pool
      .request()
      .input("minor_id", sqlTypes.Int, minorId)
      .query("SELECT nombre FROM young_minors WHERE minor_id = @minor_id");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Menor no encontrado" });
    }

    const nombre = existing.recordset[0].nombre;

    // Eliminar menor
    await pool
      .request()
      .input("minor_id", sqlTypes.Int, minorId)
      .query("DELETE FROM young_minors WHERE minor_id = @minor_id");

    res.json({
      message: "Menor eliminado correctamente",
      minorId,
      nombre,
    });
  } catch (error) {
    console.error("Error deleting minor:", error);
    res.status(500).json({ message: "Error al eliminar el menor" });
  }
});

// =====================================================
// JÓVENES MAYORES (18-29) - Cambiar estado
// =====================================================

router.post("/young-adults/:adultId/status", requireAdmin, async (req, res) => {
  try {
    const adultId = Number(req.params.adultId);
    if (Number.isNaN(adultId)) {
      return res.status(400).json({ message: "adultId inválido" });
    }

    const parsed = z
      .object({
        status: z.enum(["pending", "approved", "rejected"]),
        comment: z.string().max(500).optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten().fieldErrors });
    }

    const pool = await getPoolJovenes();

    // Verificar que existe
    const existing = await pool
      .request()
      .input("beneficiary_id", sqlTypes.Int, adultId)
      .query("SELECT status, nombre, email, token, curp, foto_credencial_url FROM young_adults WHERE beneficiary_id = @beneficiary_id");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Mayor no encontrado" });
    }

    const oldStatus = existing.recordset[0].status;
    const nombre = existing.recordset[0].nombre;

    // Actualizar estado
    await pool
      .request()
      .input("status", sqlTypes.VarChar(20), parsed.data.status)
      .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
      .input("beneficiary_id", sqlTypes.Int, adultId)
      .query(`
        UPDATE young_adults
        SET status = @status,
            status_comment = @comment,
            approved_at = CASE WHEN @status = 'approved' THEN SYSUTCDATETIME() ELSE approved_at END,
            updated_at = SYSUTCDATETIME()
        WHERE beneficiary_id = @beneficiary_id
      `);

    // Registrar en historial (opcional)
    try {
      await pool
        .request()
        .input("beneficiary_id", sqlTypes.Int, adultId)
        .input("old_status", sqlTypes.VarChar(20), oldStatus)
        .input("new_status", sqlTypes.VarChar(20), parsed.data.status)
        .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
        .query(`
          INSERT INTO beneficiary_status_history (beneficiary_id, old_status, new_status, comment)
          VALUES (@beneficiary_id, @old_status, @new_status, @comment)
        `);
    } catch (historyError) {
      console.warn("⚠️ Could not insert adult status history:", historyError instanceof Error ? historyError.message : historyError);
    }

    // Enviar correo de notificación
    const email = existing.recordset[0].email;
    const token = existing.recordset[0].token;
    const curp = existing.recordset[0].curp;
    const fotoCredencialUrl = existing.recordset[0].foto_credencial_url;
    if (email && parsed.data.status !== "pending") {
      await sendBeneficiaryEmail(
        email,
        nombre,
        parsed.data.status as "approved" | "rejected",
        token,
        curp,
        fotoCredencialUrl,
        parsed.data.comment
      );
    }

    res.json({
      message: "Estado actualizado",
      adultId,
      nombre,
      oldStatus,
      newStatus: parsed.data.status,
    });
  } catch (error) {
    console.error("Error updating adult status:", error);
    res.status(500).json({ message: "Error al actualizar estado" });
  }
});

// =====================================================
// JÓVENES MAYORES (18-29) - Eliminar
// =====================================================

router.delete("/young-adults/:adultId", requireAdmin, async (req, res) => {
  try {
    const adultId = Number(req.params.adultId);
    if (Number.isNaN(adultId)) {
      return res.status(400).json({ message: "adultId inválido" });
    }

    const pool = await getPoolJovenes();

    // Verificar que existe
    const existing = await pool
      .request()
      .input("beneficiary_id", sqlTypes.Int, adultId)
      .query("SELECT nombre FROM young_adults WHERE beneficiary_id = @beneficiary_id");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Mayor no encontrado" });
    }

    const nombre = existing.recordset[0].nombre;

    // Eliminar mayor
    await pool
      .request()
      .input("beneficiary_id", sqlTypes.Int, adultId)
      .query("DELETE FROM young_adults WHERE beneficiary_id = @beneficiary_id");

    res.json({
      message: "Mayor eliminado correctamente",
      adultId,
      nombre,
    });
  } catch (error) {
    console.error("Error deleting adult:", error);
    res.status(500).json({ message: "Error al eliminar el mayor" });
  }
});

export { router as adminRouter };
