import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { getPoolJovenes, sqlTypes } from "../db";
import multer from "multer";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

const router = Router();

// Configurar multer con límite de 50MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ===================================
// HANDLERS REUTILIZABLES
// ===================================

const handleRegisterMinor: RequestHandler = async (req, res) => {
  try {
    const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

    if (!files?.tutor_ine || files.tutor_ine.length === 0) {
      return res.status(400).json({ message: "INE del tutor requerida" });
    }
    if (!files?.credencial_escolar || files.credencial_escolar.length === 0) {
      return res.status(400).json({ message: "Credencial escolar requerida" });
    }
    if (!files?.foto_credencial || files.foto_credencial.length === 0) {
      return res.status(400).json({ message: "Foto para credencial requerida" });
    }

    const {
      tutor_nombre, tutor_apellido_paterno, tutor_apellido_materno,
      tutor_fecha_nacimiento, tutor_curp, tutor_parentesco, tutor_domicilio,
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, curp,
      phone, calle, municipio, estado, pais, email, password
    } = req.body;

    const pool = await getPoolJovenes();
    const email_lower = email.trim().toLowerCase();

    // Verificar si email ya existe
    const existing = await pool
      .request()
      .input("email", sqlTypes.NVarChar(255), email_lower)
      .query("SELECT minor_id FROM young_minors WHERE email = @email");

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Convertir archivos a base64
    const tutor_ine_base64 = files.tutor_ine[0].buffer.toString("base64");
    const tutor_ine_url = `data:${files.tutor_ine[0].mimetype};base64,${tutor_ine_base64}`;

    const credencial_base64 = files.credencial_escolar[0].buffer.toString("base64");
    const credencial_url = `data:${files.credencial_escolar[0].mimetype};base64,${credencial_base64}`;

    const foto_base64 = files.foto_credencial[0].buffer.toString("base64");
    const foto_url = `data:${files.foto_credencial[0].mimetype};base64,${foto_base64}`;

    const token = crypto.randomUUID();

    // Insertar en BD
    const insert = await pool
      .request()
      .input("token", sqlTypes.VarChar(255), token)
      .input("email", sqlTypes.NVarChar(255), email_lower)
      .input("password_hash", sqlTypes.NVarChar(255), passwordHash)
      .input("tutor_nombre", sqlTypes.NVarChar(255), tutor_nombre.trim())
      .input("tutor_apellido_paterno", sqlTypes.NVarChar(255), tutor_apellido_paterno.trim())
      .input("tutor_apellido_materno", sqlTypes.NVarChar(255), tutor_apellido_materno.trim())
      .input("tutor_fecha_nacimiento", sqlTypes.Date, tutor_fecha_nacimiento)
      .input("tutor_curp", sqlTypes.VarChar(18), tutor_curp.toUpperCase())
      .input("tutor_parentesco", sqlTypes.NVarChar(100), tutor_parentesco)
      .input("tutor_ine_url", sqlTypes.NVarChar(sqlTypes.MAX), tutor_ine_url)
      .input("tutor_domicilio", sqlTypes.NVarChar(500), tutor_domicilio.trim())
      .input("nombre", sqlTypes.NVarChar(255), nombre.trim())
      .input("apellido_paterno", sqlTypes.NVarChar(255), apellido_paterno.trim())
      .input("apellido_materno", sqlTypes.NVarChar(255), apellido_materno.trim())
      .input("curp", sqlTypes.VarChar(18), curp.toUpperCase())
      .input("fecha_nacimiento", sqlTypes.Date, fecha_nacimiento)
      .input("credencial_escolar_url", sqlTypes.NVarChar(sqlTypes.MAX), credencial_url)
      .input("phone", sqlTypes.NVarChar(32), phone || null)
      .input("calle", sqlTypes.NVarChar(500), calle.trim())
      .input("municipio", sqlTypes.NVarChar(100), municipio.trim())
      .input("estado", sqlTypes.NVarChar(100), estado.trim())
      .input("pais", sqlTypes.NVarChar(100), pais.trim())
      .input("foto_credencial_url", sqlTypes.NVarChar(sqlTypes.MAX), foto_url)
      .query(
        `INSERT INTO young_minors (
          token, email, password_hash, tutor_nombre, tutor_apellido_paterno, tutor_apellido_materno,
          tutor_fecha_nacimiento, tutor_curp, tutor_parentesco, tutor_ine_url, tutor_domicilio,
          nombre, apellido_paterno, apellido_materno, curp, fecha_nacimiento,
          credencial_escolar_url, phone, calle, municipio, estado, pais, foto_credencial_url, status
        ) OUTPUT inserted.minor_id, inserted.status
        VALUES (@token, @email, @password_hash, @tutor_nombre, @tutor_apellido_paterno, @tutor_apellido_materno,
          @tutor_fecha_nacimiento, @tutor_curp, @tutor_parentesco, @tutor_ine_url, @tutor_domicilio,
          @nombre, @apellido_paterno, @apellido_materno, @curp, @fecha_nacimiento,
          @credencial_escolar_url, @phone, @calle, @municipio, @estado, @pais, @foto_credencial_url, 'pending')`
      );

    const created = insert.recordset[0];
    res.status(201).json({
      minorId: created.minor_id,
      status: created.status,
      message: "Registro recibido. Tu solicitud está en revisión.",
    });
  } catch (error) {
    console.error("Error registering minor:", error);
    res.status(500).json({ message: "Error al procesar el registro. Por favor intenta de nuevo." });
  }
};

const handleRegisterAdult: RequestHandler = async (req, res) => {
  try {
    const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

    if (!files?.ine || files.ine.length === 0) {
      return res.status(400).json({ message: "INE requerida" });
    }
    if (!files?.comprobante_domicilio || files.comprobante_domicilio.length === 0) {
      return res.status(400).json({ message: "Comprobante de domicilio requerido" });
    }
    if (!files?.foto_credencial || files.foto_credencial.length === 0) {
      return res.status(400).json({ message: "Foto para credencial requerida" });
    }

    const {
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, curp,
      grado_estudio, ocupacion, phone, calle, municipio, estado, pais,
      email, password
    } = req.body;

    const pool = await getPoolJovenes();
    const email_lower = email.trim().toLowerCase();

    // Verificar si email ya existe
    const existing = await pool
      .request()
      .input("email", sqlTypes.NVarChar(255), email_lower)
      .query("SELECT beneficiary_id FROM young_adults WHERE email = @email");

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Convertir archivos a base64
    const ine_base64 = files.ine[0].buffer.toString("base64");
    const ine_url = `data:${files.ine[0].mimetype};base64,${ine_base64}`;

    const comprobante_base64 = files.comprobante_domicilio[0].buffer.toString("base64");
    const comprobante_url = `data:${files.comprobante_domicilio[0].mimetype};base64,${comprobante_base64}`;

    const foto_base64 = files.foto_credencial[0].buffer.toString("base64");
    const foto_url = `data:${files.foto_credencial[0].mimetype};base64,${foto_base64}`;

    const token = crypto.randomUUID();

    // Insertar en BD
    const insert = await pool
      .request()
      .input("token", sqlTypes.VarChar(255), token)
      .input("email", sqlTypes.NVarChar(255), email_lower)
      .input("password_hash", sqlTypes.NVarChar(255), passwordHash)
      .input("nombre", sqlTypes.NVarChar(255), nombre.trim())
      .input("apellido_paterno", sqlTypes.NVarChar(255), apellido_paterno.trim())
      .input("apellido_materno", sqlTypes.NVarChar(255), apellido_materno.trim())
      .input("curp", sqlTypes.VarChar(18), curp.toUpperCase())
      .input("fecha_nacimiento", sqlTypes.Date, fecha_nacimiento)
      .input("grado_estudio", sqlTypes.NVarChar(50), grado_estudio)
      .input("ocupacion", sqlTypes.NVarChar(255), ocupacion.trim())
      .input("phone", sqlTypes.NVarChar(32), phone)
      .input("calle", sqlTypes.NVarChar(500), calle.trim())
      .input("municipio", sqlTypes.NVarChar(100), municipio.trim())
      .input("estado", sqlTypes.NVarChar(100), estado.trim())
      .input("pais", sqlTypes.NVarChar(100), pais.trim())
      .input("ine_url", sqlTypes.NVarChar(sqlTypes.MAX), ine_url)
      .input("comprobante_domicilio_url", sqlTypes.NVarChar(sqlTypes.MAX), comprobante_url)
      .input("foto_credencial_url", sqlTypes.NVarChar(sqlTypes.MAX), foto_url)
      .query(
        `INSERT INTO young_adults (
          token, email, password_hash, nombre, apellido_paterno, apellido_materno,
          curp, fecha_nacimiento, grado_estudio, ocupacion, phone, calle,
          municipio, estado, pais, ine_url, comprobante_domicilio_url, foto_credencial_url, status
        ) OUTPUT inserted.beneficiary_id, inserted.status
        VALUES (@token, @email, @password_hash, @nombre, @apellido_paterno, @apellido_materno,
          @curp, @fecha_nacimiento, @grado_estudio, @ocupacion, @phone, @calle,
          @municipio, @estado, @pais, @ine_url, @comprobante_domicilio_url, @foto_credencial_url, 'pending')`
      );

    const created = insert.recordset[0];
    res.status(201).json({
      beneficiaryId: created.beneficiary_id,
      status: created.status,
      message: "Registro recibido. Tu solicitud está en revisión.",
    });
  } catch (error) {
    console.error("Error registering adult:", error);
    res.status(500).json({ message: "Error al procesar el registro. Por favor intenta de nuevo." });
  }
};

// ===================================
// JÓVENES MENORES DE EDAD (12-17)
// ===================================

router.post("/register-minor", upload.fields([
  { name: "tutor_ine", maxCount: 1 },
  { name: "credencial_escolar", maxCount: 1 },
  { name: "foto_credencial", maxCount: 1 },
]), handleRegisterMinor);

// ===================================
// JÓVENES MAYORES DE EDAD (18-29)
// ===================================

router.post("/register-adult", upload.fields([
  { name: "ine", maxCount: 1 },
  { name: "comprobante_domicilio", maxCount: 1 },
  { name: "foto_credencial", maxCount: 1 },
]), handleRegisterAdult);

// ===================================
// ENRUTADOR AUTOMÁTICO POR EDAD
// ===================================

router.post("/register", upload.fields([
  { name: "tutor_ine", maxCount: 1 },
  { name: "credencial_escolar", maxCount: 1 },
  { name: "ine", maxCount: 1 },
  { name: "comprobante_domicilio", maxCount: 1 },
  { name: "foto_credencial", maxCount: 1 },
]), async (req, res, next) => {
  try {
    const { fecha_nacimiento } = req.body;

    if (!fecha_nacimiento) {
      return res.status(400).json({ message: "Fecha de nacimiento requerida" });
    }

    const birthDate = new Date(fecha_nacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Enrutar según edad
    if (age < 18) {
      return handleRegisterMinor(req, res, next);
    } else {
      return handleRegisterAdult(req, res, next);
    }
  } catch (error) {
    console.error("Error routing register request:", error);
    res.status(500).json({ message: "Error al procesar el registro. Por favor intenta de nuevo." });
  }
});

// ===================================
// OBTENER CREDENCIAL POR TOKEN
// ===================================

router.get("/credencial/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const pool = await getPoolJovenes();

    // Buscar en menores
    let result = await pool.request()
      .input("token", sqlTypes.VarChar(255), token)
      .query("SELECT nombre, apellido_paterno, apellido_materno, curp, email, foto_credencial_url, created_at, status FROM young_minors WHERE token = @token");
      
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      if (user.status !== 'approved') return res.status(403).json({ message: "La credencial aún no ha sido aprobada." });
      
      return res.json({
        token,
        nombre: `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`,
        curp: user.curp,
        email: user.email,
        fotoDataUrl: user.foto_credencial_url,
        createdAt: user.created_at
      });
    }

    // Buscar en mayores
    result = await pool.request()
      .input("token", sqlTypes.VarChar(255), token)
      .query("SELECT nombre, apellido_paterno, apellido_materno, curp, email, foto_credencial_url, created_at, status FROM young_adults WHERE token = @token");

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      if (user.status !== 'approved') return res.status(403).json({ message: "La credencial aún no ha sido aprobada." });

      return res.json({
        token,
        nombre: `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`,
        curp: user.curp,
        email: user.email,
        fotoDataUrl: user.foto_credencial_url,
        createdAt: user.created_at
      });
    }

    // Buscar en legacy (young_beneficiaries)
    result = await pool.request()
      .input("token", sqlTypes.VarChar(255), token)
      .query("SELECT nombre, apellido_paterno, apellido_materno, curp, email, foto_url, created_at, status FROM young_beneficiaries WHERE token = @token");

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      if (user.status !== 'approved') return res.status(403).json({ message: "La credencial aún no ha sido aprobada." });

      return res.json({
        token,
        nombre: `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno}`,
        curp: user.curp,
        email: user.email,
        fotoDataUrl: user.foto_url,
        createdAt: user.created_at
      });
    }

    return res.status(404).json({ message: "Credencial no encontrada" });
  } catch (error) {
    console.error("Error al buscar credencial:", error);
    res.status(500).json({ message: "Error al recuperar la credencial" });
  }
});

export { router as jovenRouter };
