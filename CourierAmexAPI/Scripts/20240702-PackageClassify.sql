IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Package_GetByState')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Package_GetByState] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Package_GetByState]
    @inCompanyId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64),
    @inStateId INT = 0
AS
	SET NOCOUNT ON;

	-- Set the page bounds
	SET @inPageIndex = @inPageIndex - 1;
	DECLARE @thePageLowerBound int= @inPageSize * @inPageIndex;
	DECLARE @thePageUpperBound int= @thePageLowerBound + @inPageSize;

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
		WHERE (@inCompanyId = 0 OR P.[CompanyId] = @inCompanyId) AND 
			  (@inStateId = 0 OR P.[EST_ID] = @inStateId) AND
			(
				LEN(@inFilterBy) = 0 OR ( 
					P.[NUMERO] LIKE '%' + @inFilterBy + '%'
					OR P.[CLIENTE] LIKE '%' + @inFilterBy + '%'
					OR C.[NombreCompleto] LIKE '%' + @inFilterBy + '%'
					OR C.[IDENTIFICACION] LIKE '%' + @inFilterBy + '%'
					OR P.[COURIER] LIKE '%' + @inFilterBy + '%'
					OR P.[NOMBRECOURIER] LIKE '%' + @inFilterBy + '%'
					OR P.[DESCRIPCION] LIKE '%' + @inFilterBy + '%'
				)
			)
	),CTE_Rank AS
	(
		SELECT 
			P.[Number], 
			P.[CustomerCode], 
            P.[CustomerName],
            P.[CustomerDNI], 
			P.[TrackingNumber], 
			P.[CourierName],
            P.[Origin], 
			P.[PackageStateId], 
            P.[Code], 
			P.[TotalWeight], 
			P.[Type],
            P.[ComodityId], 
            P.[CubicFeet], 
			P.[Id], 
			P.[Status],
			P.[Weight],
			P.[VolumetricWeight],
			P.[Dimension],
			P.[CreatedAt],
			RowIndex = ROW_NUMBER() OVER (
		ORDER BY 
			CASE WHEN @inSortBy = 'Number ASC' THEN P.[Number] END ASC,
            CASE WHEN @inSortBy = 'Number DESC' THEN P.[Number] END DESC,
            CASE WHEN @inSortBy = 'CustomerCode ASC' THEN P.[CustomerCode] END ASC,
            CASE WHEN @inSortBy = 'CustomerCode DESC' THEN P.[CustomerCode] END DESC,
            CASE WHEN @inSortBy = 'CustomerName ASC' THEN P.[CustomerName] END ASC,
            CASE WHEN @inSortBy = 'CustomerName DESC' THEN P.[CustomerName] END DESC,
            CASE WHEN @inSortBy = 'CustomerDNI ASC' THEN P.[CustomerDNI] END ASC,
            CASE WHEN @inSortBy = 'CustomerDNI DESC' THEN P.[CustomerDNI] END DESC,
            CASE WHEN @inSortBy = 'TrackingNumber ASC' THEN P.[TrackingNumber] END ASC,
            CASE WHEN @inSortBy = 'TrackingNumber DESC' THEN P.[TrackingNumber] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN P.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN P.[Status] END DESC
		), 
		COUNT(1) OVER() AS TotalRows
		FROM CTE_PackageInfo p
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
		o.[TotalRows],
		E.[NOMBRE] 'PackageStateName',  
		C.[CODE] 'ComodityCode', 
		C.[DESCRIPTION] 'ComodityName'
	FROM (
		SELECT 
			 *
		FROM CTE_Rank cter
		WHERE RowIndex > @thePageLowerBound AND RowIndex <= @thePageUpperBound
	) as o
	INNER JOIN [dbo].[EST_ESTADO] E WITH(NOLOCK)
	ON (E.ID = o.PackageStateId)
	LEFT JOIN [dbo].[FC_COMODITYS] C WITH(NOLOCK)
	ON (C.ID = o.ComodityId);
	
	SET NOCOUNT OFF; 
GO


-- Procedimiento almacenado para clasificar un paquete
IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageClassify')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_PackageClassify] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_PackageClassify]
	@inManifestId AS INT,
	@inNumber AS INT,
	@inShipType INT,
	@inIssueTypeId INT,
	@inUserId AS UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

--	0: Manifested succesfull
--	1: The package is already manifested
--	2: The package shiping type does not match manifest shiping type
--	3: Company customer and Company manifest does not match
--	4. Country manifest not allowed for the user


	DECLARE @CANTIDAD AS INT
	DECLARE @PAQUETE_ID AS INT
	DECLARE @CODIGO_CLIENTE AS VARCHAR(200)
	DECLARE @PAIS_CLIENTE AS VARCHAR (5)
	DECLARE @PAIS_MANIFIESTO AS VARCHAR(5)
	DECLARE	@NUMERO_MANIFIESTO AS VARCHAR(50)
	
	
	DECLARE @COMPANYID_MANIFEST AS INT
	DECLARE @COMPANYID_CUSTOMER AS INT
	DECLARE @TIPOIMPUESTO AS INT
	DECLARE @TIPOCOURIER AS INT
	DECLARE @ESTADOID_MANIFESTADO AS INT

	DECLARE @USERNAME AS NVARCHAR(50)
	DECLARE @PACKAGESHIPTYPE AS INT

	SET @TIPOIMPUESTO = 1
	SET @TIPOCOURIER = 1

	SELECT @PAQUETE_ID = ID, @CODIGO_CLIENTE = CLIENTE, @PACKAGESHIPTYPE = TIPOPAQUETE
	FROM PAQ_PAQUETE WHERE NUMERO = @inNumber	
	
	SELECT @CANTIDAD = COUNT (1) FROM DEM_DETALLE_MANIFIESTO WHERE PAQ_ID = @PAQUETE_ID 
	
	-- VALIDA SI EL PAQUETE YA ESTA MANIFESTADO.
	IF @CANTIDAD > 0 
	BEGIN	
		SELECT 1 AS Result	
		RETURN
	END

	-- VALIDA EL TIPO DE ENVIO DEL PAQUETE Y DEL MANIFIESTO
	IF (@inShipType != @PACKAGESHIPTYPE)
	BEGIN
		SELECT 2 AS Result	
		RETURN	
	END

	-- Valida si la compañia del cliente es igual a la compañia del manifiesto
	SELECT @COMPANYID_CUSTOMER = COMPANYID FROM CLI_CLIENTE WHERE CODIGO = @CODIGO_CLIENTE
	SELECT @COMPANYID_MANIFEST = COMPANYID FROM ENM_ENCABEZADO_MANIFIESTO WHERE ID = @inManifestId

	IF @COMPANYID_CUSTOMER != @COMPANYID_MANIFEST
	BEGIN
		SELECT 3 AS RESULTADO
		RETURN
	END	

	SELECT @ESTADOID_MANIFESTADO = EST_MANIFESTADO FROM PAR_PARAMETRO
	SELECT @USERNAME = [USERNAME] FROM BKO_USER WHERE ID = @inUserId

	UPDATE PAQ_PAQUETE SET EST_ID = @ESTADOID_MANIFESTADO, TIPOPAQUETE = @inShipType
	WHERE ID  = @PAQUETE_ID

	INSERT INTO [DEM_DETALLE_MANIFIESTO]
		   ([ENM_ID],[PAQ_ID], [NUMERO], [CREO], [DIRECCION], [NUMEROPAQUETE], [MODIFICO], [SUBTIPOPAQUETE], [TIPOCOURIER], [TIPOIMPUESTO])
	VALUES (@inManifestId, @PAQUETE_ID, '', @USERNAME, '', @inNumber, @USERNAME, @inIssueTypeId, @TIPOCOURIER, @TIPOIMPUESTO)

	SELECT 0 AS RESULTADO -- MANIFESTADO DE FORMA CORRECTA.

	IF (@TIPOIMPUESTO = 1 OR @TIPOIMPUESTO = 2)
	BEGIN
		IF NOT EXISTS (SELECT 1 FROM PAQ_PAQUETE_CLASIFICACION WHERE NUMERO = @inNumber)
		BEGIN
			EXECUTE [usp_InsertPaqueteClasificacion] @inNumber, @TIPOIMPUESTO
		END
	END


    SET NOCOUNT OFF;
END
GO


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_CLASSIFY', 'Package', 'Classify'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_CLASSIFY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_CLASSIFY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

 --EXEC [dbo].[BKO_Package_GetByState]
 --   @inCompanyId=2,
 --   @inPageSize=1000,
 --   @inPageIndex=1,
 --   @inSortBy='Weight ASC',
 --   @inFilterBy='CR62735',
 --   @inStateId=10