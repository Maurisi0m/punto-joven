import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { getPool, sqlTypes } from "../db";
import * as bcrypt from "bcrypt";
import multer from "multer";

const router = Router();

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  businessName: z.string().min(2).max(255),
  razonSocial: z.string().min(2).max(255).optional(),
  ownerName: z.string().min(2).max(255),
  cargo: z.string().max(100).optional().or(z.literal("")),
  phone: z.string().max(32).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  zip: z.string().max(20).optional().or(z.literal("")),
  website: z.string().url().max(255).optional().or(z.literal("")),
  tipoDescuento: z.string().max(500).optional().or(z.literal("")),
  restricciones: z.string().max(1000).optional().or(z.literal("")),
  redesSociales: z.string().max(255).optional().or(z.literal("")),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  comment: z.string().max(500).optional().or(z.literal("")),
});

const ADMIN_SECRET = process.env.ADMIN_SECRET;

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

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten().fieldErrors });
  }

  const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

  if (!files?.logo || files.logo.length === 0) {
    return res.status(400).json({ message: "El logotipo es requerido" });
  }
  if (!files?.fotoEstablecimiento || files.fotoEstablecimiento.length === 0) {
    return res.status(400).json({ message: "La foto del establecimiento es requerida" });
  }

  const data = parsed.data;
  const pool = await getPool();

  const email = data.email.trim().toLowerCase();

  const existing = await pool
    .request()
    .input("email", sqlTypes.NVarChar(255), email)
    .query("SELECT business_id FROM business_accounts WHERE email = @email");
  if (existing.recordset.length > 0) {
    return res.status(409).json({ message: "El correo ya está registrado" });
  }

  const logoBase64 = files.logo[0].buffer.toString("base64");
  const logoUrl = `data:${files.logo[0].mimetype};base64,${logoBase64}`;

  const fotoBase64 = files.fotoEstablecimiento[0].buffer.toString("base64");
  const fotoUrl = `data:${files.fotoEstablecimiento[0].mimetype};base64,${fotoBase64}`;

  try {
    // Hashear contraseña
    const passwordHash = await bcrypt.hash(data.password, 10);

    const insert = await pool
      .request()
      .input("email", sqlTypes.NVarChar(255), email)
      .input("password_hash", sqlTypes.NVarChar(255), passwordHash)
      .input("business_name", sqlTypes.NVarChar(255), data.businessName.trim())
      .input("razon_social", sqlTypes.NVarChar(255), data.razonSocial?.trim() || data.businessName.trim())
      .input("owner_name", sqlTypes.NVarChar(255), data.ownerName.trim())
      .input("cargo", sqlTypes.NVarChar(100), data.cargo || null)
      .input("phone", sqlTypes.NVarChar(32), data.phone || null)
      .input("category", sqlTypes.NVarChar(100), data.category || null)
      .input("address", sqlTypes.NVarChar(500), data.address || null)
      .input("city", sqlTypes.NVarChar(100), data.city || null)
      .input("state", sqlTypes.NVarChar(100), data.state || null)
      .input("zip", sqlTypes.NVarChar(20), data.zip || null)
      .input("website", sqlTypes.NVarChar(255), data.website || null)
      .input("logo_url", sqlTypes.NVarChar(sqlTypes.MAX), logoUrl)
      .input("local_photo_url", sqlTypes.NVarChar(sqlTypes.MAX), fotoUrl)
      .input("tipoDescuento", sqlTypes.NVarChar(500), data.tipoDescuento || null)
      .input("restricciones", sqlTypes.NVarChar(1000), data.restricciones || null)
      .input("redes_sociales", sqlTypes.NVarChar(255), data.redesSociales || null)
      .query(
        `INSERT INTO business_accounts
          (email, password_hash, business_name, razon_social, owner_name, cargo, phone, category, address, city, state, zip, website, logo_url, local_photo_url, tipoDescuento, restricciones, redes_sociales, status)
         OUTPUT inserted.business_id, inserted.status, inserted.created_at
         VALUES (@email, @password_hash, @business_name, @razon_social, @owner_name, @cargo, @phone, @category, @address, @city, @state, @zip, @website, @logo_url, @local_photo_url, @tipoDescuento, @restricciones, @redes_sociales, 'pending')`
      );

    const created = insert.recordset[0];
    res.status(201).json({
      businessId: created.business_id,
      status: created.status,
      message: "Registro recibido. Tu solicitud está en revisión.",
    });
  } catch (error) {
    console.error("Error registering business:", error);
    return res.status(500).json({ message: "Error al procesar el registro. Por favor intenta de nuevo." });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Datos inválidos" });
  }
  const { email, password } = parsed.data;
  const pool = await getPool();

  const result = await pool
    .request()
    .input("email", sqlTypes.NVarChar(255), email.trim().toLowerCase())
    .query(
      `SELECT business_id, password_hash, business_name, status, status_comment, approved_at
       FROM business_accounts WHERE email = @email`
    );

  if (result.recordset.length === 0) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  const account = result.recordset[0] as any;
  const storedPassword =
    account.password_hash instanceof Buffer ? account.password_hash.toString("utf8") : account.password_hash;

  const passwordMatch = await bcrypt.compare(password, storedPassword);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  res.json({
    businessId: account.business_id,
    businessName: account.business_name,
    status: account.status,
    statusComment: account.status_comment,
    approvedAt: account.approved_at,
  });
});

// Mock data for development when database is unavailable
const mockBusinesses = [
  {
    business_id: 1,
    business_name: "La Parroquia Centro",
    category: "restaurantes",
    phone: "+52 771 123 4567",
    address: "Guerrero 102, Centro",
    city: "Pachuca",
    state: "Hidalgo",
    local_photo_url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1600&auto=format&fit=crop",
    website: "https://maps.google.com/?q=Pachuca+Guerrero+102"
  },
  {
    business_id: 2,
    business_name: "Cine Independencia",
    category: "entretenimiento",
    phone: "+52 771 234 5678",
    address: "Plaza Independencia 12",
    city: "Pachuca",
    state: "Hidalgo",
    local_photo_url: "https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1600&auto=format&fit=crop",
    website: "https://maps.google.com/?q=Pachuca+Plaza+Independencia"
  },
  {
    business_id: 3,
    business_name: "Gimnasio Atlas",
    category: "deportes",
    phone: "+52 771 345 6789",
    address: "Av. Juárez 230",
    city: "Pachuca",
    state: "Hidalgo",
    local_photo_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
    website: "https://maps.google.com/?q=Pachuca+Av+Juarez+230"
  },
  {
    business_id: 4,
    business_name: "Farmacia San Miguel",
    category: "farmacias",
    phone: "+52 771 456 7890",
    address: "Allende 150, Centro",
    city: "Pachuca",
    state: "Hidalgo",
    local_photo_url: "https://images.unsplash.com/photo-1585669324909-07a303d8e3b5?q=80&w=1600&auto=format&fit=crop",
    website: "https://maps.google.com/?q=Pachuca+Allende+150"
  },
  {
    business_id: 5,
    business_name: "Librería Cultural",
    category: "librerias",
    phone: "+52 771 567 8901",
    address: "Arista 200, Centro",
    city: "Pachuca",
    state: "Hidalgo",
    local_photo_url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop",
    website: "https://maps.google.com/?q=Pachuca+Arista+200"
  },
  {
    business_id: 6,
    business_name: "Tienda Deportiva Velocity",
    category: "tiendas",
    phone: "+52 771 678 9012",
    address: "Matamoros 320",
    city: "Pachuca",
    state: "Hidalgo",
    local_photo_url: "https://images.unsplash.com/photo-1524522252890-536e50485d3f?q=80&w=1600&auto=format&fit=crop",
    website: "https://maps.google.com/?q=Pachuca+Matamoros+320"
  },
  {
    business_id: 7,
    business_name: "Clínica de Salud Integral",
    category: "salud",
    phone: "+52 771 789 0123",
    address: "Zaragoza 150, Centro",
    city: "Pachuca",
    state: "Hidalgo",
    local_photo_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1600&auto=format&fit=crop",
    website: "https://maps.google.com/?q=Pachuca+Zaragoza+150",
    approved_at: new Date().toISOString()
  }
];

// Listado público de comercios aprobados
router.get("/approved", async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT business_id, business_name, category, phone, address, city, state, local_photo_url, website, tipoDescuento, restricciones, approved_at
       FROM business_accounts WHERE status = 'approved' ORDER BY created_at DESC`
    );
    res.json({ items: result.recordset });
  } catch (error) {
    console.error("Error fetching approved businesses from database:", error);
    console.log("Returning mock data for development...");
    // Return mock data when database is unavailable
    res.json({ items: mockBusinesses });
  }
});

// Listado protegido para admins
router.get("/admin", requireAdmin, async (_req, res) => {
  const pool = await getPool();
  const result = await pool.request().query(
    `SELECT business_id, email, business_name, razon_social, owner_name, cargo, phone, category, address, city, state, website, redes_sociales, tipoDescuento, restricciones, logo_url, local_photo_url, status, status_comment, created_at, approved_at
     FROM business_accounts ORDER BY created_at DESC`
  );
  res.json({ items: result.recordset });
});

// Cambiar status protegido
router.post("/admin/:businessId/status", requireAdmin, async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten().fieldErrors });
  }
  const businessId = Number(req.params.businessId);
  if (Number.isNaN(businessId)) return res.status(400).json({ message: "businessId inválido" });

  const pool = await getPool();
  const current = await pool
    .request()
    .input("business_id", sqlTypes.Int, businessId)
    .query("SELECT status FROM business_accounts WHERE business_id = @business_id");

  if (current.recordset.length === 0) {
    return res.status(404).json({ message: "Negocio no encontrado" });
  }
  const oldStatus = current.recordset[0].status;

  await pool
    .request()
    .input("status", sqlTypes.VarChar(20), parsed.data.status)
    .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
    .input("business_id", sqlTypes.Int, businessId)
    .query(
      `UPDATE business_accounts
       SET status = @status,
           status_comment = @comment,
           approved_at = CASE WHEN @status = 'approved' THEN SYSUTCDATETIME() ELSE approved_at END
       WHERE business_id = @business_id`
    );

  await pool
    .request()
    .input("business_id", sqlTypes.Int, businessId)
    .input("old_status", sqlTypes.VarChar(20), oldStatus)
    .input("new_status", sqlTypes.VarChar(20), parsed.data.status)
    .input("comment", sqlTypes.NVarChar(500), parsed.data.comment || null)
    .query(
      `INSERT INTO business_status_history (business_id, old_status, new_status, comment)
       VALUES (@business_id, @old_status, @new_status, @comment)`
    );

  res.json({ message: "Estatus actualizado", newStatus: parsed.data.status });
});

// Ver perfil del negocio
router.get("/profile", async (req, res) => {
  const businessId = req.headers["x-business-id"];
  if (!businessId) return res.status(401).json({ message: "No autorizado" });

  const pool = await getPool();
  const result = await pool.request()
    .input("business_id", sqlTypes.Int, Number(businessId))
    .query(`
      SELECT business_id, email, business_name, razon_social, owner_name, cargo, 
             phone, category, address, website, redes_sociales, tipoDescuento, 
             restricciones, logo_url, local_photo_url, status
      FROM business_accounts
      WHERE business_id = @business_id
    `);

  if (result.recordset.length === 0) return res.status(404).json({ message: "No encontrado" });
  res.json(result.recordset[0]);
});

// Update perfil
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
router.put("/profile", upload.fields([ { name: "logo", maxCount: 1 }, { name: "fotoEstablecimiento", maxCount: 1 } ]), async (req, res) => {
  const businessId = req.headers["x-business-id"];
  if (!businessId) return res.status(401).json({ message: "No autorizado" });
  
  try {
    const data = req.body;
    const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;
    const pool = await getPool();

    // Comprobar negocio y estado
    const current = await pool.request().input("business_id", sqlTypes.Int, Number(businessId)).query("SELECT status, logo_url, local_photo_url FROM business_accounts WHERE business_id = @business_id");
    if (current.recordset.length === 0) return res.status(404).json({ message: "No encontrado" });
    if (current.recordset[0].status !== "approved") return res.status(403).json({ message: "El negocio debe estar aprobado para cambiar datos" });

    let logoUrl = current.recordset[0].logo_url;
    if (files?.logo?.length) {
      const b64 = files.logo[0].buffer.toString("base64");
      logoUrl = `data:${files.logo[0].mimetype};base64,${b64}`;
    }

    let fotoUrl = current.recordset[0].local_photo_url;
    if (files?.fotoEstablecimiento?.length) {
      const b64 = files.fotoEstablecimiento[0].buffer.toString("base64");
      fotoUrl = `data:${files.fotoEstablecimiento[0].mimetype};base64,${b64}`;
    }

    await pool.request()
      .input("business_id", sqlTypes.Int, Number(businessId))
      .input("business_name", sqlTypes.NVarChar(255), data.business_name || null)
      .input("razon_social", sqlTypes.NVarChar(255), data.razon_social || null)
      .input("phone", sqlTypes.NVarChar(32), data.phone || null)
      .input("address", sqlTypes.NVarChar(500), data.address || null)
      .input("website", sqlTypes.NVarChar(255), data.website || null)
      .input("tipoDescuento", sqlTypes.NVarChar(500), data.tipoDescuento || null)
      .input("restricciones", sqlTypes.NVarChar(1000), data.restricciones || null)
      .input("logo_url", sqlTypes.NVarChar(sqlTypes.MAX), logoUrl)
      .input("local_photo_url", sqlTypes.NVarChar(sqlTypes.MAX), fotoUrl)
      .query(`
        UPDATE business_accounts SET 
          business_name = COALESCE(@business_name, business_name),
          razon_social = COALESCE(@razon_social, razon_social),
          phone = COALESCE(@phone, phone),
          address = COALESCE(@address, address),
          website = COALESCE(@website, website),
          tipoDescuento = COALESCE(@tipoDescuento, tipoDescuento),
          restricciones = COALESCE(@restricciones, restricciones),
          logo_url = @logo_url,
          local_photo_url = @local_photo_url,
          updated_at = SYSUTCDATETIME()
        WHERE business_id = @business_id
      `);

    res.json({ message: "Perfil actualizado correctamente", logo_url: logoUrl, local_photo_url: fotoUrl });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
});

export { router as businessRouter };
