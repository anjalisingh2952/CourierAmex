IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.EST_ESTADO'))
BEGIN
	ALTER TABLE [EST_ESTADO] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.EST_ESTADO'))
BEGIN
	ALTER TABLE [EST_ESTADO] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.EST_ESTADO'))
BEGIN
	ALTER TABLE [EST_ESTADO] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.EST_ESTADO'))
BEGIN
	ALTER TABLE [EST_ESTADO] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.EST_ESTADO'))
BEGIN
	ALTER TABLE [EST_ESTADO] ADD [ModifiedBy] [uniqueidentifier] NULL;
END;
GO

UPDATE [dbo].[EST_ESTADO]
SET [Status] = 2
WHERE [Status] != 2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageStatus_GetActive')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_PackageStatus_GetActive] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_PackageStatus_GetActive]
AS
	SET NOCOUNT ON;

	SELECT [CODIGO] 'Code', [NOMBRE] 'Name', *
	FROM [dbo].[EST_ESTADO]
	WHERE [Status] = 2;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageStatus_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_PackageStatus_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_PackageStatus_GetById]
	@inId INT
AS
	SET NOCOUNT ON;

	SELECT P.[CODIGO] 'Code', P.[NOMBRE] 'Name', P.*
	FROM [dbo].[EST_ESTADO] P WITH(NOLOCK)
	WHERE P.[Id] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageStatus_ValidateCode')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_PackageStatus_ValidateCode] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_PackageStatus_ValidateCode]
    @inId INT,
	@inCode VARCHAR(50)
AS
	SET NOCOUNT ON;

	SELECT P.[CODIGO] 'Code', P.[NOMBRE] 'Name', P.*
	FROM [dbo].[EST_ESTADO] P WITH(NOLOCK)
	WHERE P.[CODIGO] = @inCode AND P.[Status] != 4
      AND P.[ID] != @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageStatus_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_PackageStatus_GetPaged] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_PackageStatus_GetPaged]
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'Code ASC' THEN P.[CODIGO] END ASC,
            CASE WHEN @inSortBy = 'Code DESC' THEN P.[CODIGO] END DESC,
            CASE WHEN @inSortBy = 'Name ASC' THEN P.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN P.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN P.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN P.[Status] END DESC
          ) AS [RowNum], P.[CODIGO] 'Code', P.[NOMBRE] 'Name', 
            P.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[EST_ESTADO] P WITH(NOLOCK)
        WHERE (P.[CODIGO] LIKE '%' + @inFilterBy + '%'
          OR P.[NOMBRE] LIKE '%' + @inFilterBy + '%')
          AND P.[Status] != 4 -- DON'T RETURN DELETED COUNTRIES
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'Code ASC' THEN [Code] END ASC,
        CASE WHEN @inSortBy = 'Code DESC' THEN [Code] END DESC,
        CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
        CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageStatus_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_PackageStatus_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_PackageStatus_CreateOrUpdate]
    @inId INT,
    @inCode NVARCHAR(10),
    @inName NVARCHAR(100),
    @inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
      BEGIN
        INSERT INTO [dbo].[EST_ESTADO]([CODIGO], [NOMBRE], [Status], [CreatedBy], [ModifiedBy], [FECHACREO], [FECHAMODIFICO], [CREO], [MODIFICO])
        VALUES (@inCode, @inName, @inStatus, @inUserId, @inUserId, GETDATE(), GETDATE(), 'NA', 'NA');

        SET @inId = SCOPE_IDENTITY();
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[EST_ESTADO]
        SET [CODIGO] = @inCode,
            [NOMBRE] = @inName, 
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [Id] = @inId;
		END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CIA_PACKAGESTATUS', 'Company', 'Package Status'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='CIA_PACKAGESTATUS'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'CIA_PACKAGESTATUS'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO
