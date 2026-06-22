--crear base DE DATOS DE BENEFICIARIOS

-- Verificar si la base de datos existe
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'BENEFICIOS')
BEGIN
    PRINT 'Base de datos BENEFICIOS ya existe. Eliminando...';
    ALTER DATABASE [BENEFICIOS] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [BENEFICIOS];
    PRINT 'Base de datos anterior eliminada.';
END

PRINT 'Creando base de datos BENEFICIOS...';

CREATE DATABASE [BENEFICIOS]
    COLLATE SQL_Latin1_General_CP1_CI_AS;

PRINT 'Base de datos BENEFICIOS creada exitosamente ✓';

GO

-- Usar la nueva base de datos
USE [BENEFICIOS];

GO


-- TABLA 1: young_beneficiaries

-- Almacena los registros de jóvenes beneficiarios del programa
-- Campos: Datos personales, contacto, ubicación, identificación, estudio


IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'young_beneficiaries' AND TABLE_SCHEMA = 'dbo')
BEGIN
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

    -- Crear índices para optimización
    CREATE INDEX idx_young_beneficiaries_email ON dbo.young_beneficiaries(email);
    CREATE INDEX idx_young_beneficiaries_curp ON dbo.young_beneficiaries(curp);
    CREATE INDEX idx_young_beneficiaries_status ON dbo.young_beneficiaries(status);
    CREATE INDEX idx_young_beneficiaries_created_at ON dbo.young_beneficiaries(created_at DESC);
    CREATE INDEX idx_young_beneficiaries_ciudad ON dbo.young_beneficiaries(ciudad);
    CREATE INDEX idx_young_beneficiaries_edad ON dbo.young_beneficiaries(edad);

    PRINT 'Tabla young_beneficiaries creada exitosamente ✓';
END
ELSE
BEGIN
    PRINT 'Tabla young_beneficiaries ya existe';
END

GO

-- =====================================================
-- TABLA 2: beneficiary_status_history
-- =====================================================
-- Registra el historial de cambios de estado de los beneficiarios
-- Útil para auditoría y tracking de decisiones
-- =====================================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'beneficiary_status_history' AND TABLE_SCHEMA = 'dbo')
BEGIN
    CREATE TABLE dbo.beneficiary_status_history (
        -- Identificador único
        history_id INT IDENTITY(1,1) PRIMARY KEY,
        
        -- Referencia al beneficiario
        beneficiary_id INT NOT NULL,
        
        -- Estado anterior y nuevo
        old_status VARCHAR(20),
        new_status VARCHAR(20) NOT NULL,
        
        -- Comentario del administrador
        comment NVARCHAR(500),
        
        -- Auditoría
        changed_at DATETIME2 DEFAULT SYSUTCDATETIME() NOT NULL
    );

    -- Crear índices para búsquedas rápidas
    CREATE INDEX idx_beneficiary_status_history_beneficiary_id ON dbo.beneficiary_status_history(beneficiary_id);
    CREATE INDEX idx_beneficiary_status_history_changed_at ON dbo.beneficiary_status_history(changed_at DESC);
    CREATE INDEX idx_beneficiary_status_history_status ON dbo.beneficiary_status_history(new_status);

    PRINT 'Tabla beneficiary_status_history creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla beneficiary_status_history ya existe';
END

GO

-- =====================================================
-- TABLA 3: young_beneficiaries_documents
-- =====================================================
-- Para guardar documentos adicionales o referencias a archivos
-- =====================================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'young_beneficiaries_documents' AND TABLE_SCHEMA = 'dbo')
BEGIN
    CREATE TABLE dbo.young_beneficiaries_documents (
        -- Identificador único
        document_id INT IDENTITY(1,1) PRIMARY KEY,
        
        -- Referencia al beneficiario
        beneficiary_id INT NOT NULL,
        
        -- Tipo de documento
        document_type NVARCHAR(100) NOT NULL,
        
        -- URL o ruta del documento
        document_url NVARCHAR(MAX) NOT NULL,
        
        -- Auditoría
        uploaded_at DATETIME2 DEFAULT SYSUTCDATETIME() NOT NULL,
        
        -- Llave foránea
        CONSTRAINT fk_young_beneficiaries_documents_beneficiary 
            FOREIGN KEY (beneficiary_id) 
            REFERENCES dbo.young_beneficiaries(beneficiary_id) 
            ON DELETE CASCADE
    );

    CREATE INDEX idx_young_beneficiaries_documents_beneficiary_id ON dbo.young_beneficiaries_documents(beneficiary_id);

    PRINT 'Tabla young_beneficiaries_documents creada exitosamente ✓';
END
ELSE
BEGIN
    PRINT 'Tabla young_beneficiaries_documents ya existe';
END

GO

-- =====================================================
-- TABLA 4: young_beneficiaries_audit_log
-- =====================================================
-- Log completo de acciones de administradores
-- =====================================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'young_beneficiaries_audit_log' AND TABLE_SCHEMA = 'dbo')
BEGIN
    CREATE TABLE dbo.young_beneficiaries_audit_log (
        -- Identificador único
        log_id INT IDENTITY(1,1) PRIMARY KEY,
        
        -- Referencia al beneficiario
        beneficiary_id INT,
        
        -- Acción realizada
        action NVARCHAR(100) NOT NULL,
        
        -- Detalles de la acción
        details NVARCHAR(MAX),
        
        -- Información del administrador
        admin_email NVARCHAR(255),
        
        -- Auditoría
        action_at DATETIME2 DEFAULT SYSUTCDATETIME() NOT NULL,
        
        -- Llave foránea (opcional, puede ser NULL para acciones del sistema)
        CONSTRAINT fk_young_beneficiaries_audit_log_beneficiary 
            FOREIGN KEY (beneficiary_id) 
            REFERENCES dbo.young_beneficiaries(beneficiary_id) 
            ON DELETE SET NULL
    );

    CREATE INDEX idx_young_beneficiaries_audit_log_beneficiary_id ON dbo.young_beneficiaries_audit_log(beneficiary_id);
    CREATE INDEX idx_young_beneficiaries_audit_log_action_at ON dbo.young_beneficiaries_audit_log(action_at DESC);
    CREATE INDEX idx_young_beneficiaries_audit_log_action ON dbo.young_beneficiaries_audit_log(action);

    PRINT 'Tabla young_beneficiaries_audit_log creada exitosamente ✓';
END
ELSE
BEGIN
    PRINT 'Tabla young_beneficiaries_audit_log ya existe';
END

GO

-- =====================================================
-- VISTA 1: vw_young_beneficiaries_summary
-- =====================================================
-- Resumen de beneficiarios por estado
-- =====================================================

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME = 'vw_young_beneficiaries_summary')
    DROP VIEW dbo.vw_young_beneficiaries_summary;

GO

CREATE VIEW dbo.vw_young_beneficiaries_summary AS
SELECT
    status,
    COUNT(*) as total,
    COUNT(CASE WHEN YEAR(created_at) = YEAR(GETDATE()) THEN 1 END) as created_this_year,
    MIN(created_at) as first_registered,
    MAX(created_at) as last_registered
FROM dbo.young_beneficiaries
GROUP BY status;

PRINT 'Vista vw_young_beneficiaries_summary creada exitosamente ✓';

GO

-- =====================================================
-- VISTA 2: vw_approved_beneficiaries
-- =====================================================
-- Beneficiarios aprobados
-- =====================================================

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME = 'vw_approved_beneficiaries')
    DROP VIEW dbo.vw_approved_beneficiaries;

GO

CREATE VIEW dbo.vw_approved_beneficiaries AS
SELECT
    beneficiary_id,
    nombre,
    apellido_paterno,
    apellido_materno,
    curp,
    edad,
    estudio,
    ciudad,
    estado,
    email,
    phone,
    approved_at
FROM dbo.young_beneficiaries
WHERE status = 'approved'
ORDER BY approved_at DESC;

PRINT 'Vista vw_approved_beneficiaries creada exitosamente ✓';

GO

-- =====================================================
-- VISTA 3: vw_pending_beneficiaries
-- =====================================================
-- Beneficiarios en revisión
-- =====================================================

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME = 'vw_pending_beneficiaries')
    DROP VIEW dbo.vw_pending_beneficiaries;

GO

CREATE VIEW dbo.vw_pending_beneficiaries AS
SELECT
    beneficiary_id,
    nombre,
    apellido_paterno,
    apellido_materno,
    curp,
    edad,
    estudio,
    ciudad,
    estado,
    email,
    phone,
    created_at
FROM dbo.young_beneficiaries
WHERE status = 'pending'
ORDER BY created_at ASC;

PRINT 'Vista vw_pending_beneficiaries creada exitosamente ✓';

GO

-- =====================================================
-- PROCEDIMIENTO 1: sp_approve_beneficiary
-- =====================================================

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_approve_beneficiary')
    DROP PROCEDURE dbo.sp_approve_beneficiary;

GO

CREATE PROCEDURE dbo.sp_approve_beneficiary
    @beneficiary_id INT,
    @admin_email NVARCHAR(255) = NULL,
    @comment NVARCHAR(500) = NULL
AS
BEGIN
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Obtener estado anterior
        DECLARE @old_status VARCHAR(20);
        SELECT @old_status = status FROM dbo.young_beneficiaries WHERE beneficiary_id = @beneficiary_id;
        
        IF @old_status IS NULL
        BEGIN
            SELECT 'Error' as result, 'Beneficiario no encontrado' as message;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Actualizar estado
        UPDATE dbo.young_beneficiaries
        SET 
            status = 'approved',
            status_comment = @comment,
            approved_at = SYSUTCDATETIME(),
            updated_at = SYSUTCDATETIME()
        WHERE beneficiary_id = @beneficiary_id;
        
        -- Registrar en historial
        INSERT INTO dbo.beneficiary_status_history (beneficiary_id, old_status, new_status, comment)
        VALUES (@beneficiary_id, @old_status, 'approved', @comment);
        
        -- Registrar en log de auditoría
        INSERT INTO dbo.young_beneficiaries_audit_log (beneficiary_id, action, details, admin_email)
        VALUES (@beneficiary_id, 'APPROVED', @comment, @admin_email);
        
        COMMIT TRANSACTION;
        
        SELECT 'Success' as result, 'Beneficiario aprobado correctamente' as message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT 'Error' as result, ERROR_MESSAGE() as message;
    END CATCH
END;

GO

-- =====================================================
-- PROCEDIMIENTO 2: sp_reject_beneficiary
-- =====================================================

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME = 'sp_reject_beneficiary')
    DROP PROCEDURE dbo.sp_reject_beneficiary;

GO

CREATE PROCEDURE dbo.sp_reject_beneficiary
    @beneficiary_id INT,
    @admin_email NVARCHAR(255) = NULL,
    @comment NVARCHAR(500) = NULL
AS
BEGIN
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Obtener estado anterior
        DECLARE @old_status VARCHAR(20);
        SELECT @old_status = status FROM dbo.young_beneficiaries WHERE beneficiary_id = @beneficiary_id;
        
        IF @old_status IS NULL
        BEGIN
            SELECT 'Error' as result, 'Beneficiario no encontrado' as message;
            ROLLBACK TRANSACTION;
            RETURN;
        END
        
        -- Actualizar estado
        UPDATE dbo.young_beneficiaries
        SET 
            status = 'rejected',
            status_comment = @comment,
            updated_at = SYSUTCDATETIME()
        WHERE beneficiary_id = @beneficiary_id;
        
        -- Registrar en historial
        INSERT INTO dbo.beneficiary_status_history (beneficiary_id, old_status, new_status, comment)
        VALUES (@beneficiary_id, @old_status, 'rejected', @comment);
        
        -- Registrar en log de auditoría
        INSERT INTO dbo.young_beneficiaries_audit_log (beneficiary_id, action, details, admin_email)
        VALUES (@beneficiary_id, 'REJECTED', @comment, @admin_email);
        
        COMMIT TRANSACTION;
        
        SELECT 'Success' as result, 'Beneficiario rechazado correctamente' as message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT 'Error' as result, ERROR_MESSAGE() as message;
    END CATCH
END;

GO

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

PRINT '';
PRINT '================================================';
PRINT 'SETUP COMPLETADO EXITOSAMENTE ✓';
PRINT '================================================';
PRINT '';
PRINT 'Base de datos: BENEFICIOS';
PRINT '';
PRINT 'Tablas creadas:';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;

PRINT '';
PRINT 'Vistas creadas:';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;

PRINT '';
PRINT 'Procedimientos almacenados:';
SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = 'dbo' AND ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

PRINT '';
PRINT '================================================';
PRINT 'LISTO - DB BENEFICIOS completamente configurada';
PRINT '================================================';
