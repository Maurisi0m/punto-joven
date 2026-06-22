import { getPool, getPoolJovenes } from "./db";

export async function initializeDatabase() {
  try {
    // Inicializar tablas de EMPRESAS
    const negociosPool = await getPool();

    const businessAccountsScript = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'business_accounts' AND TABLE_SCHEMA = 'dbo')
      BEGIN
          CREATE TABLE dbo.business_accounts (
              business_id INT IDENTITY(1,1) PRIMARY KEY,
              email NVARCHAR(255) NOT NULL UNIQUE,
              password_hash NVARCHAR(255) NOT NULL,
              business_name NVARCHAR(255) NOT NULL,
              owner_name NVARCHAR(255) NOT NULL,
              phone NVARCHAR(32),
              category NVARCHAR(100),
              address NVARCHAR(500),
              city NVARCHAR(100),
              state NVARCHAR(100),
              zip NVARCHAR(20),
              website NVARCHAR(255),
              logo_url NVARCHAR(MAX),
              local_photo_url NVARCHAR(MAX),
              tipoDescuento NVARCHAR(500),
              restricciones NVARCHAR(1000),
              razon_social NVARCHAR(255),
              cargo NVARCHAR(100),
              redes_sociales NVARCHAR(255),
              status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
              status_comment NVARCHAR(500),
              created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
              approved_at DATETIME2,
              updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
          );

          CREATE INDEX idx_business_accounts_email ON dbo.business_accounts(email);
          CREATE INDEX idx_business_accounts_status ON dbo.business_accounts(status);
          CREATE INDEX idx_business_accounts_created_at ON dbo.business_accounts(created_at DESC);
          PRINT 'business_accounts table created successfully';
      END
    `;

    const businessStatusHistoryScript = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'business_status_history' AND TABLE_SCHEMA = 'dbo')
      BEGIN
          CREATE TABLE dbo.business_status_history (
              history_id INT IDENTITY(1,1) PRIMARY KEY,
              business_id INT NOT NULL,
              old_status VARCHAR(20),
              new_status VARCHAR(20) NOT NULL,
              comment NVARCHAR(500),
              changed_at DATETIME2 DEFAULT SYSUTCDATETIME(),
              FOREIGN KEY (business_id) REFERENCES dbo.business_accounts(business_id) ON DELETE CASCADE
          );

          CREATE INDEX idx_business_status_history_business_id ON dbo.business_status_history(business_id);
          CREATE INDEX idx_business_status_history_changed_at ON dbo.business_status_history(changed_at DESC);
          PRINT 'business_status_history table created successfully';
      END
    `;

    await negociosPool.request().query(businessAccountsScript);
    await negociosPool.request().query(businessStatusHistoryScript);

    // Inicializar tablas de BENEFICIOS (BENEFICIOS DB)
    const jovenesPool = await getPoolJovenes();

    // Tabla para jóvenes MAYORES de edad (18-29 años)
    const youngAdultsScript = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'young_adults')
      BEGIN
          CREATE TABLE dbo.young_adults (
              beneficiary_id INT IDENTITY(1,1) PRIMARY KEY,
              email NVARCHAR(255) NOT NULL UNIQUE,
              password_hash NVARCHAR(255) NOT NULL,
              nombre NVARCHAR(255) NOT NULL,
              apellido_paterno NVARCHAR(255) NOT NULL,
              apellido_materno NVARCHAR(255) NOT NULL,
              curp VARCHAR(18) NOT NULL UNIQUE,
              fecha_nacimiento DATE NOT NULL,
              edad INT,
              grado_estudio NVARCHAR(50),
              ocupacion NVARCHAR(255),
              phone NVARCHAR(32) NOT NULL,
              calle NVARCHAR(500) NOT NULL,
              municipio NVARCHAR(100) NOT NULL,
              estado NVARCHAR(100) NOT NULL,
              pais NVARCHAR(100),
              ine_url NVARCHAR(MAX),
              comprobante_domicilio_url NVARCHAR(MAX),
              foto_credencial_url NVARCHAR(MAX),
              status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
              status_comment NVARCHAR(500),
              created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
              approved_at DATETIME2,
              updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
          );

          CREATE INDEX idx_young_adults_email ON dbo.young_adults(email);
          CREATE INDEX idx_young_adults_curp ON dbo.young_adults(curp);
          CREATE INDEX idx_young_adults_status ON dbo.young_adults(status);
          CREATE INDEX idx_young_adults_created_at ON dbo.young_adults(created_at DESC);
          PRINT 'young_adults table created successfully';
      END
    `;

    // Tabla para jóvenes MENORES de edad (12-17 años) con datos del padre/tutor
    const youngMinorsScript = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'young_minors')
      BEGIN
          CREATE TABLE dbo.young_minors (
              minor_id INT IDENTITY(1,1) PRIMARY KEY,
              email NVARCHAR(255) NOT NULL UNIQUE,
              password_hash NVARCHAR(255) NOT NULL,

              -- Datos del padre/tutor
              tutor_nombre NVARCHAR(255) NOT NULL,
              tutor_apellido_paterno NVARCHAR(255) NOT NULL,
              tutor_apellido_materno NVARCHAR(255) NOT NULL,
              tutor_fecha_nacimiento DATE NOT NULL,
              tutor_curp VARCHAR(18) NOT NULL,
              tutor_parentesco NVARCHAR(100) NOT NULL,
              tutor_ine_url NVARCHAR(MAX),
              tutor_domicilio NVARCHAR(500) NOT NULL,

              -- Datos del menor
              nombre NVARCHAR(255) NOT NULL,
              apellido_paterno NVARCHAR(255) NOT NULL,
              apellido_materno NVARCHAR(255) NOT NULL,
              curp VARCHAR(18) NOT NULL UNIQUE,
              fecha_nacimiento DATE NOT NULL,
              edad INT,
              credencial_escolar_url NVARCHAR(MAX),
              phone NVARCHAR(32),
              calle NVARCHAR(500) NOT NULL,
              municipio NVARCHAR(100) NOT NULL,
              estado NVARCHAR(100) NOT NULL,
              pais NVARCHAR(100),
              foto_credencial_url NVARCHAR(MAX),

              status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
              status_comment NVARCHAR(500),
              created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
              approved_at DATETIME2,
              updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
          );

          CREATE INDEX idx_young_minors_email ON dbo.young_minors(email);
          CREATE INDEX idx_young_minors_curp ON dbo.young_minors(curp);
          CREATE INDEX idx_young_minors_status ON dbo.young_minors(status);
          CREATE INDEX idx_young_minors_created_at ON dbo.young_minors(created_at DESC);
          PRINT 'young_minors table created successfully';
      END
    `;

    // Tabla de referencia para jóvenes MAYORES (mantener compatibilidad)
    const youngBeneficiariesScript = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'young_beneficiaries')
      BEGIN
          CREATE TABLE dbo.young_beneficiaries (
              beneficiary_id INT IDENTITY(1,1) PRIMARY KEY,
              email NVARCHAR(255) NOT NULL UNIQUE,
              password_hash NVARCHAR(255) NOT NULL,
              nombre NVARCHAR(255) NOT NULL,
              apellido_paterno NVARCHAR(255) NOT NULL,
              apellido_materno NVARCHAR(255) NOT NULL,
              curp VARCHAR(18) NOT NULL UNIQUE,
              fecha_nacimiento DATE NOT NULL,
              edad INT,
              estudio NVARCHAR(50),
              genero NVARCHAR(20),
              phone NVARCHAR(32) NOT NULL,
              calle NVARCHAR(500) NOT NULL,
              colonia_depa NVARCHAR(255),
              ciudad NVARCHAR(100) NOT NULL,
              municipio NVARCHAR(100) NOT NULL,
              estado NVARCHAR(100) NOT NULL,
              foto_url NVARCHAR(MAX),
              status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
              status_comment NVARCHAR(500),
              created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
              approved_at DATETIME2,
              updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
          );

          CREATE INDEX idx_young_beneficiaries_email ON dbo.young_beneficiaries(email);
          CREATE INDEX idx_young_beneficiaries_curp ON dbo.young_beneficiaries(curp);
          CREATE INDEX idx_young_beneficiaries_status ON dbo.young_beneficiaries(status);
          CREATE INDEX idx_young_beneficiaries_created_at ON dbo.young_beneficiaries(created_at DESC);
          PRINT 'young_beneficiaries table created successfully';
      END
    `;

    const beneficiaryStatusHistoryScript = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'beneficiary_status_history')
      BEGIN
          CREATE TABLE dbo.beneficiary_status_history (
              history_id INT IDENTITY(1,1) PRIMARY KEY,
              beneficiary_id INT NOT NULL,
              old_status VARCHAR(20),
              new_status VARCHAR(20) NOT NULL,
              comment NVARCHAR(500),
              changed_at DATETIME2 DEFAULT SYSUTCDATETIME()
          );

          CREATE INDEX idx_beneficiary_status_history_beneficiary_id ON dbo.beneficiary_status_history(beneficiary_id);
          CREATE INDEX idx_beneficiary_status_history_changed_at ON dbo.beneficiary_status_history(changed_at DESC);
          PRINT 'beneficiary_status_history table created successfully';
      END
    `;

    await jovenesPool.request().query(youngAdultsScript);
    await jovenesPool.request().query(youngMinorsScript);
    await jovenesPool.request().query(youngBeneficiariesScript);
    await jovenesPool.request().query(beneficiaryStatusHistoryScript);

    // Eliminar la restriccion de llave foranea si existe para evitar conflictos con menores y adultos
    const dropFkScript = `
      DECLARE @sql NVARCHAR(MAX) = '';
      SELECT @sql = @sql + 'ALTER TABLE dbo.beneficiary_status_history DROP CONSTRAINT ' + QUOTENAME(fk.name) + ';' + CHAR(13)
      FROM sys.foreign_keys fk
      INNER JOIN sys.tables t ON fk.parent_object_id = t.object_id
      INNER JOIN sys.tables rt ON fk.referenced_object_id = rt.object_id
      WHERE t.name = 'beneficiary_status_history' AND rt.name = 'young_beneficiaries';

      IF @sql <> ''
      BEGIN
          EXEC sp_executesql @sql;
          PRINT 'Dropped foreign key constraints from beneficiary_status_history referencing young_beneficiaries';
      END
    `;
    await jovenesPool.request().query(dropFkScript);

    // Actualizar esquemas de DB para usar token digital
    const alterTablesTokenScript = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_adults' AND COLUMN_NAME = 'token')
      BEGIN
          ALTER TABLE dbo.young_adults ADD token VARCHAR(255);
          EXEC('UPDATE dbo.young_adults SET token = CAST(NEWID() AS VARCHAR(255)) WHERE token IS NULL');
          ALTER TABLE dbo.young_adults ADD CONSTRAINT UQ_young_adults_token UNIQUE (token);
          PRINT 'Added token column to young_adults';
      END
      
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_minors' AND COLUMN_NAME = 'token')
      BEGIN
          ALTER TABLE dbo.young_minors ADD token VARCHAR(255);
          EXEC('UPDATE dbo.young_minors SET token = CAST(NEWID() AS VARCHAR(255)) WHERE token IS NULL');
          ALTER TABLE dbo.young_minors ADD CONSTRAINT UQ_young_minors_token UNIQUE (token);
          PRINT 'Added token column to young_minors';
      END

      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'token')
      BEGIN
          ALTER TABLE dbo.young_beneficiaries ADD token VARCHAR(255);
          EXEC('UPDATE dbo.young_beneficiaries SET token = CAST(NEWID() AS VARCHAR(255)) WHERE token IS NULL');
          ALTER TABLE dbo.young_beneficiaries ADD CONSTRAINT UQ_young_beneficiaries_token UNIQUE (token);
          PRINT 'Added token column to young_beneficiaries';
      END
    `;
    await jovenesPool.request().query(alterTablesTokenScript);

    // Actualizar esquema de EMPRESAS para los campos descartados
    const alterBusinessTablesScript = `
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'business_accounts' AND COLUMN_NAME = 'razon_social')
      BEGIN
          ALTER TABLE dbo.business_accounts ADD razon_social NVARCHAR(255), cargo NVARCHAR(100), redes_sociales NVARCHAR(255);
          PRINT 'Added razon_social, cargo, redes_sociales column to business_accounts';
      END
      
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'business_accounts' AND COLUMN_NAME = 'tipoDescuento')
      BEGIN
          ALTER TABLE dbo.business_accounts ADD tipoDescuento NVARCHAR(500), restricciones NVARCHAR(1000);
          PRINT 'Added tipoDescuento, restricciones column to business_accounts';
      END
    `;
    await negociosPool.request().query(alterBusinessTablesScript);

    console.log("Se inicializaron las bases de datos correctamente (JOVENES y NEGOCIOS)");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
