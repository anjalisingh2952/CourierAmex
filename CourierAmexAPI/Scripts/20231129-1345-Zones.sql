IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'StateId' AND Object_ID = Object_ID(N'dbo.ZON_ZONA'))
BEGIN
	ALTER TABLE [ZON_ZONA] ADD [StateId] [INT] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.ZON_ZONA'))
BEGIN
	ALTER TABLE [ZON_ZONA] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.ZON_ZONA'))
BEGIN
	ALTER TABLE [ZON_ZONA] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.ZON_ZONA'))
BEGIN
	ALTER TABLE [ZON_ZONA] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.ZON_ZONA'))
BEGIN
	ALTER TABLE [ZON_ZONA] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END;
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.ZON_ZONA'))
BEGIN
	ALTER TABLE [ZON_ZONA] ADD [ModifiedBy] [uniqueidentifier] NULL;
END;
GO

UPDATE [dbo].[ZON_ZONA]
SET [Status] = 2
WHERE [Status] != 2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Zone_GetByStateId')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Zone_GetByStateId] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Zone_GetByStateId]
	@inStateId INT
AS
	SET NOCOUNT ON;

	SELECT [PAI_ID] 'CountryId', [NOMBRE] 'Name', *
	FROM [dbo].[ZON_ZONA]
	WHERE [StateId] = @inStateId
	  AND [Status] = 2;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Zone_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Zone_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Zone_GetById]
	@inId SMALLINT
AS
	SET NOCOUNT ON;

	SELECT [CODIGO] 'Code', [OBSERVACION] 'Notes', [PAI_ID] 'CountryId', [NOMBRE] 'Name', 
    [RUTA] 'Route', *
	FROM [dbo].[ZON_ZONA]
	WHERE [Id] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Zone_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Zone_GetPaged] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Zone_GetPaged]
  @inCountryId INT,
  @inStateId INT,
  @inPageSize SMALLINT,
  @inPageIndex SMALLINT,
  @inSortBy VARCHAR(64),
  @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'Name ASC' THEN Z.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN Z.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'CountryName ASC' THEN C.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'CountryName DESC' THEN C.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'StateName ASC' THEN S.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'StateName DESC' THEN S.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN S.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN S.[Status] END DESC
          ) AS [RowNum], Z.[CODIGO] 'Code', Z.[NOMBRE] 'Name', S.[NOMBRE] 'StateName', 
          C.[NOMBRE] 'CountryName', Z.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[ZON_ZONA] Z WITH(NOLOCK)
          LEFT OUTER JOIN [dbo].[CIUDAD] S WITH(NOLOCK) ON (Z.[StateId] = S.[ID])
          LEFT OUTER JOIN [dbo].[PAI_PAIS] C WITH(NOLOCK) ON (Z.[PAI_ID] = C.[ID])
        WHERE Z.[NOMBRE] LIKE '%' + @inFilterBy + '%'
          AND (@inCountryId = 0 OR Z.[PAI_ID] = @inCountryId)
          AND (@inStateId = 0 OR Z.[StateId] = @inStateId)
          AND Z.[Status] != 4 -- DON'T RETURN DELETED COUNTRIES
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
        CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
        CASE WHEN @inSortBy = 'CountryName ASC' THEN [CountryName] END ASC,
        CASE WHEN @inSortBy = 'CountryName DESC' THEN [CountryName] END DESC,
        CASE WHEN @inSortBy = 'StateName ASC' THEN [StateName] END ASC,
        CASE WHEN @inSortBy = 'StateName DESC' THEN [StateName] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Zone_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Zone_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Zone_CreateOrUpdate]
    @inId SMALLINT,
    @inCountryId INT,
    @inStateId INT,
    @inCode NVARCHAR(50),
    @inName NVARCHAR(200),
    @inNotes NVARCHAR(1000),
    @inRoute INT,
    @inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
      BEGIN
        SELECT @inId = ISNULL(MAX([ID]), 0) + 1 FROM [dbo].[ZON_ZONA];

        INSERT INTO [dbo].[ZON_ZONA]([ID], [CODIGO], [NOMBRE], [OBSERVACION], [PAI_ID], [StateId], [RUTA], [Status], [CreatedBy], [ModifiedBy], [FECHACREO], [FECHAMODIFICO], [USUARIOCREO], [USUARIOMODIFICO])
        VALUES (@inId, @inCode, @inName, @inNotes, @inCountryId, @inStateId, @inRoute, @inStatus, @inUserId, @inUserId, GETDATE(), GETDATE(), 'NA', 'NA');
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[ZON_ZONA]
        SET [CODIGO] = @inCode,
            [NOMBRE] = @inName, 
            [OBSERVACION] = @inNotes,
            [PAI_ID] = @inCountryId, 
            [StateId] = @inStateId,
            [RUTA] = @inRoute, 
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [Id] = @inId;
		END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'GEN_ZONES', 'General', 'Zones'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_ZONES'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM(
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'GEN_ZONES'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO
