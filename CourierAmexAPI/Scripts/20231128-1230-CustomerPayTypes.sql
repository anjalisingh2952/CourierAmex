IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CompanyId' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGOCLIENTE'))
BEGIN
	ALTER TABLE [FC_TIPOPAGOCLIENTE] ADD [CompanyId] [int] NULL;
END
GO
ALTER TABLE [FC_TIPOPAGOCLIENTE] ADD CONSTRAINT [FK_FC_TIPOPAGOCLIENTE_EMP_EMPRESA] FOREIGN KEY ([CompanyId]) REFERENCES [dbo].[EMP_EMPRESA]([ID])
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGOCLIENTE'))
BEGIN
	ALTER TABLE [FC_TIPOPAGOCLIENTE] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGOCLIENTE'))
BEGIN
	ALTER TABLE [FC_TIPOPAGOCLIENTE] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGOCLIENTE'))
BEGIN
	ALTER TABLE [FC_TIPOPAGOCLIENTE] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGOCLIENTE'))
BEGIN
	ALTER TABLE [FC_TIPOPAGOCLIENTE] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE()
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.FC_TIPOPAGOCLIENTE'))
BEGIN
	ALTER TABLE [FC_TIPOPAGOCLIENTE] ADD [ModifiedBy] [uniqueidentifier] NULL
END
GO

UPDATE [dbo].[FC_TIPOPAGOCLIENTE]
SET [Status] = 2
WHERE [Status] != 2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_CustomerPayType_GetAll')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_CustomerPayType_GetAll] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_CustomerPayType_GetAll]
    @inCompanyId INT
AS
	SET NOCOUNT ON;

	SELECT [DESCRIPCION] 'Name', *
	FROM [dbo].[FC_TIPOPAGOCLIENTE] WITH(NOLOCK)
	WHERE [Status] = 2
      AND [CompanyId] = @inCompanyId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_CustomerPayType_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [db0.BKO_CustomerPayType_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [BKO_CustomerPayType_GetPaged]
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
            CASE WHEN @inSortBy = 'Name ASC' THEN T.[DESCRIPCION] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN T.[DESCRIPCION] END DESC,
            CASE WHEN @inSortBy = 'CompanyName ASC' THEN E.[Empresa] END ASC,
            CASE WHEN @inSortBy = 'CompanyName DESC' THEN E.[Empresa] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN T.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN T.[Status] END DESC
          ) AS [RowNum], T.[DESCRIPCION] 'Name', E.[Empresa] 'CompanyName', T.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[FC_TIPOPAGOCLIENTE] T WITH(NOLOCK)
          LEFT OUTER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK) ON (T.[CompanyId] = E.[ID])
        WHERE (T.[DESCRIPCION] LIKE '%' + @inFilterBy + '%')
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

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_CustomerPayType_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_CustomerPayType_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_CustomerPayType_GetById]
    @inId INT
AS
	SET NOCOUNT ON;

	SELECT [DESCRIPCION] 'Name', *
	FROM [dbo].[FC_TIPOPAGOCLIENTE]
	WHERE [ID] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_CustomerPayType_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_CustomerPayType_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_CustomerPayType_CreateOrUpdate]
  @inId INT,
  @inCompanyId INT,
  @inName NVARCHAR(50),
  @inStatus TINYINT,
  @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
	  BEGIN
       SELECT @inId = ISNULL(MAX([ID]), 0) + 1 FROM [dbo].[FC_TIPOPAGOCLIENTE];
      
      INSERT INTO [dbo].[FC_TIPOPAGOCLIENTE]([ID], [CompanyId], [DESCRIPCION], [Status], [CreatedBy], [ModifiedBy])
      VALUES(@inId, @inCompanyId, @inName, @inStatus, @inUserId, @inUserId);
    END
	ELSE
	  BEGIN
        UPDATE [dbo].[FC_TIPOPAGOCLIENTE]
        SET [CompanyId] = @inCompanyId,
            [DESCRIPCION] = @inName,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [ID] = @inId;
      END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'GEN_CUSTPAYTYPES', 'General', 'Customer Pay Types'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_CUSTPAYTYPES'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM(
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'GEN_CUSTPAYTYPES'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO
