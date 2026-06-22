-- =====================================================
-- Script de configuración: Admin y Jóvenes Beneficiarios
-- Base de datos: NEGOCIOS
-- =====================================================

USE [NEGOCIOS];
GO

-- Verificar si tabla business_accounts existe
IF NOT EXISTS (SELECT * FROM information_schema.TABLES WHERE TABLE_NAME = 'business_accounts')
BEGIN
    CREATE TABLE business_accounts (
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
        status NVARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
        status_comment NVARCHAR(500),
        created_at DATETIME DEFAULT SYSUTCDATETIME(),
        approved_at DATETIME,
        updated_at DATETIME DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- Verificar si tabla business_status_history existe
IF NOT EXISTS (SELECT * FROM information_schema.TABLES WHERE TABLE_NAME = 'business_status_history')
BEGIN
    CREATE TABLE business_status_history (
        history_id INT IDENTITY(1,1) PRIMARY KEY,
        business_id INT NOT NULL,
        old_status NVARCHAR(20),
        new_status NVARCHAR(20) NOT NULL,
        comment NVARCHAR(500),
        changed_at DATETIME DEFAULT SYSUTCDATETIME(),
        changed_by INT, -- admin_id when applicable
        FOREIGN KEY (business_id) REFERENCES business_accounts(business_id)
    );
END;
GO

-- Crear tabla de usuarios ADMIN
IF NOT EXISTS (SELECT * FROM information_schema.TABLES WHERE TABLE_NAME = 'admin_users')
BEGIN
    CREATE TABLE admin_users (
        admin_id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) DEFAULT 'admin', -- admin, superadmin
        is_active BIT DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- Crear índices solo si no existen
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_admin_email')
BEGIN
    CREATE INDEX idx_admin_email ON admin_users(email);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_admin_active')
BEGIN
    CREATE INDEX idx_admin_active ON admin_users(is_active);
END;
GO

-- Crear tabla de JÓVENES BENEFICIARIOS
IF NOT EXISTS (SELECT * FROM information_schema.TABLES WHERE TABLE_NAME = 'young_beneficiaries')
BEGIN
    CREATE TABLE young_beneficiaries (
        beneficiary_id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        nombre NVARCHAR(255) NOT NULL,
        curp NVARCHAR(18) NOT NULL UNIQUE,
        fecha_nacimiento DATE NOT NULL,
        edad INT,
        genero NVARCHAR(50),
        phone NVARCHAR(32),
        address NVARCHAR(500),
        city NVARCHAR(100),
        state NVARCHAR(100),
        zip NVARCHAR(20),
        foto_url NVARCHAR(MAX),
        token NVARCHAR(50) UNIQUE, -- Folio: BJ-2025-00001
        status NVARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
        status_comment NVARCHAR(500),
        created_at DATETIME DEFAULT SYSUTCDATETIME(),
        approved_at DATETIME,
        validity_end DATETIME, -- Vigencia de la credencial
        updated_at DATETIME DEFAULT SYSUTCDATETIME()
    );
END;
GO

-- Crear índices de young_beneficiaries solo si no existen
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_beneficiary_email')
BEGIN
    CREATE INDEX idx_beneficiary_email ON young_beneficiaries(email);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_beneficiary_curp')
BEGIN
    CREATE INDEX idx_beneficiary_curp ON young_beneficiaries(curp);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_beneficiary_token')
BEGIN
    CREATE INDEX idx_beneficiary_token ON young_beneficiaries(token);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_beneficiary_status')
BEGIN
    CREATE INDEX idx_beneficiary_status ON young_beneficiaries(status);
END;
GO

-- Crear tabla de historial de cambios para JÓVENES
IF NOT EXISTS (SELECT * FROM information_schema.TABLES WHERE TABLE_NAME = 'beneficiary_status_history')
BEGIN
    CREATE TABLE beneficiary_status_history (
        history_id INT IDENTITY(1,1) PRIMARY KEY,
        beneficiary_id INT NOT NULL,
        old_status NVARCHAR(20),
        new_status NVARCHAR(20) NOT NULL,
        comment NVARCHAR(500),
        changed_at DATETIME DEFAULT SYSUTCDATETIME(),
        changed_by INT, -- admin_id
        FOREIGN KEY (beneficiary_id) REFERENCES young_beneficiaries(beneficiary_id)
    );
END;
GO

-- Crear tabla de AUDITORÍA GENERAL
IF NOT EXISTS (SELECT * FROM information_schema.TABLES WHERE TABLE_NAME = 'admin_audit_log')
BEGIN
    CREATE TABLE admin_audit_log (
        log_id INT IDENTITY(1,1) PRIMARY KEY,
        admin_id INT,
        action NVARCHAR(100), -- 'approved_business', 'rejected_business', 'approved_beneficiary', etc
        table_name NVARCHAR(100),
        record_id INT,
        old_data NVARCHAR(MAX), -- JSON
        new_data NVARCHAR(MAX), -- JSON
        ip_address NVARCHAR(45),
        created_at DATETIME DEFAULT SYSUTCDATETIME(),
        FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id)
    );
END;
GO

-- Crear índices de admin_audit_log solo si no existen
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_admin')
BEGIN
    CREATE INDEX idx_audit_admin ON admin_audit_log(admin_id);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_action')
BEGIN
    CREATE INDEX idx_audit_action ON admin_audit_log(action);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_date')
BEGIN
    CREATE INDEX idx_audit_date ON admin_audit_log(created_at);
END;
GO

-- =====================================================
-- INSERTAR USUARIO ADMIN INICIAL
-- Email: admin@compajefra.mx
-- Contraseña temporal: AdminCompajefra2025!
-- ⚠️ CAMBIA ESTA CONTRASEÑA EN PRODUCCIÓN ⚠️
-- =====================================================

IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@compajefra.mx')
BEGIN
    INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
    VALUES (
        'admin@compajefra.mx',
        'AdminCompajefra2025!',
        'Administrador Compajefra',
        'superadmin',
        1
    );
    
    PRINT 'Usuario admin creado: admin@compajefra.mx';
    PRINT 'Contraseña temporal: AdminCompajefra2025!';
    PRINT '⚠️ IMPORTANTE: Cambia la contraseña en la primera sesión ⚠️';
END
ELSE
BEGIN
    PRINT 'El usuario admin ya existe';
END;
GO

-- Verificar que las tablas existan
PRINT '';
PRINT '=== Tablas creadas exitosamente ===';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME IN (
    'business_accounts',
    'business_status_history',
    'admin_users',
    'young_beneficiaries',
    'beneficiary_status_history',
    'admin_audit_log'
);
GO
