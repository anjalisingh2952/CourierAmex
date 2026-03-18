---- Agregar la restricción de clave foránea para CompanyId
ALTER TABLE [FC_TIPOPAGO] ADD CONSTRAINT [FK_FC_TIPOPAGO_EMP_EMPRESA] FOREIGN KEY ([IDEMPRESA]) REFERENCES [dbo].[EMP_EMPRESA]([ID])
GO

-- Agregar columna Status si no existe
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGO'))
BEGIN
    ALTER TABLE [FC_TIPOPAGO] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO

-- Agregar columna CreatedAt si no existe
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGO'))
BEGIN
    ALTER TABLE [FC_TIPOPAGO] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO

-- Agregar columna CreatedBy si no existe
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGO'))
BEGIN
    ALTER TABLE [FC_TIPOPAGO] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO

-- Agregar columna ModifiedAt si no existe
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGO'))
BEGIN
    ALTER TABLE [FC_TIPOPAGO] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO

-- Agregar columna ModifiedBy si no existe
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGO'))
BEGIN
    ALTER TABLE [FC_TIPOPAGO] ADD [ModifiedBy] [uniqueidentifier] NULL;
END
GO

-- Actualizar Status a 2 donde sea diferente de 2
UPDATE [dbo].[FC_TIPOPAGO]
SET [Status] = 2
WHERE [Status] != 2;
GO

-- Procedimiento almacenado para obtener todos los registros
IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PaymentType_GetAll')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_PaymentType_GetAll] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_PaymentType_GetAll]
    @inCompanyId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT [DESCRIPCION] AS 'Name', *
    FROM [dbo].[FC_TIPOPAGO] WITH (NOLOCK)
    WHERE [Status] = 2
      AND [IDEMPRESA] = @inCompanyId;

    SET NOCOUNT OFF;
END
GO

-- Procedimiento almacenado para obtener registros paginados
IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PaymentType_GetPaged')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_PaymentType_GetPaged] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_PaymentType_GetPaged]
    @inCompanyId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;

    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER (ORDER BY 
            CASE WHEN @inSortBy = 'Name ASC' THEN T.[DESCRIPCION] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN T.[DESCRIPCION] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN T.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN T.[Status] END DESC
        ) AS [RowNum], T.[DESCRIPCION] 'Name', E.[Empresa] 'CompanyName', T.*, COUNT(*) OVER () AS [TotalRows]
        FROM [dbo].[FC_TIPOPAGO] T WITH (NOLOCK)
        LEFT OUTER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK) ON (T.IDEMPRESA = E.[ID])
        WHERE (T.[DESCRIPCION]  LIKE '%' + @inFilterBy + '%')
          AND (@inCompanyId = 0 OR T.[IDEMPRESA] = @inCompanyId)
          AND T.[Status] != 4 -- DON'T RETURN DELETED
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
      CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
      CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
      CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
      CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY;

    SET NOCOUNT OFF;
END
GO

-- Procedimiento almacenado para obtener un registro por ID
IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PaymentType_GetById')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_PaymentType_GetById] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_PaymentType_GetById]
    @inId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT [DESCRIPCION] AS 'Name', [IDEMPRESA] AS 'CompanyId', *
    FROM [dbo].[FC_TIPOPAGO]
    WHERE [ID] = @inId;

    SET NOCOUNT OFF;
END
GO

-- Procedimiento almacenado para crear o actualizar un registro
IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PaymentType_CreateOrUpdate')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_PaymentType_CreateOrUpdate] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_PaymentType_CreateOrUpdate]
  @inId INT,
  @inCompanyId INT,
  @inName NVARCHAR(50),
  @inStatus TINYINT,
  @inUserId UNIQUEIDENTIFIER
AS
BEGIN
    IF (ISNULL(@inId, 0) = 0) 
    BEGIN
        SELECT @inId = ISNULL(MAX([ID]), 0) + 1 FROM [dbo].[FC_TIPOPAGO];
        
        INSERT INTO [dbo].[FC_TIPOPAGO]([ID], [IDEMPRESA], [DESCRIPCION], [Status], [CreatedBy], [ModifiedBy])
        VALUES(@inId, @inCompanyId, @inName, @inStatus, @inUserId, @inUserId);
    END
    ELSE
    BEGIN
        UPDATE [dbo].[FC_TIPOPAGO]
        SET [IDEMPRESA] = @inCompanyId,
            [DESCRIPCION] = @inName,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [ID] = @inId;
    END

    SELECT @inId;
END
GO


-- Insertar permisos en BKO_Permission
INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CIA_PAYMENTTYPES', 'Company', 'Payment Types'
WHERE NOT EXISTS (
    SELECT 1
    FROM [dbo].[BKO_Permission]
    WHERE [Id] = 'CIA_PAYMENTTYPES'
);
GO

-- Asignar permisos al rol 'System' en BKO_RolePermission
INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM(
    SELECT CAST(R.[Id] AS uniqueidentifier) AS RoleId, Pe.[Id] AS PermissionId
    FROM [dbo].[BKO_Role] R
    CROSS JOIN (
        SELECT [Id]
        FROM [dbo].[BKO_Permission]
        WHERE [Id] = 'CIA_PAYMENTTYPES'
    ) Pe
    WHERE R.[Name] = 'SYSTEM'
) AS SubQuery
WHERE NOT EXISTS (
    SELECT 1
    FROM [dbo].[BKO_RolePermission] 
    WHERE [RoleId] = SubQuery.[RoleId]
      AND [PermissionId] = SubQuery.[PermissionId]
);
GO
