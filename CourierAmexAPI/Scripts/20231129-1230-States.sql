IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.CIUDAD'))
BEGIN
	ALTER TABLE [CIUDAD] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.CIUDAD'))
BEGIN
	ALTER TABLE [CIUDAD] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.CIUDAD'))
BEGIN
	ALTER TABLE [CIUDAD] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.CIUDAD'))
BEGIN
	ALTER TABLE [CIUDAD] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.CIUDAD'))
BEGIN
	ALTER TABLE [CIUDAD] ADD [ModifiedBy] [uniqueidentifier] NULL;
END
GO

UPDATE [dbo].[CIUDAD]
SET [Status] = 2
WHERE [Status] != 2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_State_GetByCountryId')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_State_GetByCountryId] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_State_GetByCountryId]
	@inCountryId INT
AS
	SET NOCOUNT ON;

	SELECT [PAI_ID] 'CountryId', [NOMBRE] 'Name', *
	FROM [dbo].[CIUDAD]
	WHERE [PAI_ID] = @inCountryId
	  AND [Status] = 2;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_State_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_State_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_State_GetById]
	@inId SMALLINT
AS
	SET NOCOUNT ON;

	SELECT [PAI_ID] 'CountryId', [NOMBRE] 'Name', *
	FROM [dbo].[CIUDAD]
	WHERE [Id] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_State_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_State_GetPaged] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_State_GetPaged]
    @inCountryId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'Name ASC' THEN S.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN S.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'CountryName ASC' THEN C.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'CountryName DESC' THEN C.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN S.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN S.[Status] END DESC
        ) AS [RowNum], S.[PAI_ID] 'CountryId', S.[NOMBRE] 'Name', C.[NOMBRE] 'CountryName', 
          S.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[CIUDAD] S WITH(NOLOCK)
          INNER JOIN [dbo].[PAI_PAIS] C WITH(NOLOCK) ON (S.[PAI_ID] = C.[ID])
        WHERE S.[NOMBRE] LIKE '%' + @inFilterBy + '%'
          AND (@inCountryId = 0 OR S.[PAI_ID] = @inCountryId)
          AND S.[Status] != 4 -- DON'T RETURN DELETED COUNTRIES
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
        CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
        CASE WHEN @inSortBy = 'CountryName ASC' THEN [CountryName] END ASC,
        CASE WHEN @inSortBy = 'CountryName DESC' THEN [CountryName] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_State_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_State_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_State_CreateOrUpdate]
    @inId SMALLINT,
    @inCountryId INT,
    @inName NVARCHAR(64),
    @inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
      BEGIN
        SELECT @inId = ISNULL(MAX([ID]), 0) + 1 FROM [dbo].[CIUDAD];

        INSERT INTO [dbo].[CIUDAD]([ID], [PAI_ID], [NOMBRE], [Status], [CreatedBy], [ModifiedBy])
        VALUES (@inId, @inCountryId, @inName, @inStatus, @inUserId, @inUserId);
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[CIUDAD]
        SET [PAI_ID] = @inCountryId,
            [NOMBRE] = @inName, 
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [Id] = @inId;
		END

	SELECT @inId;
GO
