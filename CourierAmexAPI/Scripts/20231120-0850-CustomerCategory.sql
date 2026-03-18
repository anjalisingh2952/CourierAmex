IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE_CATEGORIA'))
BEGIN
	ALTER TABLE [CLI_CLIENTE_CATEGORIA] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE_CATEGORIA'))
BEGIN
	ALTER TABLE [CLI_CLIENTE_CATEGORIA] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE_CATEGORIA'))
BEGIN
	ALTER TABLE [CLI_CLIENTE_CATEGORIA] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE_CATEGORIA'))
BEGIN
	ALTER TABLE [CLI_CLIENTE_CATEGORIA] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE_CATEGORIA'))
BEGIN
	ALTER TABLE [CLI_CLIENTE_CATEGORIA] ADD [ModifiedBy] [uniqueidentifier] NULL;
END
GO

UPDATE [dbo].[CLI_CLIENTE_CATEGORIA]
SET [Status] = 2
WHERE [Status]!=2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Products_GetByCompany')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Products_GetByCompany] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Products_GetByCompany]
  @inCompanyId INT
AS
	SET NOCOUNT ON;

	SELECT P.[ID], P.[DESCRIPCION] 'Name', P.[PRECIOBASE] 'Price', P.[TIPO] 'Type', P.[RANGOPRECIO] 'PriceRange',
      P.[EXENTO] 'Exempt', P.[IMPUESTOADUANA] 'CustomsTax', P.[CANTIDADFIJA] 'FixedAmount', P.[CANTIDAD] 'Amount',
      P.[UNPUNTO] 'OnePoint', P.[DOSPUNTOS] 'TwoPoint', P.[DOCUMENTOS] 'Documents', P.[OTROSCARGOS] 'OtherCharges',
	    P.[OTROSCARGOS_TIPODOCUMENTO] 'DocumentTypeCharges', P.[PRECIOBASE] 'UnitPrice',
	    P.[OtrosCargosNumeroIdentidadTercero] 'OtherChangesIdThree', P.[OtrosCargosNombreTercero] 'OtherChangesNameThree',
      P.[OtrosCargosTipoIdentidadTercero] 'OtherChangesTypeIdThree', P.[AEREO] 'Air', P.[MARITIMO] 'Sea', 
      P.[CargosAdicionalesPaquete] 'AdditionalChargesPackage', CB.[CodigoBienServicio] 'GoodServiceCode',
      CB.[DescripcionBienServicio] 'GoodServiceName', CB.[Impuesto] 'Tax', P.[EXTERIOR] 'Exterior', P.[ID_EMPRESA] 'CompanyId'
	FROM [dbo].[FC_PRODUCTOS] P WITH(NOLOCK)
	  INNER JOIN [dbo].[CatalogoBienesServicios] CB WITH(NOLOCK) ON (CB.[CodigoBienServicio] = P.[CodigoBienServicio])
	WHERE P.[ID_EMPRESA] = @inCompanyId
	ORDER BY P.[DESCRIPCION] ASC

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ClientCategory_GetByCompany')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_ClientCategory_GetByCompany] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_ClientCategory_GetByCompany]
    @inCompanyId INT
AS
	SET NOCOUNT ON;

	SELECT [EMPRESA_ID] 'CompanyId', [CATEGORIA] 'Id', [DESCRIPCION] 'Name', [DESCUENTO] 'Discount'
    FROM [dbo].[CLI_CLIENTE_CATEGORIA]
    WHERE [Status] = 2
    AND [EMPRESA_ID] = @inCompanyId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ClientCategory_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_ClientCategory_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_ClientCategory_GetPaged]
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
            CASE WHEN @inSortBy = 'Name ASC' THEN Cat.[DESCRIPCION] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN Cat.[DESCRIPCION] END DESC,
            CASE WHEN @inSortBy = 'CompanyName ASC' THEN C.[EMPRESA] END ASC,
            CASE WHEN @inSortBy = 'CompanyName DESC' THEN C.[EMPRESA] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN Cat.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN Cat.[Status] END DESC
          ) AS [RowNum], Cat.[CATEGORIA] 'Id', Cat.[DESCRIPCION] 'Name', C.[ID] 'CompanyId', C.[EMPRESA] 'CompanyName', 
          Cat.[DESCUENTO] 'Discount', Cat.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[CLI_CLIENTE_CATEGORIA] Cat WITH(NOLOCK)
          LEFT OUTER JOIN [dbo].[EMP_EMPRESA] C WITH(NOLOCK) ON (Cat.[EMPRESA_ID] = C.[ID])
        WHERE (C.[EMPRESA] LIKE '%' + @inFilterBy + '%' 
            OR Cat.[DESCRIPCION] LIKE '%' + @inFilterBy + '%')
          AND (@inCompanyId = 0 OR Cat.[EMPRESA_ID] = @inCompanyId)
          AND Cat.[Status] != 4 -- DON'T RETURN DELETED
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

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ClientCategory_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_ClientCategory_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_ClientCategory_GetById]
    @inId TINYINT
AS
	SET NOCOUNT ON;

    DECLARE @ExcludedProducts NVARCHAR(MAX);
    DECLARE @IncludedProducts NVARCHAR(MAX);

    SELECT @ExcludedProducts = [PRODUCTOSEXCLUIDOS], @IncludedProducts = [PRODUCTOSINCLUIDOS]
    FROM [dbo].[CLI_CLIENTE_CATEGORIA]
    WHERE [CATEGORIA] = @inId;

	SELECT [EMPRESA_ID] 'CompanyId', [CATEGORIA] 'Id', [DESCRIPCION] 'Name', [DESCUENTO] 'Discount', *
    FROM [dbo].[CLI_CLIENTE_CATEGORIA]
	WHERE [CATEGORIA] = @inId;

    WITH ExcludedProducts AS
    (
        SELECT [value] 'Id'
        FROM STRING_SPLIT(@ExcludedProducts, ',')
        WHERE RTRIM([value]) <> ''
    )
    SELECT P.[ID], P.[DESCRIPCION] 'Name'
    FROM [dbo].[FC_PRODUCTOS] P WITH(NOLOCK)
        INNER JOIN [ExcludedProducts] E ON (P.[ID] = E.[Id])
    ORDER BY P.[DESCRIPCION] ASC;

    WITH IncludedProducts AS
    (
        SELECT [value] 'Id'
        FROM STRING_SPLIT(@IncludedProducts, ',')
        WHERE RTRIM([value]) <> ''
    )
    SELECT P.[ID], P.[DESCRIPCION] 'Name'
    FROM [dbo].[FC_PRODUCTOS] P WITH(NOLOCK)
        INNER JOIN [IncludedProducts] I ON (P.[ID] = I.[Id])
    ORDER BY P.[DESCRIPCION] ASC;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ClientCategory_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_ClientCategory_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_ClientCategory_CreateOrUpdate]
  @inId TINYINT,
  @inCompanyId INT,
	@inName NVARCHAR(50),
  @inDiscount INT,
  @inExcludedProducts NVARCHAR(50),
  @inIncludedProducts NVARCHAR(50),
  @inStatus TINYINT,
  @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
	  BEGIN
        SELECT @inId = ISNULL(MAX([CATEGORIA]), 0) + 1 FROM [dbo].[CLI_CLIENTE_CATEGORIA];

        INSERT INTO [dbo].[CLI_CLIENTE_CATEGORIA]([CATEGORIA], [EMPRESA_ID], [DESCRIPCION], [DESCUENTO], [PRODUCTOSEXCLUIDOS], [PRODUCTOSINCLUIDOS], [Status], [CreatedBy], [ModifiedBy])
        VALUES(@inId, @inCompanyId, @inName, @inDiscount, @inExcludedProducts, @inIncludedProducts, @inStatus, @inUserId, @inUserId);
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[CLI_CLIENTE_CATEGORIA]
        SET [DESCRIPCION] = @inName, 
            [EMPRESA_ID] = @inCompanyId,
            [DESCUENTO] = @inDiscount,
            [PRODUCTOSEXCLUIDOS] = @inExcludedProducts,
            [PRODUCTOSINCLUIDOS] = @inIncludedProducts,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [CATEGORIA] = @inId;
      END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CIA_CLIENTCATEGORY', 'Company', 'Client Categories'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='CIA_CLIENTCATEGORY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'CIA_CLIENTCATEGORY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.[RoleId] AND [PermissionId]=t.PermissionId
);
GO


