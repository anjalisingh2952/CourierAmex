
-- Adding Permission for Courier

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_PACKING_COURIER', 'Package', 'Packing Courier'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_PACKING_COURIER'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_PACKING_COURIER'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

-- Adding Permission for consolidate

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_PACKING_CONSOLIDATE', 'Package', 'Packing Consolidate'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_PACKING_CONSOLIDATE'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_PACKING_CONSOLIDATE'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

-- Adding Permission for AeroPost

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_PACKING_AEROPOST', 'Package', 'Packing AeroPost'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_PACKING_AEROPOST'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_PACKING_AEROPOST'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


-- To get Manifest

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


-- To get AirGuide By Manifest

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


-- To get Manifest Package Details

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


IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'GUIAHIJA_PALET' AND COLUMN_NAME = 'MANIFESTID')
BEGIN
    ALTER TABLE GUIAHIJA_PALET ADD MANIFESTID INT;
END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_UnpackPackage')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_UnpackPackage] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_UnpackPackage]
    @NUMERO_PAQUETE AS INT --package number
AS
BEGIN
    DECLARE @EXISTE AS INT;

    UPDATE DEM_DETALLE_MANIFIESTO
    SET BOLSA = 0, EMPACADO = 0, PALET = '0'
    WHERE NUMEROPAQUETE = @NUMERO_PAQUETE;

    SET @EXISTE = (SELECT COUNT(1) FROM CONSOLIDADO_GUIA WHERE PAQUETE_LIDER = @NUMERO_PAQUETE);

    IF (@EXISTE != 0)
    BEGIN
        DELETE FROM CONSOLIDADO_GUIA WHERE PAQUETE_LIDER = @NUMERO_PAQUETE;
    END
END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_UnpackPackageConsolidated')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_UnpackPackageConsolidated] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_UnpackPackageConsolidated]
    @NUMERO_PAQUETE AS INT
AS
BEGIN
    DECLARE @GUIAHIJA AS NVARCHAR(25)
    DECLARE @GUIAHIJA_ID AS INT
    DECLARE @EXISTE AS INT

    SELECT @GUIAHIJA = BOLSA FROM DEM_DETALLE_MANIFIESTO 
    WHERE NUMEROPAQUETE = @NUMERO_PAQUETE

    SELECT @GUIAHIJA_ID = ISNULL(ID, -1) FROM GUIAHIJA WHERE GUIAHIJA = @GUIAHIJA

    DELETE FROM GUIAHIJA_PALET WHERE GUIAHIJA_ID = @GUIAHIJA_ID

    UPDATE DEM_DETALLE_MANIFIESTO 
    SET EMPACADO = 0, PALET = '0'
    WHERE NUMEROPAQUETE = @NUMERO_PAQUETE

    SET @EXISTE = (SELECT COUNT(1) FROM CONSOLIDADO_GUIA WHERE PAQUETE_LIDER = @NUMERO_PAQUETE)

    IF (@EXISTE != 0)
    BEGIN
        DELETE FROM CONSOLIDADO_GUIA WHERE PAQUETE_LIDER = @NUMERO_PAQUETE
    END
END