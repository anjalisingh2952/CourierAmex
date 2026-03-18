INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'MNF_AIR_CLASSIFY', 'Manifest', 'Air Classify'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='MNF_AIR_CLASSIFY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'MNF_AIR_CLASSIFY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CompanyId' AND Object_ID = Object_ID(N'dbo.GUIAMADRE'))
BEGIN
	ALTER TABLE [GUIAMADRE] ADD [CompanyId] [int] NULL;
END
GO

UPDATE [GUIAMADRE] 
SET [CompanyId] = 2
WHERE [TO] = 'SJO'
GO


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Manifest_GetAirGuides')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Manifest_GetAirGuides] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Manifest_GetAirGuides]
	@inCompanyId INT,
	@inId INT
AS
BEGIN

	
	SELECT 
		ID AS [Id],
		GUIAMADRE_ID AS MasterGuideId,
		CONSECUTIVO AS Consecutive,
		TIPO AS [Type],
		GUIAHIJA AS Guide,
		GUIAHIJA + '-' + NOMBRE AS GuideName,
		CONSIGNEE,
		Contact,
		NOMBRE AS ConctactName,
		TIPO_IDENTIFICACION AS DocumentTypeId,
		IDENTIFICACION AS DocumentId,
		ESTADO AS [Status],
		ANCHO AS Width,
		ALTO AS Height,
		LARGO AS Long,
		PESOVOLUMETRICOREAL AS VolumetricWeightReal,
		PESOREAL AS WeightReal,
		PESOVOLUMETRICOSISTEMA AS VolumetricWeighSystem,
		PESOSISTEMA AS WeightSystem,
		PAQUETES AS packages

	FROM GUIAHIJA 
	WHERE GUIAMADRE_ID = @inId

END
GO


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_MasterGuide_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_MasterGuide_GetById] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_MasterGuide_GetById]
	@inId INT
AS
BEGIN
	SELECT [ID]
		  ,[EMN_ID]
		  ,[SHIPPER]
		  ,[AIRWAYBILL]
		  ,[ISSUINGCARRIERNAME]
		  ,[ISSUINGCARRIERCITY]
		  ,[AIRPORTDEPARTURE]
		  ,[TO]
		  ,[AIRPORTDESTINATION]
		  ,[FIRSTCARRIER]
		  ,[FLIGHTDATE]
		  ,[ACCOUNTINGINFORMATION]
		  ,[PLACE]
		  ,[SIGNATURE]
		  ,[USUARIO] AS 'USERNAME'
		  ,[FECHA] AS 'DATE'
	  FROM [dbo].[GUIAMADRE]
	  WHERE EMN_ID = @inId

END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_MasterGuide_CreateOrUpdate')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_MasterGuide_CreateOrUpdate] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_MasterGuide_CreateOrUpdate]
	@inId AS INT,
	@inManifestId AS INT,
	@inShipper AS NVARCHAR(1000),
	@inAirWayBill AS NVARCHAR(1000),
	@inIssuingCarrierName AS NVARCHAR(100),
	@inIssuingCarrierCity AS NVARCHAR(100),
	@inAirPortDeparture AS NVARCHAR(100),
	@inTo AS NVARCHAR(50),
	@inAirPortDestination AS NVARCHAR(100),
	@inFirstCarrier AS NVARCHAR(100),
	@inFlightDate AS DATE,
	@inAccountingInformation AS NVARCHAR(1000),
	@inPlace AS NVARCHAR(50),
	@inSignature AS NVARCHAR(50),
	@inUserId UNIQUEIDENTIFIER
AS
BEGIN
	Declare @UserName AS NVARCHAR(25)

	SELECT @UserName = [USERNAME] FROM BKO_USER WHERE ID = @inUserId

	IF (ISNULL(@inId, 0) = 0) 
	BEGIN

		INSERT INTO GUIAMADRE
			(EMN_ID
			,SHIPPER
			,AIRWAYBILL
			,ISSUINGCARRIERNAME
			,ISSUINGCARRIERCITY
			,AIRPORTDEPARTURE
			,[TO]
			,AIRPORTDESTINATION
			,FIRSTCARRIER
			,FLIGHTDATE
			,ACCOUNTINGINFORMATION
			,PLACE
			,[SIGNATURE]
			,USUARIO
			,FECHA)
		VALUES
			(@inManifestId,
			@inShipper,
			@inAirWayBill,
			@inIssuingCarrierName,
			@inIssuingCarrierCity,
			@inAirPortDeparture,
			@inTo,
			@inAirPortDestination,
			@inFirstCarrier,
			@inFlightDate,
			@inAccountingInformation,
			@inPlace,
			@inSignature,
			@UserName,
			GETDATE())
	END
	ELSE
	BEGIN
		UPDATE GUIAMADRE
			SET SHIPPER = @inShipper
			,AIRWAYBILL = @inAirWayBill
			,ISSUINGCARRIERNAME = @inIssuingCarrierName
			,ISSUINGCARRIERCITY = @inIssuingCarrierCity
			,AIRPORTDEPARTURE = @inAirPortDeparture
			,[TO] = @inTo
			,AIRPORTDESTINATION = @inAirPortDestination
			,FIRSTCARRIER = @inFirstCarrier
			,FLIGHTDATE = @inFlightDate
			,ACCOUNTINGINFORMATION = @inAccountingInformation
			,PLACE = @inPlace
			,[SIGNATURE] = @inSignature
			,USUARIO = @UserName
		WHERE ID = @inId

	END
END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_AirGuide_Delete')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_AirGuide_Delete] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_AirGuide_Delete]
	@inId AS INT,
	@inMasterGuideId AS INT,
	@inUserId UNIQUEIDENTIFIER
AS
BEGIN
	Declare @UserName AS NVARCHAR(25)
	SELECT @UserName = [USERNAME] FROM BKO_USER WHERE ID = @inUserId

	DELETE FROM GUIAHIJA
	WHERE GUIAMADRE_ID = @inMasterGuideId
	AND ID = @inId

END
GO


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_AirGuide_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_AirGuide_GetById] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_AirGuide_GetById]
	@inId AS INT
AS
BEGIN

	SELECT 
		Id,
		GUIAMADRE_ID AS 'MasterGuideId',
		TIPO AS 'Type',
		CONSECUTIVO AS 'Consecutive',
		GUIAHIJA AS 'Guide',
		CONSIGNEE AS 'Consignee',
		CONTACT AS 'Contact',
		NOMBRE AS 'Name',
		TIPO_IDENTIFICACION AS 'IdentificationType',
		IDENTIFICACION AS 'Identification',
		ESTADO AS 'Status',
		USUARIO AS 'UserName',
		FECHA AS 'Date' 
	FROM [dbo].[GUIAHIJA]
	WHERE ID = @inId

END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Package_GetByManifestAirGuide')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Package_GetByManifestAirGuide] AS RETURN')
  END
GO

ALTER PROCEDURE [dbo].[BKO_Package_GetByManifestAirGuide]
    @inCompanyId INT,
    @inManifestId INT,
	@inAirGuide VARCHAR(20)

AS
BEGIN

	SET NOCOUNT ON;


	;WITH CTE_PackageInfo AS (
		SELECT 
			P.[NUMERO] 'Number', 
			P.[CLIENTE] 'CustomerCode', 
			C.[NombreCompleto] AS 'CustomerName',
			C.[IDENTIFICACION] 'CustomerDNI', 
			P.[COURIER] 'TrackingNumber', 
			P.[NOMBRECOURIER] 'CourierName',
			P.[PROCEDENCIA] 'Origin', 
			P.[EST_ID] 'PackageStateId', 
			P.[COD] 'Code', 
			P.[TOTALKILOS] 'TotalWeight', 
			P.[TIPO] 'Type',
			P.[ID_COMODITY] 'ComodityId', 
			P.[PIESCUBICOS] 'CubicFeet', 
			P.[Id], 
			P.[Status],
			P.Peso as 'Weight',
			P.PesoVolumetrico AS 'VolumetricWeight',
			CONVERT(varchar, CONVERT(INT, ROUND(P.LARGO,0,1))) +  ' x ' + CONVERT(varchar, CONVERT(INT, ROUND(P.ANCHO,0,1)))  + ' x ' + CONVERT(varchar, CONVERT(INT, ROUND(P.ALTO,0,1))) AS 'Dimension',
			P.CreatedAt
		FROM [dbo].[PAQ_PAQUETE] P WITH(NOLOCK)
		INNER JOIN [dbo].CLI_CLIENTE C WITH(NOLOCK)
		ON (P.CLIENTE = C.CODIGO)
		INNER JOIN DEM_DETALLE_MANIFIESTO D
		ON (P.ID = D.PAQ_ID)
		WHERE (@inCompanyId = 0 OR P.[CompanyId] = @inCompanyId) 
		AND (D.ENM_ID = @inManifestId)
		AND (D.ENM_ID = @inManifestId)
		AND (D.BOLSA = @inAirGuide)
	)
	SELECT
		o.[Number], 
		o.[CustomerCode], 
		o.[CustomerName],
		o.[CustomerDNI], 
		o.[TrackingNumber], 
		o.[CourierName],
		o.[Origin], 
		o.[PackageStateId], 
		o.[Code], 
		o.[TotalWeight], 
		o.[Type],
		o.[ComodityId], 
		o.[CubicFeet], 
		o.[Id], 
		o.[Status],
		o.[Weight],
		o.[VolumetricWeight],
		o.[Dimension],
		o.[CreatedAt],
		E.[NOMBRE] 'PackageStateName',  
		C.[CODE] 'ComodityCode', 
		C.[DESCRIPTION] 'ComodityName'
	FROM CTE_PackageInfo as o
	INNER JOIN [dbo].[EST_ESTADO] E WITH(NOLOCK)
	ON (E.ID = o.PackageStateId)
	LEFT JOIN [dbo].[FC_COMODITYS] C WITH(NOLOCK)
	ON (C.ID = o.ComodityId);

SET NOCOUNT OFF; 

END


IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_ChildGuide_CreateOrUpdate]') AND type = 'P')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_ChildGuide_CreateOrUpdate] AS BEGIN RETURN END')
END
GO

ALTER PROCEDURE [dbo].[BKO_ChildGuide_CreateOrUpdate]
    @GUIAHIJA_ID INT = NULL,
    @GUIAMADRE_ID INT = NULL,
    @TIPO AS NVARCHAR(10) = NULL,
    @CONSECUTIVO AS INT = NULL,
    @GUIAHIJA AS NVARCHAR(25) = NULL,
    @CONSIGNEE AS NVARCHAR(1000),
    @CONTACT AS NVARCHAR(1000),
    @NOMBRE AS NVARCHAR(100),
    @TIPO_IDENTIFICACION AS NVARCHAR(100),
    @IDENTIFICACION AS NVARCHAR(100),
    @ESTADO AS NVARCHAR(100),
    @USUARIO AS NVARCHAR(25)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM [dbo].[GUIAHIJA] WHERE ID = @GUIAHIJA_ID)
    BEGIN
        UPDATE [dbo].[GUIAHIJA]
        SET
            [CONSIGNEE] = @CONSIGNEE,
            [CONTACT] = @CONTACT,
            [NOMBRE] = @NOMBRE,
            [TIPO_IDENTIFICACION] = @TIPO_IDENTIFICACION,
            [IDENTIFICACION] = @IDENTIFICACION,
            [ESTADO] = @ESTADO,
            [USUARIO] = @USUARIO
        WHERE ID = @GUIAHIJA_ID;
    END
    ELSE
    BEGIN
        INSERT INTO [dbo].[GUIAHIJA]
            ([GUIAMADRE_ID], [TIPO], [CONSECUTIVO], [GUIAHIJA], [CONSIGNEE], [CONTACT], [NOMBRE],
             [TIPO_IDENTIFICACION], [IDENTIFICACION], [ESTADO], [USUARIO], [FECHA])
        VALUES
            (@GUIAMADRE_ID, @TIPO, @CONSECUTIVO, @GUIAHIJA, @CONSIGNEE, @CONTACT, @NOMBRE,
             @TIPO_IDENTIFICACION, @IDENTIFICACION, @ESTADO, @USUARIO, GETDATE());
    END
END
GO


IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_GetMasterGuide]') AND type = 'P')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_GetMasterGuide] AS BEGIN RETURN END')
END
GO

ALTER PROCEDURE [dbo].[BKO_GetMasterGuide]
    @ManifestId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        [ID] AS Id,
        [EMN_ID] AS ManifestId,
        [SHIPPER] AS Shipper,
        [AIRWAYBILL] AS AirWayBill,
        [ISSUINGCARRIERNAME] AS IssuingCarrierName,
        [ISSUINGCARRIERCITY] AS IssuingCarrierCity,
        [AIRPORTDEPARTURE] AS AirPortDeparture,
        [TO] AS Destination,
        [AIRPORTDESTINATION] AS AirPortDestination,
        [FIRSTCARRIER] AS FirstCarrier,
        [FLIGHTDATE] AS FlightDate,
        [ACCOUNTINGINFORMATION] AS AccountingInformation,
        [PLACE] AS Place,
        [SIGNATURE] AS Signature,
        [USUARIO] AS UserName,
        [FECHA] AS CreatedDate
    FROM [dbo].[GUIAMADRE]
    WHERE [EMN_ID] = @ManifestId;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_AssignManifestPackageToGuide')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_AssignManifestPackageToGuide] AS RETURN;')
END
GO

ALTER PROCEDURE [dbo].[BKO_AssignManifestPackageToGuide]
    @NUMERO AS INT,
    @ID_MANIFIESTO AS INT,
    @GUIA AS VARCHAR(20),
    @MODIFICO AS VARCHAR(50)    
AS
BEGIN
    DECLARE @TIPOMANIFIESTO INT 
    DECLARE @NUMEROPAQUETE INT
    DECLARE @CANTIDADPAQUETES INT
    DECLARE @TOTALPESO AS MONEY
    DECLARE @DESCRIPCIONES AS NVARCHAR(4000)
    DECLARE @GUIA_ACTUAL AS VARCHAR(20)

    SELECT @GUIA_ACTUAL = BOLSA FROM DEM_DETALLE_MANIFIESTO
    WHERE ENM_ID = @ID_MANIFIESTO
    AND NUMEROPAQUETE = @NUMERO

    SELECT @TIPOMANIFIESTO = TIPOMANIFIESTO FROM ENM_ENCABEZADO_MANIFIESTO 
    WHERE ID = @ID_MANIFIESTO

    UPDATE DEM_DETALLE_MANIFIESTO 
    SET BOLSA = @GUIA,
        FECHAHORA = GETDATE(),
        MODIFICO = @MODIFICO
    WHERE ENM_ID = @ID_MANIFIESTO
    AND NUMEROPAQUETE = @NUMERO

    IF @GUIA = '0' -- IF REMOVING PACKAGES FROM THE GUIDE
        SET @GUIA = @GUIA_ACTUAL

    SELECT @CANTIDADPAQUETES = SUM(CASE WHEN P.PALETS = 0 THEN 1 ELSE P.PAQUETES END), 
           @TOTALPESO = SUM(P.PESO),
           @DESCRIPCIONES = STUFF((
                SELECT DISTINCT ', ' + P.DESCRIPCION  
                FROM PAQ_PAQUETE P
                INNER JOIN DEM_DETALLE_MANIFIESTO D 
                ON P.NUMERO = D.NUMEROPAQUETE
                WHERE D.ENM_ID = @ID_MANIFIESTO AND D.BOLSA = @GUIA
                FOR XML PATH('')), 1, 1, '') 
    FROM PAQ_PAQUETE P
    INNER JOIN DEM_DETALLE_MANIFIESTO D 
    ON P.NUMERO = D.NUMEROPAQUETE
    WHERE D.ENM_ID = @ID_MANIFIESTO AND D.BOLSA = @GUIA

    UPDATE BLHIJA 
    SET TOTALPKGS = @CANTIDADPAQUETES,
        GROSSWEIGHT = @TOTALPESO,
        DESCRIPTIONPKGS = @DESCRIPCIONES
    WHERE GUIA = @GUIA
END;
GO
