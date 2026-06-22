import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { handleDemo } from "./routes/demo";
import { businessRouter } from "./routes/business";
import { jovenRouter } from "./routes/joven";
import { adminRouter } from "./routes/admin";
import { initializeDatabase } from "./db-init";
import { getPool, getPoolJovenes, sqlTypes } from "./db";

export async function createServer() {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Configure multer for file uploads (memory storage for simplicity)
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
  app.use("/api/business/register", upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "fotoEstablecimiento", maxCount: 1 }
  ]));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.get("/api/public/stats", async (_req, res) => {
    try {
      const { getPool, getPoolJovenes } = await import("./db");
      const pool = await getPool();
      const poolJovenes = await getPoolJovenes();
      
      const businessesResult = await pool.request().query("SELECT COUNT(*) as count FROM business_accounts WHERE status = 'approved'");
      const businessesCount = businessesResult.recordset[0].count;

      let beneficiariesCount = 0;
      
      try {
        const minors = await poolJovenes.request().query("SELECT COUNT(*) as count FROM young_minors WHERE status = 'approved'");
        beneficiariesCount += minors.recordset[0].count;
      } catch (e) {}
      
      try {
        const adults = await poolJovenes.request().query("SELECT COUNT(*) as count FROM young_adults WHERE status = 'approved'");
        beneficiariesCount += adults.recordset[0].count;
      } catch (e) {}

      try {
        const legacy = await poolJovenes.request().query("SELECT COUNT(*) as count FROM young_beneficiaries WHERE status = 'approved'");
        beneficiariesCount += legacy.recordset[0].count;
      } catch (e) {}

      res.json({
        businesses: businessesCount,
        beneficiaries: beneficiariesCount
      });
    } catch (error) {
      console.error("Error fetching public stats:", error);
      res.json({ businesses: 50, beneficiaries: 2000 }); // Fallback
    }
  });
  // Validation endpoint for QR codes
  app.get("/api/public/validar/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const poolJovenes = await getPoolJovenes();
      
      // Check in young_minors
      try {
        const minor = await poolJovenes.request().input("token", sqlTypes.VarChar, token).query(`
          SELECT nombre, apellido_paterno, apellido_materno, curp, email, foto_credencial_url, status, 'minor' as type
          FROM young_minors WHERE token = @token
        `);
        if (minor.recordset.length > 0) return res.json(minor.recordset[0]);
      } catch(e) {}

      // Check in young_adults
      try {
        const adult = await poolJovenes.request().input("token", sqlTypes.VarChar, token).query(`
          SELECT nombre, apellido_paterno, apellido_materno, curp, email, foto_credencial_url, status, 'adult' as type
          FROM young_adults WHERE token = @token
        `);
        if (adult.recordset.length > 0) return res.json(adult.recordset[0]);
      } catch(e) {}

      // Check in legacy young_beneficiaries
      try {
        const legacy = await poolJovenes.request().input("token", sqlTypes.VarChar, token).query(`
          SELECT nombre, apellido_paterno, apellido_materno, curp, email, foto_url as foto_credencial_url, status, 'legacy' as type
          FROM young_beneficiaries WHERE token = @token
        `);
        if (legacy.recordset.length > 0) return res.json(legacy.recordset[0]);
      } catch(e) {}

      return res.status(404).json({ message: "Credencial no encontrada o token inválido." });
    } catch (error) {
      console.error("Error validando token:", error);
      res.status(500).json({ message: "Error interno validando credencial" });
    }
  });


  // Business auth + admin review
  app.use("/api/business", businessRouter);

  // Young beneficiaries registration + login
  app.use("/api/joven", jovenRouter);

  // Admin panel routes
  app.use("/api/admin", adminRouter);

  return app;
}
