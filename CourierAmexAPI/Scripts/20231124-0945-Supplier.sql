IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CompanyId' AND Object_ID = Object_ID(N'dbo.EMPRESA_TRANSPORTE'))
BEGIN
	ALTER TABLE [EMPRESA_TRANSPORTE] ADD [CompanyId] [int] NULL;
END
GO
ALTER TABLE [EMPRESA_TRANSPORTE] ADD CONSTRAINT [FK_EMPRESA_TRANSPORTE_EMP_EMPRESA] FOREIGN KEY ([CompanyId]) REFERENCES [dbo].[EMP_EMPRESA]([ID])
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.EMPRESA_TRANSPORTE'))
BEGIN
	ALTER TABLE [EMPRESA_TRANSPORTE] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.EMPRESA_TRANSPORTE'))
BEGIN
	ALTER TABLE [EMPRESA_TRANSPORTE] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE()
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.EMPRESA_TRANSPORTE'))
BEGIN
	ALTER TABLE [EMPRESA_TRANSPORTE] ADD [CreatedBy] [uniqueidentifier] NULL
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.EMPRESA_TRANSPORTE'))
BEGIN
	ALTER TABLE [EMPRESA_TRANSPORTE] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE()
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.EMPRESA_TRANSPORTE'))
BEGIN
	ALTER TABLE [EMPRESA_TRANSPORTE] ADD [ModifiedBy] [uniqueidentifier] NULL
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.EMPRESA_DESTINO'))
BEGIN
	ALTER TABLE [EMPRESA_DESTINO] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.EMPRESA_DESTINO'))
BEGIN
	ALTER TABLE [EMPRESA_DESTINO] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.EMPRESA_DESTINO'))
BEGIN
	ALTER TABLE [EMPRESA_DESTINO] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE()
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.EMPRESA_DESTINO'))
BEGIN
	ALTER TABLE [EMPRESA_DESTINO] ADD [ModifiedBy] [uniqueidentifier] NULL;
END
GO
UPDATE [dbo].[EMPRESA_TRANSPORTE]
SET [CompanyId] = 2
GO
UPDATE [dbo].[EMPRESA_TRANSPORTE]
SET [Status] = 2
WHERE [Status]!=2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Supplier_GetByCompany')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Supplier_GetByCompany] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Supplier_GetByCompany]
  @inCompanyId INT
AS
  SET NOCOUNT ON;

  SELECT [PAI_ID] 'CountryId', [NOMBRE] 'Name', [DIRECCION] 'Address', [TELEFONO] 'Phone', [CONTACTO] 'Contact', *
  FROM [dbo].[EMPRESA_TRANSPORTE]
  WHERE [Status] = 2
  AND [CompanyId] = @inCompanyId;

  SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Supplier_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Supplier_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Supplier_GetPaged]
    @inCompanyId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'Name ASC' THEN ET.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN ET.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'CompanyName ASC' THEN E.[EMPRESA] END ASC,
            CASE WHEN @inSortBy = 'CompanyName DESC' THEN E.[EMPRESA] END DESC,
            CASE WHEN @inSortBy = 'Phone ASC' THEN ET.[TELEFONO] END ASC,
            CASE WHEN @inSortBy = 'Phone DESC' THEN ET.[TELEFONO] END DESC,
            CASE WHEN @inSortBy = 'Contact ASC' THEN ET.[CONTACTO] END ASC,
            CASE WHEN @inSortBy = 'Contact DESC' THEN ET.[CONTACTO] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN ET.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN ET.[Status] END DESC
          ) AS [RowNum], ET.[PAI_ID] 'CountryId', E.[EMPRESA] 'CompanyName', ET.[NOMBRE] 'Name', 
          ET.[DIRECCION] 'Address', ET.[TELEFONO] 'Phone', ET.[CONTACTO] 'Contact',
          ET.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[EMPRESA_TRANSPORTE] ET WITH(NOLOCK)
          LEFT OUTER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK) ON (ET.[CompanyId] = E.[ID])
        WHERE (ET.[NOMBRE] LIKE '%' + @inFilterBy + '%'
          OR E.[EMPRESA] LIKE '%' + @inFilterBy + '%'
          OR ET.[TELEFONO] LIKE '%' + @inFilterBy + '%'
          OR ET.[CONTACTO] LIKE '%' + @inFilterBy + '%')
          AND (@inCompanyId = 0 OR ET.[CompanyId] = @inCompanyId)
          AND ET.[Status] != 4 -- DON'T RETURN DELETED
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
      CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
      CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
      CASE WHEN @inSortBy = 'CompanyName ASC' THEN [CompanyName] END ASC,
      CASE WHEN @inSortBy = 'CompanyName DESC' THEN [CompanyName] END DESC,
      CASE WHEN @inSortBy = 'Phone ASC' THEN [Phone] END ASC,
      CASE WHEN @inSortBy = 'Phone DESC' THEN [Phone] END DESC,
      CASE WHEN @inSortBy = 'Contact ASC' THEN [Contact] END ASC,
      CASE WHEN @inSortBy = 'Contact DESC' THEN [Contact] END DESC,
      CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
      CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Supplier_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Supplier_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Supplier_GetById]
    @inId INT
AS
	SET NOCOUNT ON;

	SELECT [PAI_ID] 'CountryId', [NOMBRE] 'Name', [DIRECCION] 'Address', [TELEFONO] 'Phone', [CONTACTO] 'Contact', *
	FROM [dbo].[EMPRESA_TRANSPORTE]
	WHERE [ID] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Supplier_ProcessLocations')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Supplier_ProcessLocations] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Supplier_ProcessLocations]
  @inId INT,
  @inLocations NVARCHAR(MAX),
  @inUserId UNIQUEIDENTIFIER
AS
  BEGIN
    WITH Locations AS
    (
        SELECT [value] 'Id'
        FROM STRING_SPLIT(@inLocations, ',')
        WHERE RTRIM([value]) <> ''
    )
    DELETE FROM [dbo].[EMPRESA_DESTINO]
    WHERE [ID_EMPRESA] = @inId
        AND [ID_DESTINO] NOT IN (
            SELECT [Id]
            FROM Locations
        );

    INSERT INTO [dbo].[EMPRESA_DESTINO]([ID_EMPRESA], [ID_DESTINO], [CreatedBy], [ModifiedBy])
    SELECT @inId, [value], @inUserId, @inUserId
    FROM STRING_SPLIT(@inLocations, ',')
    WHERE RTRIM([value]) <> ''
      AND [value] NOT IN (
        SELECT [ID_DESTINO]
        FROM [dbo].[EMPRESA_DESTINO]
        WHERE [ID_EMPRESA] = @inId
      );
  END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Supplier_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Supplier_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Supplier_CreateOrUpdate]
  @inId INT,
  @inCompanyId INT,
  @inCountryId INT,
  @inName NVARCHAR(100),
  @inAddress NVARCHAR(1000),
  @inPhone NVARCHAR(100),
  @inContact NVARCHAR(100),
  @inLocations NVARCHAR(MAX),
  @inStatus TINYINT,
  @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
	  BEGIN
        INSERT INTO [dbo].[EMPRESA_TRANSPORTE]([CompanyId], [NOMBRE], [PAI_ID], [DIRECCION], [TELEFONO], [CONTACTO], [Status], [CreatedBy], [ModifiedBy])
        VALUES(@inCompanyId, @inName, @inCountryId, @inAddress, @inPhone, @inContact, @inStatus, @inUserId, @inUserId);

        SET @inId = SCOPE_IDENTITY();
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[EMPRESA_TRANSPORTE]
        SET [CompanyId] = @inCompanyId,
            [NOMBRE] = @inName, 
            [PAI_ID] = @inCountryId,
            [DIRECCION] = @inAddress,
            [TELEFONO] = @inPhone,
            [CONTACTO] = @inContact,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [ID] = @inId;
      END

  EXEC [dbo].[BKO_Supplier_ProcessLocations] @inId, @inLocations, @inUserId

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'SUP_SUPPLIER', 'Supplier', 'Suppliers'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='SUP_SUPPLIER'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM(
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'SUP_SUPPLIER'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO
