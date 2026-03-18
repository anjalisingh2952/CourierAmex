IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.ARE_AREA'))
BEGIN
	ALTER TABLE [ARE_AREA] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.ARE_AREA'))
BEGIN
	ALTER TABLE [ARE_AREA] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.ARE_AREA'))
BEGIN
	ALTER TABLE [ARE_AREA] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.ARE_AREA'))
BEGIN
	ALTER TABLE [ARE_AREA] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.ARE_AREA'))
BEGIN
	ALTER TABLE [ARE_AREA] ADD [ModifiedBy] [uniqueidentifier] NULL;
END;
GO

UPDATE [dbo].[ARE_AREA]
SET [Status] = 2
WHERE [Status] != 2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Area_GetByZoneId')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Area_GetByZoneId] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Area_GetByZoneId]
	@inZoneId INT
AS
	SET NOCOUNT ON;

	SELECT [ZON_ID] 'ZoneId', [CODIGO] 'Code', [NOMBRE] 'Name', [OBSERVACIONES] 'Notes', *
	FROM [dbo].[ARE_AREA]
	WHERE [ZON_ID] = @inZoneId
	  AND [Status] = 2;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Area_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Area_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Area_GetById]
	@inId INT
AS
	SET NOCOUNT ON;

	SELECT A.[ZON_ID] 'ZoneId', A.[CODIGO] 'Code', A.[NOMBRE] 'Name', A.[OBSERVACIONES] 'Notes', A.*,
    Z.[StateId], Z.[PAI_ID] 'CountryId'
	FROM [dbo].[ARE_AREA] A WITH(NOLOCK)
    LEFT OUTER JOIN [dbo].[ZON_ZONA] Z WITH(NOLOCK) ON (A.[ZON_ID] = Z.[ID])
	WHERE A.[Id] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Area_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Area_GetPaged] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Area_GetPaged]
    @inCountryId INT,
    @inStateId INT,
    @inZoneId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'ZoneName ASC' THEN Z.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'ZoneName DESC' THEN Z.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'Code ASC' THEN A.[CODIGO] END ASC,
            CASE WHEN @inSortBy = 'Code DESC' THEN A.[CODIGO] END DESC,
            CASE WHEN @inSortBy = 'Name ASC' THEN A.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN A.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN A.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN A.[Status] END DESC
          ) AS [RowNum], A.[ZON_ID] 'ZoneId', A.[CODIGO] 'Code', A.[NOMBRE] 'Name', A.[OBSERVACIONES] 'Notes', 
          A.*, Z.[NOMBRE] 'ZoneName', COUNT(*) OVER() [TotalRows]
        FROM [dbo].[ARE_AREA] A WITH(NOLOCK)
          LEFT OUTER JOIN [dbo].[ZON_ZONA] Z WITH(NOLOCK) ON (A.[ZON_ID] = Z.[ID])
          LEFT OUTER JOIN [dbo].[CIUDAD] S WITH(NOLOCK) ON (Z.[StateId] = S.[ID])
          LEFT OUTER JOIN [dbo].[PAI_PAIS] P WITH(NOLOCK) ON (Z.[PAI_ID] = P.[ID])
        WHERE (A.[CODIGO] LIKE '%' + @inFilterBy + '%'
          OR A.[NOMBRE] LIKE '%' + @inFilterBy + '%')
          AND (@inCountryId = 0 OR P.[ID] = @inCountryId)
          AND (@inStateId = 0 OR Z.[StateId] = @inStateId)
          AND (@inZoneId = 0 OR A.[ZON_ID] = @inZoneId)
          AND A.[Status] != 4 -- DON'T RETURN DELETED COUNTRIES
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'ZoneName ASC' THEN [ZoneName] END ASC,
        CASE WHEN @inSortBy = 'ZoneName DESC' THEN [ZoneName] END DESC,
        CASE WHEN @inSortBy = 'Code ASC' THEN [Code] END ASC,
        CASE WHEN @inSortBy = 'Code DESC' THEN [Code] END DESC,
        CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
        CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Area_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Area_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Area_CreateOrUpdate]
    @inId INT,
    @inZoneId INT,
    @inCode NVARCHAR(10),
    @inName NVARCHAR(100),
    @inNotes NVARCHAR(1000),
    @inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
      BEGIN
        INSERT INTO [dbo].[ARE_AREA]([CODIGO], [NOMBRE], [OBSERVACIONES], [ZON_ID], [Status], [CreatedBy], [ModifiedBy], [FECHACREO], [FECHAMODIFICO], [USUARIOCREO], [USUARIOMODIFICO])
        VALUES (@inCode, @inName, @inNotes, @inZoneId, @inStatus, @inUserId, @inUserId, GETDATE(), GETDATE(), 'NA', 'NA');

        SET @inId = SCOPE_IDENTITY();
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[ARE_AREA]
        SET [CODIGO] = @inCode,
            [NOMBRE] = @inName, 
            [OBSERVACIONES] = @inNotes,
            [ZON_ID] = @inZoneId, 
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [Id] = @inId;
		END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'GEN_AREAS', 'General', 'Areas'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_AREAS'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'GEN_AREAS'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO
