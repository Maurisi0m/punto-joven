-- =====================================================
-- TABLA: young_beneficiaries
-- =====================================================
-- Tabla para registrar jóvenes beneficiarios del programa
-- Rango de edad: 14-18 años
-- =====================================================

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

    PRINT 'Tabla young_beneficiaries creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla young_beneficiaries ya existe';
END

-- =====================================================
-- TABLA: beneficiary_status_history
-- =====================================================
-- Tabla para registrar el historial de cambios de estado
-- =====================================================

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'beneficiary_status_history')
BEGIN
    CREATE TABLE dbo.beneficiary_status_history (
        history_id INT IDENTITY(1,1) PRIMARY KEY,
        beneficiary_id INT NOT NULL,
        old_status VARCHAR(20),
        new_status VARCHAR(20) NOT NULL,
        comment NVARCHAR(500),
        changed_at DATETIME2 DEFAULT SYSUTCDATETIME(),
        FOREIGN KEY (beneficiary_id) REFERENCES dbo.young_beneficiaries(beneficiary_id) ON DELETE CASCADE
    );

    CREATE INDEX idx_beneficiary_status_history_beneficiary_id ON dbo.beneficiary_status_history(beneficiary_id);
    CREATE INDEX idx_beneficiary_status_history_changed_at ON dbo.beneficiary_status_history(changed_at DESC);

    PRINT 'Tabla beneficiary_status_history creada exitosamente';
END
ELSE
BEGIN
    PRINT 'Tabla beneficiary_status_history ya existe';
END
