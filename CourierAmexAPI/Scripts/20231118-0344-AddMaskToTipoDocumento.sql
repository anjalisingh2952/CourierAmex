IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CompanyId' AND Object_ID = Object_ID(N'dbo.TIPODOCUMENTO'))
BEGIN
	ALTER TABLE [TIPODOCUMENTO] ADD [CompanyId] [int] NULL;
END
GO
ALTER TABLE [TIPODOCUMENTO] ADD CONSTRAINT [FK_TIPO_DOCUMENTO_EMP_EMPRESA] FOREIGN KEY ([CompanyId]) REFERENCES [dbo].[EMP_EMPRESA]([ID])
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'MASK' AND Object_ID = Object_ID(N'dbo.TIPODOCUMENTO'))
BEGIN
	ALTER TABLE [TIPODOCUMENTO] ADD MASK NVARCHAR(64) NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.TIPODOCUMENTO'))
BEGIN
	ALTER TABLE [TIPODOCUMENTO] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.TIPODOCUMENTO'))
BEGIN
	ALTER TABLE [TIPODOCUMENTO] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE()
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.TIPODOCUMENTO'))
BEGIN
	ALTER TABLE [TIPODOCUMENTO] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.TIPODOCUMENTO'))
BEGIN
	ALTER TABLE [TIPODOCUMENTO] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE()
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.TIPODOCUMENTO'))
BEGIN
	ALTER TABLE [TIPODOCUMENTO] ADD [ModifiedBy] [uniqueidentifier] NULL
END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DocumentType_GetByCompany')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_DocumentType_GetByCompany] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_DocumentType_GetByCompany]
  @inCompanyId INT
AS
	SET NOCOUNT ON;

	SELECT [TIPODOCUMENTO_ID] 'Id', [Nombre] 'Name', *
    FROM [dbo].[TIPODOCUMENTO] WITH(NOLOCK)
    WHERE [Status] = 2 AND [CompanyId] = @inCompanyId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DocumentType_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_DocumentType_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_DocumentType_GetPaged]
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
            CASE WHEN @inSortBy = 'Name ASC' THEN T.[Nombre] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN T.[Nombre] END DESC,
            CASE WHEN @inSortBy = 'CompanyName ASC' THEN E.[Empresa] END ASC,
            CASE WHEN @inSortBy = 'CompanyName DESC' THEN E.[Empresa] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN T.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN T.[Status] END DESC
        ) AS [RowNum], T.[TIPODOCUMENTO_ID] 'Id', T.[Nombre] 'Name', E.[Empresa] 'CompanyName', T.[Status], 
            COUNT(*) OVER() [TotalRows]
        FROM [dbo].[TIPODOCUMENTO] T WITH(NOLOCK)
          LEFT OUTER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK) ON (T.[CompanyId] = E.[ID])
        WHERE T.[Nombre] LIKE '%' + @inFilterBy + '%'
            AND (@inCompanyId = 0 OR T.[CompanyId] = @inCompanyId)
            AND T.[Status] != 4 -- DON'T RETURN DELETED
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
        CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
        CASE WHEN @inSortBy = 'CompanyName ASC' THEN [CompanyName] END ASC,
        CASE WHEN @inSortBy = 'CompanyName DESC' THEN [CompanyName] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DocumentType_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_DocumentType_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_DocumentType_GetById]
    @inId INT
AS
	SET NOCOUNT ON;

	SELECT [TIPODOCUMENTO_ID] 'Id', [Nombre] 'Name', *
	FROM [dbo].[TIPODOCUMENTO]
	WHERE [TIPODOCUMENTO_ID] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DocumentType_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_DocumentType_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_DocumentType_CreateOrUpdate]
  @inId INT,
  @inCompanyId INT,
  @inName NVARCHAR(255),
  @inMask NVARCHAR(64),
  @inStatus TINYINT,
  @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
    BEGIN
      SELECT @inId = ISNULL(MAX([TIPODOCUMENTO_ID]), 0) + 1 FROM [dbo].[TIPODOCUMENTO];

      INSERT INTO [dbo].[TIPODOCUMENTO]([TIPODOCUMENTO_ID], [Nombre], [CompanyId], [Mask], [Status], [CreatedBy], [ModifiedBy])
      VALUES(@inId, @inName, @inCompanyId, @inMask, @inStatus, @inUserId, @inUserId);
    END
	ELSE
	  BEGIN
      UPDATE [dbo].[TIPODOCUMENTO]
      SET [Nombre] = @inName, 
        [CompanyId] = @inCompanyId,
        [Mask] = @inMask,
        [Status] = @inStatus,
        [ModifiedAt] = GETDATE(),
        [ModifiedBy] = @inUserId
      WHERE [TIPODOCUMENTO_ID] = @inId;
    END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'GEN_DOCUMENTTYPE', 'General', 'Document Types'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_DOCUMENTTYPE'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT RoleId, PermissionId, 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'GEN_DOCUMENTTYPE'
) t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId] = t.RoleId AND [PermissionId]=t.PermissionId
)
GO
