IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetManifests')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetManifests] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GetManifests]  
 @COMPANYID AS VARCHAR(10),  
 @STATE AS INT,  
 @MANIFESTTYPE AS INT,  
 @TYPE AS NVARCHAR(20)  
AS 
BEGIN  
    -- Declare variables for dynamic filtering
    DECLARE @IncludeClosed BIT = CASE WHEN @STATE != -1 THEN 1 ELSE 0 END;

    SELECT 
        E.ID, 
        E.NUMERO AS ManifestNumber, 
        E.PAIS AS CountryCode, 
        E.FECHA AS ManifestDate,
        CASE 
            WHEN @TYPE = 'Consolidado' THEN E.CERRADO
            ELSE NULL
        END AS Closed
    FROM 
        ENM_ENCABEZADO_MANIFIESTO E
    WHERE 
        -- Filter by Manifest Type
        TIPOMANIFIESTO = @MANIFESTTYPE
        -- Filter by State if applicable
        AND (@IncludeClosed = 0 OR E.CERRADO = @STATE)
        -- Filter by Type
        AND (
            @TYPE = '' -- No type specified
            OR (@TYPE = 'Courier' AND E.TIPO = 'Courier' AND E.CompanyId = @COMPANYID)
            OR (@TYPE = 'Consolidado' AND E.TIPO IN ('General', 'Permiso') AND E.CompanyId = @COMPANYID)
        )
    ORDER BY 
        E.FECHA DESC;
END;

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_AirGuide_GetByManifest')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_AirGuide_GetByManifest] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_AirGuide_GetByManifest]
	@inMasterGuideID AS INT
AS
BEGIN

	SELECT 
		ID,
		GUIAMADRE_ID AS 'MasterGuideId',
		TIPO AS 'Type',
		CONSECUTIVO AS 'Consecutive',
		GUIAHIJA AS 'Guide',
		GUIAHIJA + '-' + NOMBRE AS GuideName

	FROM GUIAHIJA 
	WHERE GUIAMADRE_ID = @inMasterGuideID

END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetManifestPackageDetails')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetManifestPackageDetails] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GetManifestPackageDetails]
    @ManifestID INT -- Taking @ManifestID as a parameter
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        E.NUMERO AS Number,
        E.TIPOMANIFIESTO AS ManifestType,
        E.TIPO AS PackageType,
        CONVERT(VARCHAR(10), E.FECHA, 120) AS Date,
        COUNT(DISTINCT P.NUMERO) AS TotalPackage,
        (SELECT COUNT(DISTINCT P.NUMERO)
         FROM DEM_DETALLE_MANIFIESTO D
         INNER JOIN PAQ_PAQUETE P ON D.NUMEROPAQUETE = P.NUMERO
         WHERE D.ENM_ID = @ManifestID AND D.SORTEADO = 1) AS SortedPackage,
        (SELECT COUNT(*)
         FROM (
             SELECT D.BOLSA
             FROM DEM_DETALLE_MANIFIESTO D
             WHERE D.ENM_ID = @ManifestID AND D.BOLSA != '0'
             GROUP BY D.BOLSA
         ) AS GroupedData) AS Bags
    FROM 
        ENM_ENCABEZADO_MANIFIESTO E
        INNER JOIN DEM_DETALLE_MANIFIESTO D ON E.ID = D.ENM_ID
        INNER JOIN PAQ_PAQUETE P ON D.NUMEROPAQUETE = P.NUMERO
    WHERE 
        E.ID = @ManifestID
    GROUP BY 
        E.NUMERO, E.TIPOMANIFIESTO, E.TIPO, CONVERT(VARCHAR(10), E.FECHA, 120);
END;
