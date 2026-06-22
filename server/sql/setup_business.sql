-- Crear base de datos si no existe y usarla
USE master;
GO
IF DB_ID('EMPRESAS') IS NULL
BEGIN
  PRINT 'Creando base de datos EMPRESAS...';
  EXEC('CREATE DATABASE [EMPRESAS]');
END
ELSE
BEGIN
  PRINT 'La base de datos EMPRESAS ya existe.';
END;
GO
-- Esperar a que la base exista antes de cambiar el contexto
WHILE DB_ID('EMPRESAS') IS NULL
BEGIN
  WAITFOR DELAY '00:00:01';
END
GO
USE [EMPRESAS];
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.business_status_history', 'U') IS NOT NULL DROP TABLE dbo.business_status_history;
IF OBJECT_ID('dbo.business_accounts', 'U') IS NOT NULL DROP TABLE dbo.business_accounts;
GO

CREATE TABLE dbo.business_accounts (
  business_id INT IDENTITY(1,1) PRIMARY KEY,
  email NVARCHAR(255) NOT NULL UNIQUE,
  password_hash NVARCHAR(255) NOT NULL, -- guarda la contraseña tal cual (temporal, sin bcrypt)
  business_name NVARCHAR(255) NOT NULL,
  owner_name NVARCHAR(255) NOT NULL,
  phone NVARCHAR(32) NULL,
  category NVARCHAR(100) NULL,
  address NVARCHAR(500) NULL,
  city NVARCHAR(100) NULL,
  state NVARCHAR(100) NULL,
  zip NVARCHAR(20) NULL,
  website NVARCHAR(255) NULL,
  logo_url NVARCHAR(MAX) NULL,
  local_photo_url NVARCHAR(MAX) NULL,
  status VARCHAR(20) NOT NULL CONSTRAINT DF_business_status DEFAULT ('pending'),
  status_comment NVARCHAR(500) NULL,
  approved_at DATETIME2 NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT DF_business_created DEFAULT (SYSUTCDATETIME()),
  updated_at DATETIME2 NOT NULL CONSTRAINT DF_business_updated DEFAULT (SYSUTCDATETIME())
);
GO

CREATE TABLE dbo.business_status_history (
  history_id INT IDENTITY(1,1) PRIMARY KEY,
  business_id INT NOT NULL,
  old_status VARCHAR(20) NULL,
  new_status VARCHAR(20) NOT NULL,
  comment NVARCHAR(500) NULL,
  changed_at DATETIME2 NOT NULL CONSTRAINT DF_status_history_changed DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_status_history_business FOREIGN KEY (business_id) REFERENCES dbo.business_accounts(business_id)
);
GO

CREATE NONCLUSTERED INDEX IX_business_accounts_email ON dbo.business_accounts(email);
CREATE NONCLUSTERED INDEX IX_business_accounts_status ON dbo.business_accounts(status);
GO

CREATE TRIGGER trg_business_accounts_updated_at
ON dbo.business_accounts
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE ba
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.business_accounts ba
  INNER JOIN inserted i ON ba.business_id = i.business_id;
END;
GO
