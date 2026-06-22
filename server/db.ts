import sql from "mssql";

// Configuración para base de datos NEGOCIOS (antes azure, solo local)
const sqlConfigNegocios: sql.config = {
  server: process.env.SQLSERVER_HOST || "localhost",
  port: process.env.SQLSERVER_PORT ? Number(process.env.SQLSERVER_PORT) : 1433,
  database: "NEGOCIOS",
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: true,
    enableArithAbort: true,
    instanceName: process.env.SQLSERVER_INSTANCE,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000,
  },
};

// Configuración para base de datos JOVENES (igual local)
const sqlConfigJovenes: sql.config = {
  server: process.env.SQLSERVER_HOST || "localhost",
  port: process.env.SQLSERVER_PORT ? Number(process.env.SQLSERVER_PORT) : 1433,
  database: "JOVENES",
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: true,
    enableArithAbort: true,
    instanceName: process.env.SQLSERVER_INSTANCE,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000,
  },
};

let poolNegocios: sql.ConnectionPool | null = null;
let poolJovenes: sql.ConnectionPool | null = null;

// Pool para base de datos NEGOCIOS (empresas/comercios)
export async function getPool(): Promise<sql.ConnectionPool> {
  if (poolNegocios && poolNegocios.connected) return poolNegocios;

  if (!sqlConfigNegocios.user || !sqlConfigNegocios.password) {
    throw new Error("Faltan credenciales de SQL Server (SQLSERVER_USER/PASSWORD)");
  }

  poolNegocios = await sql.connect(sqlConfigNegocios);
  return poolNegocios;
}

// Pool para base de datos JOVENES (jóvenes/beneficiarios)
export async function getPoolJovenes(): Promise<sql.ConnectionPool> {
  if (poolJovenes && poolJovenes.connected) return poolJovenes;

  if (!sqlConfigJovenes.user || !sqlConfigJovenes.password) {
    throw new Error("Faltan credenciales de SQL Server (SQLSERVER_USER/PASSWORD)");
  }

  poolJovenes = await sql.connect(sqlConfigJovenes);
  return poolJovenes;
}

export const sqlTypes = sql;
