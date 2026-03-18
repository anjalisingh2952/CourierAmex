IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CompanyId' AND Object_ID = Object_ID(N'dbo.DESTINO'))
BEGIN
	ALTER TABLE [DESTINO] ADD [CompanyId] [int] NULL;
END
GO
ALTER TABLE [DESTINO] ADD CONSTRAINT [FK_DESTINO_EMP_EMPRESA] FOREIGN KEY ([CompanyId]) REFERENCES [dbo].[EMP_EMPRESA]([ID])
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.DESTINO'))
BEGIN
	ALTER TABLE [DESTINO] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END;
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.DESTINO'))
BEGIN
	ALTER TABLE [DESTINO] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END;
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.DESTINO'))
BEGIN
	ALTER TABLE [DESTINO] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.DESTINO'))
BEGIN
	ALTER TABLE [DESTINO] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END;
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.DESTINO'))
BEGIN
	ALTER TABLE [DESTINO] ADD [ModifiedBy] [uniqueidentifier] NULL
END;
GO

UPDATE [dbo].[DESTINO]
SET [Status] = 2
WHERE [Status]!=2;
GO

UPDATE [dbo].[DESTINO]
SET [CompanyId] = 2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Location_GetByCompany')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Location_GetByCompany] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Location_GetByCompany]
    @inCompanyId INT,
    @inSupplierId INT
AS
	SET NOCOUNT ON;

    SELECT D.[PAI_ID] 'CountryId', D.[NOMBRE] 'Name', D.[TELEFONO] 'Phone', D.*,
        CASE WHEN ED.[ID_EMPRESA] IS NULL THEN 0 ELSE 1 END 'IsSelected'
    FROM [dbo].[DESTINO] D WITH(NOLOCK)
        LEFT OUTER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK) ON (D.[CompanyId] = E.[ID])
        LEFT OUTER JOIN [dbo].[EMPRESA_DESTINO] ED WITH(NOLOCK) ON (D.[ID] = ED.[ID_DESTINO] AND ED.[ID_EMPRESA] = @inSupplierId)
    WHERE D.[Status] = 2
        AND D.[CompanyId] = @inCompanyId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Location_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Location_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Location_GetPaged]
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
            CASE WHEN @inSortBy = 'Name ASC' THEN D.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN D.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'CompanyName ASC' THEN E.[EMPRESA] END ASC,
            CASE WHEN @inSortBy = 'CompanyName DESC' THEN E.[EMPRESA] END DESC,
            CASE WHEN @inSortBy = 'Phone ASC' THEN D.[TELEFONO] END ASC,
            CASE WHEN @inSortBy = 'Phone DESC' THEN D.[TELEFONO] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN D.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN D.[Status] END DESC
          ) AS [RowNum], D.[PAI_ID] 'CountryId', E.[EMPRESA] 'CompanyName', D.[NOMBRE] 'Name', 
          D.[TELEFONO] 'Phone', D.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[DESTINO] D WITH(NOLOCK)
          LEFT OUTER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK) ON (D.[CompanyId] = E.[ID])
          LEFT OUTER JOIN [dbo].[PAI_PAIS] C WITH(NOLOCK) ON (D.[PAI_ID] = C.[ID])
        WHERE (D.[NOMBRE] LIKE '%' + @inFilterBy + '%'
          OR E.[EMPRESA] LIKE '%' + @inFilterBy + '%'
          OR D.[TELEFONO] LIKE '%' + @inFilterBy + '%')
          AND (@inCompanyId = 0 OR E.[ID] = @inCompanyId)
          AND D.[Status] != 4 -- DON'T RETURN DELETED
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
      CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
      CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Location_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Location_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Location_GetById]
    @inId INT
AS
	SET NOCOUNT ON;

	SELECT [PAI_ID] 'CountryId', [NOMBRE] 'Name', [TELEFONO] 'Phone', *
  FROM [dbo].[DESTINO]
	WHERE [ID] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Location_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Location_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Location_CreateOrUpdate]
    @inId TINYINT,
    @inCompanyId INT,
    @inCountryId INT,
    @inName NVARCHAR(100),
    @inPhone NVARCHAR(100),
    @inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
	  BEGIN
    INSERT INTO [dbo].[DESTINO]
        ([CompanyId], [NOMBRE], [PAI_ID], [TELEFONO], [Status], [CreatedBy], [ModifiedBy])
    VALUES(@inCompanyId, @inName, @inCountryId, @inPhone, @inStatus, @inUserId, @inUserId);

    SET @inId = SCOPE_IDENTITY();
END
	ELSE
	  BEGIN
    UPDATE [dbo].[DESTINO]
        SET [CompanyId] = @inCompanyId,
            [NOMBRE] = @inName, 
            [PAI_ID] = @inCountryId,
            [TELEFONO] = @inPhone,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [ID] = @inId;
END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'SUP_LOCATIONS', 'Supplier', 'Locations'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='SUP_LOCATIONS'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM(
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'SUP_LOCATIONS'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


