IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'IsCommodityRequired' AND Object_ID = Object_ID(N'dbo.EMP_EMPRESA'))
BEGIN
	ALTER TABLE [EMP_EMPRESA] ADD [IsCommodityRequired] [bit] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'WeightUnit' AND Object_ID = Object_ID(N'dbo.EMP_EMPRESA'))
BEGIN
	ALTER TABLE [EMP_EMPRESA] ADD [WeightUnit] [tinyint] NOT NULL DEFAULT(1);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.EMP_EMPRESA'))
BEGIN
	ALTER TABLE [EMP_EMPRESA] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.EMP_EMPRESA'))
BEGIN
	ALTER TABLE [EMP_EMPRESA] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.EMP_EMPRESA'))
BEGIN
	ALTER TABLE [EMP_EMPRESA] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.EMP_EMPRESA'))
BEGIN
	ALTER TABLE [EMP_EMPRESA] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE()
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.EMP_EMPRESA'))
BEGIN
	ALTER TABLE [EMP_EMPRESA] ADD [ModifiedBy] [uniqueidentifier] NULL;
END
GO

UPDATE [EMP_EMPRESA]
SET [Status] = 2
WHERE [Status]!=2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Company_GetAllActive')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Company_GetAllActive] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Company_GetAllActive]
AS
	SET NOCOUNT ON;

	SELECT [ID] 'Id', [CODIGO] 'Code', [EMPRESA] 'Name', [DIRECCION] 'Address', 
    [PAI_ID] 'CountryId', [MAX_NIVEL] 'MaxLevel', [MES_FISCAL] 'FiscalMonth', [COD_MONEDA] 'CurrencyId', *
  FROM [dbo].[EMP_EMPRESA]
  WHERE [Status] = 2;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Company_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Company_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Company_GetPaged]
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
          CASE WHEN @inSortBy = 'Name ASC' THEN E.[EMPRESA] END ASC,
          CASE WHEN @inSortBy = 'Name DESC' THEN E.[EMPRESA] END DESC,
          CASE WHEN @inSortBy = 'CountryName ASC' THEN C.[Nombre] END ASC,
          CASE WHEN @inSortBy = 'CountryName DESC' THEN C.[Nombre] END DESC,
          CASE WHEN @inSortBy = 'Status ASC' THEN E.[Status] END ASC,
          CASE WHEN @inSortBy = 'Status DESC' THEN E.[Status] END DESC
        ) AS [RowNum], E.[CODIGO] 'Code', E.[EMPRESA] 'Name', E.[DIRECCION] 'Address', 
        C.[Nombre] 'CountryName', E.[MAX_NIVEL] 'MaxLevel', E.[MES_FISCAL] 'FiscalMonth', 
        E.[COD_MONEDA] 'CurrencyId', E.*, COUNT(*) OVER() [TotalRows]
      FROM [dbo].[EMP_EMPRESA] E WITH(NOLOCK)
        LEFT OUTER JOIN [dbo].[PAI_PAIS] C WITH(NOLOCK) ON (E.[PAI_ID] = C.[Id])
      WHERE (E.[EMPRESA] LIKE '%' + @inFilterBy + '%'
        OR E.[CODIGO] LIKE '%' + @inFilterBy + '%')
        AND (@inCountryId = 0 OR @inCountryId = E.[PAI_ID])
        AND E.[Status] != 4 -- DON'T RETURN DELETED
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

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Company_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Company_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Company_GetById]
    @inId INT
AS
	SET NOCOUNT ON;

	SELECT [CODIGO] 'Code', [EMPRESA] 'Name', [DIRECCION] 'Address', 
    [MAX_NIVEL] 'MaxLevel', [MES_FISCAL] 'FiscalMonth', 
    [COD_MONEDA] 'CurrencyId', [PAI_ID] 'CountryId', *
  FROM [dbo].[EMP_EMPRESA]
	WHERE [ID] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Company_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Company_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Company_CreateOrUpdate]
  @inId INT,
  @inName NVARCHAR(200),
  @inCode NVARCHAR(10),
  @inAddress NVARCHAR(2000),
  @inMaxLevel INT,
  @inFiscalMonth INT,
  @inCurrencyId INT,
  @inCountryId INT,
  @inIsCommodityRequired BIT,
  @inWeightUnit TINYINT,
  @inStatus TINYINT,
  @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
	  BEGIN
        INSERT INTO [dbo].[EMP_EMPRESA]([CODIGO], [EMPRESA], [PAI_ID], [DIRECCION], [MAX_NIVEL], [MES_FISCAL], [COD_MONEDA], [IsCommodityRequired], [WeightUnit], [Status], [CreatedBy], [ModifiedBy])
        VALUES(@inCode, @inName, @inCountryId, @inAddress, @inMaxLevel, @inFiscalMonth, @inCurrencyId, @inIsCommodityRequired, @inWeightUnit, @inStatus, @inUserId, @inUserId);

        SET @inID = SCOPE_IDENTITY();
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[EMP_EMPRESA]
        SET [CODIGO] = @inCode, 
            [EMPRESA] = @inName,
            [PAI_ID] = @inCountryId,
            [DIRECCION] = @inAddress,
            [MAX_NIVEL] = @inMaxLevel,
            [MES_FISCAL] = @inFiscalMonth,
            [COD_MONEDA] = @inCurrencyId,
            [IsCommodityRequired] = @inIsCommodityRequired,
            [WeightUnit] = @inWeightUnit,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [ID] = @inId;
      END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CIA_COMPANY', 'Company', 'Companies'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='CIA_COMPANY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'CIA_COMPANY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


