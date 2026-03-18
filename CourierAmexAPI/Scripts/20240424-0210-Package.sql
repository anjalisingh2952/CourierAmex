IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CompanyId' AND Object_ID = Object_ID(N'dbo.PAQ_PAQUETE'))
BEGIN
	ALTER TABLE [PAQ_PAQUETE] ADD [CompanyId] [int] NULL;
END
GO
ALTER TABLE [PAQ_PAQUETE] ADD CONSTRAINT [FK_PAQ_PAQUETE_EMP_EMPRESA] FOREIGN KEY ([CompanyId]) REFERENCES [dbo].[EMP_EMPRESA]([ID]);
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.PAQ_PAQUETE'))
BEGIN
	ALTER TABLE [PAQ_PAQUETE] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.PAQ_PAQUETE'))
BEGIN
	ALTER TABLE [PAQ_PAQUETE] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.PAQ_PAQUETE'))
BEGIN
	ALTER TABLE [PAQ_PAQUETE] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.PAQ_PAQUETE'))
BEGIN
	ALTER TABLE [PAQ_PAQUETE] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.PAQ_PAQUETE'))
BEGIN
	ALTER TABLE [PAQ_PAQUETE] ADD [ModifiedBy] [uniqueidentifier] NULL;
END;
GO

UPDATE [dbo].[PAQ_PAQUETE]
SET [Status] = 2
WHERE [Status] != 2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Package_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Package_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Package_GetById]
	@inId INT
AS
	SET NOCOUNT ON;

	SELECT P.[NUMERO] 'Number', P.[CLIENTE] 'CustomerCode', CONCAT(CL.[NOMBRE], ' ', CL.[APELLIDO1], ' ', CL.[APELLIDO2]) 'CustomerName',
        P.[COURIER] 'TrackingNumber', P.[NOMBRECOURIER] 'CourierName',
        P.[PROCEDENCIA] 'Origin', P.[OBSERVACIONES] 'Observations', P.[SEGURO] 'Insurance', P.[PAQUETES] 'Packages', 
        P.[EST_ID] 'PackageStateId', E.[NOMBRE] 'PackageStateName', P.[DESCRIPCION] 'Description', P.[PESO] 'Weight', 
        P.[PRECIO] 'Price', P.[ANCHO] 'Width', P.[ALTO] 'Height', P.LARGO 'Long', P.[PESOVOLUMETRICO] 'VolumetricWeight', P.[RECIBIDOPOR] 'ReceivedBy', 
        P.[DES_ID] 'DestinationId', P.[ID_ANTERIOR] 'PreviousId', P.[SINCRONIZADO] 'Synched', P.[TIPOPAQUETE] 'PackageType', 
        P.[COD] 'Code', P.[FACTURADO] 'Invoiced', P.[BOLSA] 'Bags', P.[TOTALKILOS] 'TotalWeight', P.[TIPO] 'Type',
        P.[TOTALETIQUETA] 'TotalLabel', P.[DETALLEEMPAQUE] 'PackageDetail', P.[BUSCOCLIENTE] 'SearchCustomer', 
        P.[ESTADOFACTURA] 'InvoiceStatus', P.[ACTUALIZOPRECIO] 'UpdatePrice', P.[TRAEFACTURA] 'HasInvoice', P.[PREVIO] 'PreStudy', 
        P.[ID_COMODITY] 'CommodityId', C.[CODE] 'CommodityCode', C.[DESCRIPTION] 'CommodityName',
        P.[CATEGORIA] 'Category', P.[PIESCUBICOS] 'CubicFeet', P.*
	FROM [dbo].[PAQ_PAQUETE] P WITH(NOLOCK)
        LEFT OUTER JOIN [dbo].[CLI_CLIENTE] CL WITH(NOLOCK) ON (P.[CLIENTE] = CL.[CODIGO])
        LEFT OUTER JOIN [dbo].[EST_ESTADO] E WITH(NOLOCK) ON (P.[EST_ID] = E.[ID])
        LEFT OUTER JOIN [dbo].[FC_COMODITYS] C WITH(NOLOCK) ON (P.[ID_COMODITY] = C.[ID])
	WHERE P.[NUMERO] = @inId;
	
	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Package_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Package_GetPaged] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Package_GetPaged]
    @inCompanyId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64),
    @inStateId INT = 0
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
                CASE WHEN @inSortBy = 'Number ASC' THEN P.[NUMERO] END ASC,
                CASE WHEN @inSortBy = 'Number DESC' THEN P.[NUMERO] END DESC,
                CASE WHEN @inSortBy = 'CustomerCode ASC' THEN P.[CLIENTE] END ASC,
                CASE WHEN @inSortBy = 'CustomerCode DESC' THEN P.[CLIENTE] END DESC,
                CASE WHEN @inSortBy = 'CustomerName ASC' THEN CONCAT(CL.[NOMBRE], ' ', CL.[APELLIDO1], ' ', CL.[APELLIDO2]) END ASC,
                CASE WHEN @inSortBy = 'CustomerName DESC' THEN CONCAT(CL.[NOMBRE], ' ', CL.[APELLIDO1], ' ', CL.[APELLIDO2]) END DESC,
                CASE WHEN @inSortBy = 'CustomerDNI ASC' THEN CL.[IDENTIFICACION] END ASC,
                CASE WHEN @inSortBy = 'CustomerDNI DESC' THEN CL.[IDENTIFICACION] END DESC,
                CASE WHEN @inSortBy = 'TrackingNumber ASC' THEN P.[COURIER] END ASC,
                CASE WHEN @inSortBy = 'TrackingNumber DESC' THEN P.[COURIER] END DESC,
                CASE WHEN @inSortBy = 'Status ASC' THEN P.[Status] END ASC,
                CASE WHEN @inSortBy = 'Status DESC' THEN P.[Status] END DESC
            ) AS [RowNum], P.[NUMERO] 'Number', P.[CLIENTE] 'CustomerCode', 
            CONCAT(CL.[NOMBRE], ' ', CL.[APELLIDO1], ' ', CL.[APELLIDO2]) 'CustomerName',
            CL.[IDENTIFICACION] 'CustomerDNI', P.[COURIER] 'TrackingNumber', P.[NOMBRECOURIER] 'CourierName',
            P.[PROCEDENCIA] 'Origin', P.[EST_ID] 'PackageStateId', E.[NOMBRE] 'PackageStateName',  
            P.[COD] 'Code', P.[TOTALKILOS] 'TotalWeight', P.[TIPO] 'Type',
            P.[ID_COMODITY] 'ComodityId', C.[CODE] 'ComodityCode', C.[DESCRIPTION] 'ComodityName',
            P.[PIESCUBICOS] 'CubicFeet', P.[ID], P.[Status], COUNT(*) OVER() [TotalRows]
        FROM [dbo].[PAQ_PAQUETE] P WITH(NOLOCK)
            LEFT OUTER JOIN [dbo].[CLI_CLIENTE] CL WITH(NOLOCK) ON (P.[CLIENTE] = CL.[CODIGO])
            LEFT OUTER JOIN [dbo].[EST_ESTADO] E WITH(NOLOCK) ON (P.[EST_ID] = E.[ID])
            LEFT OUTER JOIN [dbo].[FC_COMODITYS] C WITH(NOLOCK) ON (P.[ID_COMODITY] = C.[ID])
        WHERE (P.[NUMERO] LIKE '%' + @inFilterBy + '%'
          OR P.[COURIER] LIKE '%' + @inFilterBy + '%'
          OR P.[NOMBRECOURIER] LIKE '%' + @inFilterBy + '%'
          OR P.[DESCRIPCION] LIKE '%' + @inFilterBy + '%'
          OR CONCAT(CL.[NOMBRE], ' ', CL.[APELLIDO1], ' ', CL.[APELLIDO2]) LIKE '%' + @inFilterBy + '%'
          OR CL.[IDENTIFICACION] LIKE '%' + @inFilterBy + '%')
          AND (@inCompanyId = 0 OR C.[ID] = @inCompanyId)
          AND (@inStateId = 0 OR P.[EST_ID] = @inStateId)
          AND P.[Status] != 4 -- DON'T RETURN DELETED PACKAGES
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'Number ASC' THEN [Number] END ASC,
        CASE WHEN @inSortBy = 'Number DESC' THEN [Number] END DESC,
        CASE WHEN @inSortBy = 'CustomerCode ASC' THEN [CustomerCode] END ASC,
        CASE WHEN @inSortBy = 'CustomerCode DESC' THEN [CustomerCode] END DESC,
        CASE WHEN @inSortBy = 'CustomerName ASC' THEN [CustomerName] END ASC,
        CASE WHEN @inSortBy = 'CustomerName DESC' THEN [CustomerName] END DESC,
        CASE WHEN @inSortBy = 'CustomerDNI ASC' THEN [CustomerDNI] END ASC,
        CASE WHEN @inSortBy = 'CustomerDNI DESC' THEN [CustomerDNI] END DESC,
        CASE WHEN @inSortBy = 'TrackingNumber ASC' THEN [TrackingNumber] END ASC,
        CASE WHEN @inSortBy = 'TrackingNumber DESC' THEN [TrackingNumber] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetNumero')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_GetNumero] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GetNumero] 
	-- Add the parameters for the stored procedure here
	(@inUserName varchar(50), @inGateway varchar(10), @inIncrement bit)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	Declare @NumeroInicial Int
	Declare @NumeroFinal Int
	Declare @GatewaySistema Varchar(10)
	Declare @Paquete int
	
	SET @GatewaySistema = @inGateway
	
	SELECT @NumeroInicial = NUMEROINICIAL, @NumeroFinal = NUMEROFINAL
	FROM PAR_PARAMETRO
	
	Select @Paquete =  Max(Numero) + 1  from CON_CONSECUTIVO Where GAETWAY = @GatewaySistema
	
	If (@GatewaySistema != '') -- No Es un Distribuidor
	Begin
		If (@Paquete < @NumeroInicial)
			Set @Paquete = @NumeroInicial
		Else If (@Paquete >= @NumeroFinal)
			RAISERROR ('Ya excedió el número máximo, contacte a su administrador!', 11,1)		
	End

	IF(@inIncrement = 1)
		Insert Into CON_CONSECUTIVO values(@Paquete, GETDATE(), @inUserName, @GatewaySistema)
	Else
		Set @Paquete = @Paquete - 1

	Return @Paquete 
	
END
GO


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Package_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Package_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Package_CreateOrUpdate]
    @inId INT,
    @inCompanyId INT,
    @inNumber BIGINT,
    @inCustomerCode VARCHAR(200),
    @inTrackingNumber VARCHAR(200),
    @inCourierName VARCHAR(1000),
    @inOrigin VARCHAR(1000),
    @inObservations VARCHAR(5000),
    @inInsurance INT,
    @inPackages INT,
	@inPackageStateId INT,
    @inDescription VARCHAR(200),
    @inWeight MONEY,
    @inPrice MONEY,
    @inWidth MONEY,
    @inHeight MONEY,
    @inlong MONEY,
    @inVolumetricWeight MONEY,
    @inReceivedBy VARCHAR(250),
    @inPackageType INT,
    @inPalets INT,
    @inBags INT,
    @inTotalWeight MONEY,
    @inType VARCHAR(50),
    @inTotalLabel VARCHAR(50),
    @inPackageDetail VARCHAR(1000),
    @inSearchCustomer BIT,
    @inUpdatePrice BIT,
    @inHasInvoice INT,
    @inPreStudy INT,
    @inDUA NVARCHAR(30),
    @inCommodityId INT,
    @inResources VARCHAR(2048),
    @inCategory  VARCHAR(1),
	@inTaxType INT,
    @inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
    DECLARE @CountryCode AS VARCHAR(10);
	DECLARE @InitialStatus AS INT
    DECLARE @CubicFeet AS MONEY
	DECLARE @UserName AS NVARCHAR(50)

	SELECT @InitialStatus = EST_INICIAL FROM PAR_PARAMETRO
	SET @CubicFeet = CONVERT(DECIMAL (18,2), (@inHeight / 12.00) * ( @inWidth / 12.00) * (@inlong / 12.00) )

	SELECT @UserName = [USERNAME] FROM BKO_USER WHERE ID = @inUserId

    SELECT @CountryCode = P.[INICIAL]
    FROM [dbo].[EMP_EMPRESA] E WITH(NOLOCK)
    INNER JOIN [dbo].[PAI_PAIS] P WITH(NOLOCK) ON (E.[PAI_ID] = P.[ID])
    WHERE E.[ID] = @inCompanyId


	-- SI ES JAMAICA SE COLOCA CON TRAE FACTURA Y PREVIO
	IF (@CountryCode = 'KIN')
	BEGIN
		SET @inHasInvoice = 1
		SET @inPreStudy = 1
	END

	IF EXISTS (SELECT 1 FROM PAQ_PAQUETE WHERE COURIER = @inTrackingNumber AND COURIER NOT IN ('', 'WALKING'))
	BEGIN
		RAISERROR ('El número de courier ya existe en el sistema.', -- Message text.
               16, -- Severity.
               1 -- State.
               );
	END
	ELSE IF EXISTS (SELECT 1 FROM PAQ_PAQUETE WHERE NUMERO = @inNumber) -- ** quitar.
	BEGIN
		RAISERROR ('El número de paquete ya existe en el sistema.', -- Message text.
               16, -- Severity.
               1 -- State.
               );
	END
	ELSE
	BEGIN
		
		IF (ISNULL(@inId, 0) = 0) 
		  BEGIN

		  	EXEC @inNumber = [BKO_GetNumero] @UserName, '', true

			INSERT INTO [dbo].[PAQ_PAQUETE]([CompanyId],
				[NUMERO], [CLIENTE], [COURIER], [NOMBRECOURIER], [PROCEDENCIA], [OBSERVACIONES], 
				[SEGURO], [PAIS],[PAQUETES], [EST_ID], [DESCRIPCION], [PESO], [PRECIO], [ANCHO], [ALTO], [LARGO], [PESOVOLUMETRICO],
				[RECIBIDOPOR], [TIPOPAQUETE], [PALETS], [BOLSA], [TOTALKILOS], 
				[TIPO], [TOTALETIQUETA], [DETALLEEMPAQUE], [BUSCOCLIENTE], [ACTUALIZOPRECIO], [TRAEFACTURA], 
				[PREVIO], [DUA], [ID_COMODITY], [Resources], [CATEGORIA], [PIESCUBICOS], [Status], [CreatedBy], [ModifiedBy], [CREO], [MODIFICO])
			VALUES (@inCompanyId, 
				@inNumber, @inCustomerCode, @inTrackingNumber, @inCourierName, @inOrigin, @inObservations,
				@inInsurance, @CountryCode, @inPackages, @InitialStatus, @inDescription, @inWeight, @inPrice, @inWidth, @inHeight, @inlong, @inVolumetricWeight, 
				@inReceivedBy, @inPackageType, @inPalets, @inBags, @inTotalWeight, 
				@inType, @inTotalLabel, @inPackageDetail, @inSearchCustomer, @inUpdatePrice, @inHasInvoice, 
				@inPreStudy, @inDua, @inCommodityId, @inResources, @inCategory, @CubicFeet, @inStatus, @inUserId, @inUserId, @UserName, @UserName);

			SET @inId = SCOPE_IDENTITY();
		  END
		ELSE
		  BEGIN
			UPDATE [dbo].[PAQ_PAQUETE]
			SET 
				[COURIER] = @inTrackingNumber,
				[NOMBRECOURIER] = @inCourierName,
				[PROCEDENCIA] = @inOrigin,
				[OBSERVACIONES] = @inObservations,
				[SEGURO] = @inInsurance,
				[PAQUETES] = @inPackages,
				[EST_ID] = @inPackageStateId,
				[DESCRIPCION] = @inDescription,
				[PESO] = @inWeight,
				[PRECIO] = @inPrice,
				[ANCHO] = @inWidth,
				[ALTO] = @inHeight,
				[LARGO] = @inlong,
				[PESOVOLUMETRICO] = @inVolumetricWeight,
				[RECIBIDOPOR] = @inReceivedBy,
				[TIPOPAQUETE] = @inPackageType,
				[PALETS] = @inPalets,
				[BOLSA] = @inBags,
				[TOTALKILOS] = @inTotalWeight,
				[TIPO] = @inType,
				[TOTALETIQUETA] = @inTotalLabel,
				[DETALLEEMPAQUE] = @inPackageDetail,
				[BUSCOCLIENTE] = @inSearchCustomer,
				[ACTUALIZOPRECIO] = @inUpdatePrice,
				[TRAEFACTURA] = @inHasInvoice,
				[PREVIO] = @inPreStudy,
				[DUA] = @inDua,
				[ID_COMODITY] = @inCommodityId,
				[Resources] = @inResources,
				[CATEGORIA] = @inCategory,
				[PIESCUBICOS] = @CubicFeet,
				[Status] = @inStatus,
				[ModifiedAt] = GETDATE(),
				[ModifiedBy] = @inUserId
			WHERE [Id] = @inId;
		END

		IF (@inTaxType != 0)
		BEGIN

			EXECUTE [usp_InsertPaqueteClasificacion] @inNumber, @inTaxType

		END

		SELECT @inNumber;

	END

GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Package_ValidateDelete')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Package_ValidateDelete] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Package_ValidateDelete]
	@inId INT
AS
	SET NOCOUNT ON;

    DECLARE @PAQSCOUNT INT;
    DECLARE @GUIDESCOUNT INT;

    SELECT @PAQSCOUNT = COUNT(1)
    FROM [dbo].[DEM_DETALLE_MANIFIESTO] WITH(NOLOCK)
    WHERE [ENM_ID] = @inId;

    SELECT @GUIDESCOUNT = COUNT(1)
    FROM [dbo].[BLMADRE] WITH(NOLOCK)
    WHERE [EMN_ID] = @inId;

    IF (@PAQSCOUNT > 0 OR @GUIDESCOUNT > 0)
      BEGIN
        SELECT @inId 'Id';
      END
    ELSE
      BEGIN
        SELECT 0 'Id';
      END

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Package_ValidateNumber')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Package_ValidateNumber] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Package_ValidateNumber]
    @inId INT,
	  @inNumber INT
AS
	SET NOCOUNT ON;

	SELECT P.[NUMERO] 'Number', P.[CLIENTE] 'CustomerCode', CONCAT(CL.[NOMBRE], ' ', CL.[APELLIDO1], ' ', CL.[APELLIDO2]) 'CustomerName',
        P.[COURIER] 'TrackingNumber', P.[NOMBRECOURIER] 'CourierName',
        P.[PROCEDENCIA] 'Origin', P.[OBSERVACIONES] 'Observations', P.[SEGURO] 'Insurance', P.[PAQUETES] 'Packages', 
        P.[EST_ID] 'PackageStateId', E.[NOMBRE] 'PackageStateName', P.[DESCRIPCION] 'Description', P.[PESO] 'Weight', 
        P.[PRECIO] 'Price', P.[ANCHO] 'Width', P.[ALTO] 'Height', P.[PESOVOLUMETRICO] 'VolumetricWeight', P.[RECIBIDOPOR] 'ReceivedBy', 
        P.[DES_ID] 'DestinationId', P.[ID_ANTERIOR] 'PreviousId', P.[SINCRONIZADO] 'Synched', P.[TIPOPAQUETE] 'PackageType', 
        P.[COD] 'Code', P.[FACTURADO] 'Invoiced', P.[BOLSA] 'Bags', P.[TOTALKILOS] 'TotalWeight', P.[TIPO] 'Type',
        P.[TOTALETIQUETA] 'TotalLabel', P.[DETALLEEMPAQUE] 'PackageDetail', P.[BUSCOCLIENTE] 'SearchCustomer', 
        P.[ESTADOFACTURA] 'InvoiceStatus', P.[ACTUALIZOPRECIO] 'UpdatePrice', P.[TRAEFACTURA] 'Invoice', P.[PREVIO] 'Previous', 
        P.[ID_COMODITY] 'ComodityId', C.[CODE] 'ComodityCode', C.[DESCRIPTION] 'ComodityName',
        P.[CATEGORIA] 'Category', P.[PIESCUBICOS] 'CubicFeet', P.*
	FROM [dbo].[PAQ_PAQUETE] P WITH(NOLOCK)
        LEFT OUTER JOIN [dbo].[CLI_CLIENTE] CL WITH(NOLOCK) ON (P.[CLIENTE] = CL.[CODIGO])
        LEFT OUTER JOIN [dbo].[EST_ESTADO] E WITH(NOLOCK) ON (P.[EST_ID] = E.[ID])
        LEFT OUTER JOIN [dbo].[FC_COMODITYS] C WITH(NOLOCK) ON (P.[ID_COMODITY] = C.[ID])
	WHERE P.[NUMERO] = @inNumber
      AND P.[ID] != @inId;

	SET NOCOUNT OFF; 
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_PACKAGE', 'Package', 'Packages'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_PACKAGE'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_PACKAGE'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

/*
--ASIGNAR PAQUETES A LA COMPANY QUE POR PAIS REPRESENTA
UPDATE P
SET [CompanyId] = P.[ID]
FROM PAQ_PAQUETE M WITH(NOLOCK)
  LEFT OUTER JOIN PAI_PAIS P WITH(NOLOCK) ON (M.PAIS = P.INICIAL)
  LEFT OUTER JOIN EMP_EMPRESA E WITH(NOLOCK) ON (P.ID = E.[PAI_ID])

-- ESTOS PAQUETES NO TIENEN UNA EMPRESA 
SELECT C.[ID], P.[ID], P.[PAIS], E.[ID]
FROM PAQ_PAQUETE P WITH(NOLOCK)
  LEFT OUTER JOIN PAI_PAIS C WITH(NOLOCK) ON (P.PAIS = C.INICIAL)
  LEFT OUTER JOIN EMP_EMPRESA E WITH(NOLOCK) ON (C.ID = E.[PAI_ID])
WHERE E.[ID] IS NULL

*/