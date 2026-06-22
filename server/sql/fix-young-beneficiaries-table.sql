-- =====================================================
-- REPARAR TABLA young_beneficiaries
-- =====================================================
-- Este script agrega las columnas faltantes a la tabla existente
-- O recrea la tabla si es necesario
-- =====================================================

USE [JOVENES];

GO

-- Verificar estructura actual
PRINT 'Verificando estructura actual de young_beneficiaries...';
GO

-- Si la tabla existe y le faltan columnas, agregarlas
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'young_beneficiaries' AND TABLE_SCHEMA = 'dbo')
BEGIN
    -- Agregar columnas faltantes si no existen
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'apellido_paterno')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD apellido_paterno NVARCHAR(255);
        PRINT 'Columna apellido_paterno agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'apellido_materno')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD apellido_materno NVARCHAR(255);
        PRINT 'Columna apellido_materno agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'estudio')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD estudio NVARCHAR(50);
        PRINT 'Columna estudio agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'calle')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD calle NVARCHAR(500);
        PRINT 'Columna calle agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'colonia_depa')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD colonia_depa NVARCHAR(255);
        PRINT 'Columna colonia_depa agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'ciudad')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD ciudad NVARCHAR(100);
        PRINT 'Columna ciudad agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'municipio')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD municipio NVARCHAR(100);
        PRINT 'Columna municipio agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'estado')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD estado NVARCHAR(100);
        PRINT 'Columna estado agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'edad')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD edad INT;
        PRINT 'Columna edad agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'genero')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD genero NVARCHAR(20);
        PRINT 'Columna genero agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'phone')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD phone NVARCHAR(32);
        PRINT 'Columna phone agregada ✓';
    END

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'young_beneficiaries' AND COLUMN_NAME = 'foto_url')
    BEGIN
        ALTER TABLE dbo.young_beneficiaries ADD foto_url NVARCHAR(MAX);
        PRINT 'Columna foto_url agregada ✓';
    END

    PRINT '';
    PRINT 'Tabla young_beneficiaries actualizada exitosamente ✓';
END
ELSE
BEGIN
    PRINT 'Recreando tabla young_beneficiaries completa...';
    
    -- Eliminar tabla si existe
    DROP TABLE IF EXISTS dbo.beneficiary_status_history;
    DROP TABLE IF EXISTS dbo.young_beneficiaries_documents;
    DROP TABLE IF EXISTS dbo.young_beneficiaries_audit_log;
    DROP TABLE IF EXISTS dbo.young_beneficiaries;
    
    -- Crear tabla nueva con todos los campos
    CREATE TABLE dbo.young_beneficiaries (
        -- Identificador único
        beneficiary_id INT IDENTITY(1,1) PRIMARY KEY,
        
        -- Credenciales
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        
        -- Datos Personales
        nombre NVARCHAR(255) NOT NULL,
        apellido_paterno NVARCHAR(255) NOT NULL,
        apellido_materno NVARCHAR(255) NOT NULL,
        
        -- Identificación
        curp VARCHAR(18) NOT NULL UNIQUE,
        fecha_nacimiento DATE NOT NULL,
        edad INT,
        genero NVARCHAR(20),
        
        -- Ubicación
        calle NVARCHAR(500) NOT NULL,
        colonia_depa NVARCHAR(255),
        ciudad NVARCHAR(100) NOT NULL,
        municipio NVARCHAR(100) NOT NULL,
        estado NVARCHAR(100) NOT NULL,
        
        -- Educación
        estudio NVARCHAR(50),
        
        -- Contacto
        phone NVARCHAR(32) NOT NULL,
        
        -- Documentos/Fotos
        foto_url NVARCHAR(MAX),
        
        -- Estado de Aprobación
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        CONSTRAINT ck_young_beneficiaries_status CHECK (status IN ('pending', 'approved', 'rejected')),
        status_comment NVARCHAR(500),
        
        -- Auditoría
        created_at DATETIME2 DEFAULT SYSUTCDATETIME() NOT NULL,
        approved_at DATETIME2,
        updated_at DATETIME2 DEFAULT SYSUTCDATETIME() NOT NULL
    );

    -- Crear índices
    CREATE INDEX idx_young_beneficiaries_email ON dbo.young_beneficiaries(email);
    CREATE INDEX idx_young_beneficiaries_curp ON dbo.young_beneficiaries(curp);
    CREATE INDEX idx_young_beneficiaries_status ON dbo.young_beneficiaries(status);
    CREATE INDEX idx_young_beneficiaries_created_at ON dbo.young_beneficiaries(created_at DESC);
    CREATE INDEX idx_young_beneficiaries_ciudad ON dbo.young_beneficiaries(ciudad);
    CREATE INDEX idx_young_beneficiaries_edad ON dbo.young_beneficiaries(edad);

    PRINT 'Tabla young_beneficiaries recreada exitosamente ✓';
END

GO

-- Verificar estructura final
PRINT '';
PRINT 'Estructura final de la tabla:';
PRINT '';

SELECT 
    COLUMN_NAME, 
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'young_beneficiaries' AND TABLE_SCHEMA = 'dbo'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '================================================';
PRINT 'TABLA CORREGIDA EXITOSAMENTE ✓';
PRINT '================================================';
