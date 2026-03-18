IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CompanyId' AND Object_ID = Object_ID(N'dbo.ENM_ENCABEZADO_MANIFIESTO'))
BEGIN
	ALTER TABLE [ENM_ENCABEZADO_MANIFIESTO] ADD [CompanyId] [int] NULL;
END
GO
ALTER TABLE [ENM_ENCABEZADO_MANIFIESTO] ADD CONSTRAINT [FK_ENM_ENCABEZADO_MANIFIESTO_EMP_EMPRESA] FOREIGN KEY ([CompanyId]) REFERENCES [dbo].[EMP_EMPRESA]([ID]);
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.ENM_ENCABEZADO_MANIFIESTO'))
BEGIN
	ALTER TABLE [ENM_ENCABEZADO_MANIFIESTO] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.ENM_ENCABEZADO_MANIFIESTO'))
BEGIN
	ALTER TABLE [ENM_ENCABEZADO_MANIFIESTO] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.ENM_ENCABEZADO_MANIFIESTO'))
BEGIN
	ALTER TABLE [ENM_ENCABEZADO_MANIFIESTO] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.ENM_ENCABEZADO_MANIFIESTO'))
BEGIN
	ALTER TABLE [ENM_ENCABEZADO_MANIFIESTO] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.ENM_ENCABEZADO_MANIFIESTO'))
BEGIN
	ALTER TABLE [ENM_ENCABEZADO_MANIFIESTO] ADD [ModifiedBy] [uniqueidentifier] NULL;
END;
GO

UPDATE [dbo].[ENM_ENCABEZADO_MANIFIESTO]
SET [Status] = 2
WHERE [Status] != 2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Manifest_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Manifest_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Manifest_GetById]
	@inId INT
AS
	SET NOCOUNT ON;

	SELECT M.[DIRECCION] 'Address', M.[FECHA] 'ManifestDate', M.[NUMERO] 'ManifestNumber', M.[LISTO] 'Ready',
        M.[PAIS] 'CountryCode', M.[FACTURADO] 'Invoiced', M.[CERRADO] 'Closed', M.[SINCRONIZADO] 'Synchronized',
        M.[NOMBRE] 'Name', M.[TIPO] 'Type', M.[TIPOMANIFIESTO] 'ShipType', M.[FORMAENVIO] 'ShippingWay',
        M.[ESTADOFACTURA] 'InvoiceStatus', M.[FACTURACIONAUTOMATICA] 'AutomaticBilling', M.*
	FROM [dbo].[ENM_ENCABEZADO_MANIFIESTO] M WITH(NOLOCK)
	WHERE M.[Id] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Manifest_ValidateNumber')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Manifest_ValidateNumber] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Manifest_ValidateNumber]
    @inId INT,
	@inNumber VARCHAR(50)
AS
	SET NOCOUNT ON;

	SELECT M.[DIRECCION] 'Address', M.[FECHA] 'ManifestDate', M.[NUMERO] 'ManifestNumber', M.[LISTO] 'Ready',
        M.[PAIS] 'CountryCode', M.[FACTURADO] 'Invoiced', M.[CERRADO] 'Closed', M.[SINCRONIZADO] 'Synchronized',
        M.[NOMBRE] 'Name', M.[TIPO] 'Type', M.[TIPOMANIFIESTO] 'ShipType', M.[FORMAENVIO] 'ShippingWay',
        M.[ESTADOFACTURA] 'InvoiceStatus', M.[FACTURACIONAUTOMATICA] 'AutomaticBilling', M.*
	FROM [dbo].[ENM_ENCABEZADO_MANIFIESTO] M WITH(NOLOCK)
	WHERE M.[NUMERO] = @inNumber AND M.[Status] != 4
      AND M.[ID] != @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Manifest_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Manifest_GetPaged] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Manifest_GetPaged]
    @inCompanyId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64),
    @inClosed BIT,
    @inShipTypeId SMALLINT
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'ManifestDate ASC' THEN M.[FECHA] END ASC,
            CASE WHEN @inSortBy = 'ManifestDate DESC' THEN M.[FECHA] END DESC,
            CASE WHEN @inSortBy = 'ManifestNumber ASC' THEN M.[NUMERO] END ASC,
            CASE WHEN @inSortBy = 'ManifestNumber DESC' THEN M.[NUMERO] END DESC,
            CASE WHEN @inSortBy = 'Name ASC' THEN M.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN M.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'ShipType ASC' THEN M.[TIPOMANIFIESTO] END ASC,
            CASE WHEN @inSortBy = 'ShipType DESC' THEN M.[TIPOMANIFIESTO] END DESC,
            CASE WHEN @inSortBy = 'ShippingWayName ASC' THEN TP.[DESCRIPCION] END ASC,
            CASE WHEN @inSortBy = 'ShippingWayName DESC' THEN TP.[DESCRIPCION] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN M.[CERRADO] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN M.[CERRADO] END DESC
          ) AS [RowNum], M.[DIRECCION] 'Address', M.[FECHA] 'ManifestDate', M.[NUMERO] 'ManifestNumber', M.[LISTO] 'Ready',
            M.[PAIS] 'CountryCode', M.[FACTURADO] 'Invoiced', M.[CERRADO] 'Closed', M.[SINCRONIZADO] 'Synchronized',
            M.[NOMBRE] 'Name', M.[TIPO] 'Type', M.[TIPOMANIFIESTO] 'ShipType', M.[FORMAENVIO] 'ShippingWay', TP.[DESCRIPCION] 'ShippingWayName',
            M.[ESTADOFACTURA] 'InvoiceStatus', M.[FACTURACIONAUTOMATICA] 'AutomaticBilling', 
            C.[EMPRESA] 'CompanyName', M.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[ENM_ENCABEZADO_MANIFIESTO] M WITH(NOLOCK)
          LEFT OUTER JOIN [dbo].[EMP_EMPRESA] C WITH(NOLOCK) ON (M.[CompanyId] = C.[ID])
          LEFT OUTER JOIN [dbo].[TIPO_CLASIFICACION] TP WITH(NOLOCK) ON (M.[FORMAENVIO] = TP.[ID])
        WHERE (M.[NUMERO] LIKE '%' + @inFilterBy + '%'
          OR M.[NOMBRE] LIKE '%' + @inFilterBy + '%')
          AND (@inCompanyId = 0 OR C.[ID] = @inCompanyId)
          AND ((@inClosed = 0 AND M.[CERRADO] != 1) OR (@inClosed != 0 AND M.[CERRADO] = 1))
          AND ((@inShipTypeId = -1) OR (@inShipTypeId = M.[TIPOMANIFIESTO]))
          AND M.[Status] != 4 -- DON'T RETURN DELETED COUNTRIES
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'ManifestDate ASC' THEN [ManifestDate] END ASC,
        CASE WHEN @inSortBy = 'ManifestDate DESC' THEN [ManifestDate] END DESC,
        CASE WHEN @inSortBy = 'ManifestNumber ASC' THEN [ManifestNumber] END ASC,
        CASE WHEN @inSortBy = 'ManifestNumber DESC' THEN [ManifestNumber] END DESC,
        CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
        CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
        CASE WHEN @inSortBy = 'ShipType ASC' THEN [ShipType] END ASC,
        CASE WHEN @inSortBy = 'ShipType DESC' THEN [ShipType] END DESC,
        CASE WHEN @inSortBy = 'ShippingWayName ASC' THEN [ShippingWayName] END ASC,
        CASE WHEN @inSortBy = 'ShippingWayName DESC' THEN [ShippingWayName] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_InsertNotification')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_InsertNotification] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_InsertNotification]
@NUMERO int,
@TIPODOCUMENTO varchar(50),
@ESTADO int
AS

BEGIN

	DELETE FROM FC_NOTIFICACIONES WHERE TIPODOCUMENTO = @TIPODOCUMENTO AND NODOCUMENTO = @NUMERO

	INSERT INTO FC_NOTIFICACIONES VALUES (@TIPODOCUMENTO,@NUMERO,GETDATE(),0,NULL)
END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Manifest_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Manifest_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Manifest_CreateOrUpdate]
    @inId INT,
    @inCompanyId INT,
    @inAddress VARCHAR(2000),
    @inManifestDate DATETIME,
    @inManifestNumber VARCHAR(50),
    @inReady TINYINT,
    @inInvoiced TINYINT,
    @inClosed INT,
    @inSynchronized INT,
    @inName VARCHAR(20),
    @inType VARCHAR(20),
    @inShipType INT,
    @inShippingWay INT,
    @inInvoiceStatus INT,
    @inAutomaticBilling INT,
    @inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
    DECLARE @CountryCode VARCHAR(10);

    SELECT @CountryCode = P.[INICIAL]
    FROM [dbo].[EMP_EMPRESA] E WITH(NOLOCK)
    INNER JOIN [dbo].[PAI_PAIS] P WITH(NOLOCK) ON (E.[PAI_ID] = P.[ID])
    WHERE E.[ID] = @inCompanyId;

	IF (ISNULL(@inId, 0) = 0) 
      BEGIN
        INSERT INTO [dbo].[ENM_ENCABEZADO_MANIFIESTO]([CompanyId], [DIRECCION], [FECHA], [NUMERO], [LISTO], [PAIS], [FACTURADO],
            [CERRADO], [SINCRONIZADO], [NOMBRE], [TIPO], [TIPOMANIFIESTO], [FORMAENVIO], [ESTADOFACTURA], [FACTURACIONAUTOMATICA], 
            [Status], [CreatedBy], [ModifiedBy], [CREO], [MODIFICO])
        VALUES (@inCompanyId, @inAddress, @inManifestDate, @inManifestNumber, @inReady, @CountryCode, @inInvoiced, 
            @inClosed, @inSynchronized, @inName, ISNULL(@inType, ''), @inShipType, @inShippingWay, @inInvoiceStatus, @inAutomaticBilling, 
            @inStatus, @inUserId, @inUserId, 'NA', 'NA');

        SET @inId = SCOPE_IDENTITY();
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[ENM_ENCABEZADO_MANIFIESTO]
        SET [CompanyId] = @inCompanyId,
            [DIRECCION] = @inAddress,
            [FECHA] = @inManifestDate, 
            [NUMERO] = @inManifestNumber, 
            [LISTO] = @inReady, 
            [PAIS] = @CountryCode, 
            [FACTURADO] = @inInvoiced, 
            [CERRADO] = @inClosed, 
            [SINCRONIZADO] = @inSynchronized, 
            [NOMBRE] = @inName, 
            [TIPO] = ISNULL(@inType, ''), 
            [TIPOMANIFIESTO] = @inShipType, 
            [FORMAENVIO] = @inShippingWay, 
            [ESTADOFACTURA] = @inInvoiceStatus, 
            [FACTURACIONAUTOMATICA] = @inAutomaticBilling, 
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [Id] = @inId;
		END

	SELECT @inId;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Manifest_ValidateDelete')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Manifest_ValidateDelete] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Manifest_ValidateDelete]
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

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'MNF_MANIFESTS', 'Manifest', 'Manifests'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='MNF_MANIFESTS'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'MNF_MANIFESTS'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_FilterRouteSheet')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_FilterRouteSheet] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_FilterRouteSheet]
    @MANIFEST_NUMBER VARCHAR(50) = NULL,
    @ZONE_CODES VARCHAR(MAX) = NULL,
    @STATUS INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @query NVARCHAR(MAX);

    SET @query = 
    'SELECT 
        EM.NUMERO AS ManifestNumber, 
        EM.FECHA AS ManifestDate, 
        CL.CODIGO AS ClientCode, 
        CL.NOMBRECOMPLETO AS ClientFullName, 
        CL.DIRECCION AS ClientAddress,
        PAQ.ID AS PackageID, 
        PAQ.NUMERO AS PackageNumber, 
        PAQ.DESCRIPCION AS PackageDescription, 
        PAQ.PROCEDENCIA AS PackageOrigin, 
        PAQ.PESO AS PackageWeight, 
        PAQ.PRECIO AS PackagePrice, 
        DM.TIPO AS PackageType,
        A.CODIGO AS AreaCode, 
        A.NOMBRE AS StopName, 
        Z.CODIGO AS ZoneCode, 
        Z.NOMBRE AS ZoneName
    FROM PAI_PAIS PA 
    INNER JOIN ENM_ENCABEZADO_MANIFIESTO EM ON PA.INICIAL = EM.PAIS
    INNER JOIN DEM_DETALLE_MANIFIESTO DM ON EM.ID = DM.ENM_ID
    INNER JOIN PAQ_PAQUETE PAQ ON PAQ.ID = DM.PAQ_ID
    INNER JOIN CLI_CLIENTE CL ON PAQ.CLIENTE = CL.CODIGO
    INNER JOIN ARE_AREA A ON A.ID = CL.ARE_ID
    INNER JOIN ZON_ZONA Z ON A.ZON_ID = Z.ID
    WHERE PAQ.EST_ID = ' + CONVERT(VARCHAR(10), @STATUS);

    IF @ZONE_CODES IS NOT NULL
    BEGIN 
        SET @query = @query + ' AND Z.CODIGO IN (' + @ZONE_CODES + ')';
    END
    
    IF @MANIFEST_NUMBER IS NOT NULL
    BEGIN 
        SET @query = @query + ' AND EM.NUMERO = ''' + @MANIFEST_NUMBER + '''';
    END

    SET @query = @query + 
    ' AND DM.PAQ_ID NOT IN (SELECT PAQ_ID FROM HOJA_RUTA_DETALLE) 
      ORDER BY EM.FECHA DESC';

    EXEC sp_executesql @query;
END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_InsertRouteSheetDetail')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_InsertRouteSheetDetail] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_InsertRouteSheetDetail]
	@HOJARUTA_ID AS INT,
	@PAQ_ID AS INT
AS
BEGIN
	DECLARE @NUMERO INT
	DECLARE @ESTADO_ID INT;
	
	SELECT @ESTADO_ID = EST_OUTFORDELIVERY FROM PAR_PARAMETRO;
	SELECT @NUMERO = NUMERO FROM PAQ_PAQUETE WHERE ID = @PAQ_ID

	INSERT INTO HOJA_RUTA_DETALLE
           ([HOJARUTA_ID], [PAQ_ID], [ESTADO_ID], [COMENTARIO], [NUMERO])
     VALUES
           (@HOJARUTA_ID, @PAQ_ID, @ESTADO_ID, '', @NUMERO)
           
    IF @ESTADO_ID IS NOT NULL
    BEGIN
		UPDATE PAQ_PAQUETE 
		SET EST_ID = @ESTADO_ID
		WHERE ID = @PAQ_ID
	END
	
END



IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_InsertRouteHeader')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_InsertRouteHeader] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_InsertRouteHeader]
	@DESCRIPCION AS VARCHAR(200),
	@IDUSUARIO AS VARCHAR(50),
	@ESTADO AS INT,
	@ZONA_ID AS INT,
	@ID AS INT OUTPUT,
	@ID_TIPOENTREGA int,
	@ID_CAJA int,
	@PAIS VARCHAR(6)
AS
BEGIN

	INSERT INTO HOJA_RUTA_ENCABEZADO
           ([DESCRIPCION], [USUARIO], [ESTADO], [ZONA_ID], [ID_TIPOENTREGA], [ID_CAJA], [PAIS])
     VALUES
           (@DESCRIPCION, @IDUSUARIO, @ESTADO, @ZONA_ID, @ID_TIPOENTREGA, @ID_CAJA, @PAIS)

	SET @ID=SCOPE_IDENTITY()
	RETURN  @ID

END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetRouteSheet')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetRouteSheet] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_GetRouteSheet]
    @HOJARUTA_ID INT = NULL,
    @ESTADO INT = NULL,
    @COMPANY_ID VARCHAR(6),
    @PageIndex INT = 1,
    @PageSize INT = 10,
    @Filter NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageIndex - 1) * @PageSize;

    SELECT DISTINCT 
        E.ID AS RouteSheetID, 
        E.DESCRIPCION AS Description, 
        E.USUARIO AS UserID, 
        E.FECHACREACION AS CreationDate, 
        E.FECHACIERRE AS CloseDate, 
        CASE E.ESTADO 
            WHEN 0 THEN 'Abierta'
            WHEN 1 THEN 'En Ruta'
            ELSE 'Cerrada'
        END AS Status, 
        ISNULL(Z.NOMBRE, '') AS Zone, 
        (
            SELECT STRING_AGG(NOMBRE, ',')
            FROM ARE_AREA 
            WHERE ZON_ID = E.ZONA_ID 
              AND ID IN (
                  SELECT AREA_ID 
                  FROM HOJA_RUTA_AREA 
                  WHERE HOJARUTA_ID = E.ID 
                    AND ZONA_ID = E.ZONA_ID
              )
        ) AS Areas, 
        te.DESCRIPCION AS DeliveryType, 
        fc.NOMBRE AS Branch 
    FROM HOJA_RUTA_ENCABEZADO E
    LEFT JOIN ZON_ZONA Z ON E.ZONA_ID = Z.ID
    LEFT JOIN ARE_AREA A ON Z.ID = A.ZON_ID
    LEFT JOIN TIPOENTREGA te ON te.ID_TIPOENTREGA = E.ID_TIPOENTREGA
    LEFT JOIN FC_CAJA fc ON fc.CAJA_ID = E.ID_CAJA
    WHERE 
        (@HOJARUTA_ID IS NULL OR E.ID = @HOJARUTA_ID)
        AND (@ESTADO IS NULL OR E.ESTADO = @ESTADO)
        AND E.COMPANY_ID = @COMPANY_ID
        AND (
            @Filter IS NULL OR 
            E.DESCRIPCION LIKE '%' + @Filter + '%' OR 
            E.USUARIO LIKE '%' + @Filter + '%' OR
            Z.NOMBRE LIKE '%' + @Filter + '%'
        )
    ORDER BY CreationDate DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ValidatePackageRoute')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_ValidatePackageRoute] AS RETURN')
  END
GO

ALTER PROCEDURE [dbo].[BKO_ValidatePackageRoute]
    @PAQUETE_ID AS INT,
    @HOJARUTA_ID AS INT,
    @RESULTADO AS INT OUTPUT,  -- 0: Valid, 1: Invalid Zone, 2: Invalid Area, 3: Already in Another Route, 4: Not Billed
    @FACTURADO AS BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ZONA_RUTA AS INT
    DECLARE @ZONA_CLIENTE AS INT
    DECLARE @AREA_CLIENTE AS INT

    -- Validate Package Zone Matches Route Map
    SELECT @ZONA_RUTA = ZONA_ID FROM HOJA_RUTA_ENCABEZADO WHERE ID = @HOJARUTA_ID

    SELECT @ZONA_CLIENTE = ZON_ID, @AREA_CLIENTE = ARE_ID 
    FROM CLI_CLIENTE C
    INNER JOIN PAQ_PAQUETE P ON C.CODIGO = P.CLIENTE
    WHERE P.NUMERO = @PAQUETE_ID

	select top 20 * from CLI_CLIENTE

    IF (@ZONA_RUTA != @ZONA_CLIENTE)
    BEGIN
        SET @RESULTADO = 1  -- Invalid Zone
        RETURN
    END 

    IF NOT EXISTS (SELECT 1 FROM HOJA_RUTA_AREA WHERE HOJARUTA_ID = @HOJARUTA_ID AND AREA_ID = @AREA_CLIENTE)
    BEGIN
        SET @RESULTADO = 2  -- Invalid Area
        RETURN
    END

    -- Check if the Package is Already Assigned to Another Route
    IF EXISTS (SELECT 1 FROM HOJA_RUTA_DETALLE WHERE PAQ_ID = (SELECT ID FROM PAQ_PAQUETE WHERE NUMERO = @PAQUETE_ID) AND HOJARUTA_ID <> @HOJARUTA_ID)
    BEGIN
        SET @RESULTADO = 3  -- Already in Another Route
        RETURN
    END

    -- Validate if the Package is Billed
    IF EXISTS (SELECT top 10 * FROM PAQ_PAQUETE WHERE NUMERO = @PAQUETE_ID AND ESTADOFACTURA = 2)  -- 2: Billed
    BEGIN
        SET @FACTURADO = 1
    END
    ELSE
    BEGIN
        SET @FACTURADO = 0
        SET @RESULTADO = 4  -- Not Billed
        RETURN
    END

    -- If everything is valid
    SET @RESULTADO = 0  -- Valid
END

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DeletePackageFromRouteMap')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_DeletePackageFromRouteMap] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_DeletePackageFromRouteMap] 
	-- Add the parameters for the stored procedure here
	@HOJARUTA_ID AS INT,
	@PAQ_ID AS INT
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @PAQ_STATUS INT
	SELECT EST_SCANNER = @PAQ_STATUS FROM PAR_PARAMETRO

    -- Insert statements for procedure here
	Delete from HOJA_RUTA_DETALLE Where 
	HOJARUTA_ID = @HOJARUTA_ID
	AND PAQ_ID = @PAQ_ID
	
	-- Update Package Status
	UPDATE PAQ_PAQUETE 
	SET EST_ID = @PAQ_STATUS
	WHERE ID = @PAQ_ID
		
END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetRoadMapsReport')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_GetRoadMapsReport] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_GetRoadMapsReport]  
    @RoadMapId AS INT  
AS  
BEGIN  
    -- SET NOCOUNT ON added to prevent extra result sets from  
    -- interfering with SELECT statements.  
    SET NOCOUNT ON;  

    SELECT   
        EM.NUMERO AS ManifestNumber,  
        EM.FECHA AS ManifestDate,  
        CL.CODIGO AS ClientCode,  
        CL.NOMBRECOMPLETO AS ClientName,  
        ISNULL(CL.DIRECCION1, '') + ' ' + ISNULL(CL.DIRECCION2, '') AS Address,  
        PAQ.NUMERO AS PackageNumber,  
        PAQ.DESCRIPCION AS Description,  
        PAQ.PROCEDENCIA AS Origin,  
        PAQ.PESO AS Weight,  
        PAQ.PRECIO AS Price,  
        CASE PAQ.PALETS  
            WHEN 0 THEN 1  
            ELSE PAQUETES  
        END AS Pieces,  
        DM.TIPO AS PackageType,  
        A.CODIGO AS AreaCode,  
        A.NOMBRE AS StopName,  
        Z.CODIGO AS ZoneCode,  
        Z.NOMBRE AS Zone,  
        HRD.ESTADO_ID AS StatusId,  
        HRD.HOJARUTA_ID AS RoadMapId,  
        HRD.PAQ_ID AS PackageId,  
        HRD.COMENTARIO AS Comment,  
        PAQ.COURIER AS Courier,  
        RIGHT('000000' + CAST(ISNULL(FP.N_FACTURA,'') AS VARCHAR(6)), 6) AS InvoiceNumber,  
        HRE.DESCRIPCION AS RoadMapName  

    FROM  
        HOJA_RUTA_ENCABEZADO HRE  
    INNER JOIN HOJA_RUTA_DETALLE HRD  
        ON HRE.ID = HRD.HOJARUTA_ID  
    INNER JOIN DEM_DETALLE_MANIFIESTO DM  
        ON HRD.PAQ_ID = DM.PAQ_ID  
    INNER JOIN ENM_ENCABEZADO_MANIFIESTO EM  
        ON EM.ID = DM.ENM_ID  
    INNER JOIN PAI_PAIS PA  
        ON PA.INICIAL = EM.PAIS  
    INNER JOIN PAQ_PAQUETE PAQ  
        ON PAQ.ID = HRD.PAQ_ID  
    INNER JOIN CLI_CLIENTE CL  
        ON PAQ.CLIENTE = CL.CODIGO  
    INNER JOIN ARE_AREA A  
        ON A.ID = CL.ARE_ID  
    INNER JOIN ZON_ZONA Z  
        ON A.ZON_ID = Z.ID  

    LEFT JOIN FC_FACTURAPAQUETES FP  
        ON HRD.NUMERO = FP.NUMERO  
    LEFT JOIN FC_FACTURA F  
        ON FP.N_FACTURA = F.N_FACTURA  

    WHERE HRD.HOJARUTA_ID = @RoadMapId  
    AND ISNULL(F.ESTADO, 0) != 1  
    ORDER BY ClientName ASC  
END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ParcelDeliveryReport')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_ParcelDeliveryReport] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_ParcelDeliveryReport]
	@RoadMapId AS INT, 
	@CompanyId AS INT
AS
BEGIN
	SET NOCOUNT ON;

	SELECT 
		CLI.NOMBRECOMPLETO AS FullName, 
		F.N_FACTURA AS InvoiceNumber, 
		SUM(FD.TOTAL) AS Amount
	FROM FC_FACTURADETALLE FD 
	INNER JOIN FC_FACTURA F ON F.N_FACTURA = FD.N_FACTURA 
	AND F.ID_EMPRESA = @CompanyId
	INNER JOIN CLI_CLIENTE CLI ON CLI.CODIGO = F.CLIENTE
	WHERE FD.N_FACTURA IN
	(
		SELECT F.N_FACTURA 
		FROM FC_FACTURA F
		INNER JOIN FC_FACTURAPAQUETES FP 
			ON FP.N_FACTURA = F.N_FACTURA AND F.ESTADO != 1
		WHERE FP.NUMERO IN
		(
			SELECT P.NUMERO
			FROM HOJA_RUTA_DETALLE HRD
			INNER JOIN PAQ_PAQUETE P 
				ON HRD.PAQ_ID = P.ID 
				AND HRD.HOJARUTA_ID = @RoadMapId
		)
	)
	AND FD.PRODUCTO_ID IN (3,9)
	GROUP BY CLI.NOMBRECOMPLETO, F.N_FACTURA
	ORDER BY FullName, InvoiceNumber;
END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_UpdateRoadMapStatus')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_UpdateRoadMapStatus] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_UpdateRoadMapStatus]
	@HOJARUTA_ID AS INT
AS
BEGIN
	
	UPDATE HOJA_RUTA_ENCABEZADO
	SET ESTADO = 0
	WHERE ID = @HOJARUTA_ID 
	
END