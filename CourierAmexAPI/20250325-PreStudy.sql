--------------------------------------------------------------------------
-----------------------------PERMISSIONS----------------------------------
--------------------------------------------------------------------------

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_PRE_STUDY', 'Package', 'Pre Study'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_PRE_STUDY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_PRE_STUDY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

--------------------------------------------------------------------------
-----------------------------STORED PROCEDURES----------------------------
--------------------------------------------------------------------------

-----------------------------STORED PROCEDURES----------------------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageItem_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_PackageItem_GetById] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_PackageItem_GetById]    
 @Id INT    
AS    
 SET NOCOUNT ON;    
    
 SELECT      ID AS Id,     NUMERO AS Number,     ID_MARCA AS BrandId,     ID_MODELO AS ModelId,     
 SERIE AS Series,     CARACTERISTICAS AS Characteristics,     DESCRIPCION AS Description,     
 COMPOSICION AS Composition,     CANTIDAD AS Quantity,     COSTO_UNITARIO AS UnitCost,     
 PROCEDENCIA AS Origin,     ORIGEN AS Source,     ESTADO AS State,     ESTILO AS Style,     
 COLOR AS Color,     TALLA AS Size,     PARTIDA AS Batch,     FACTURA AS Invoice,     
 FEC_INCLUSION AS InclusionDate,     USER_INCLUSION AS InclusionUser,     FEC_MODIFICA AS ModificationDate,     
 USER_MODIFICA AS ModificationUser,     FECHA_FACTURA AS InvoiceDate,     COSTO AS Cost  FROM PAQ_PAQUETE_ARTICULOS  
 WHERE ID = @Id;    
     
 SET NOCOUNT OFF;     

-----------------------------STORED PROCEDURES----------------------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageItem_GetPaged')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_PackageItem_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_PackageItem_GetPaged]    
    @P_number INT,    
    @inPageSize SMALLINT,    
    @inPageIndex SMALLINT,    
    @inSortBy VARCHAR(64),    
    @inFilterBy VARCHAR(64)  
AS    
    SET NOCOUNT ON;    
    
-- Set the page bounds    
SET @inPageIndex = @inPageIndex - 1;    
DECLARE @thePageLowerBound INT = @inPageSize * @inPageIndex;    
DECLARE @thePageUpperBound INT = @thePageLowerBound + @inPageSize;    
    
;WITH CTE_PackageInfo AS (    
    SELECT     
        P.NUMERO AS 'Number',    
        P.ID_MARCA AS 'BrandId',    
        P.ID_MODELO AS 'ModelId',    
        P.SERIE AS 'Series',    
        P.DESCRIPCION AS 'Description',  
        P.COMPOSICION AS 'Composition',  
        P.CANTIDAD AS 'Quantity',    
        P.COSTO_UNITARIO AS 'UnitCost',  
        P.ORIGEN AS 'Source',    
        P.ESTADO AS 'State',    
        P.ESTILO AS 'Style',    
        P.COLOR AS 'Color',    
        P.TALLA AS 'Size',    
        P.PARTIDA AS 'Batch',    
        P.FACTURA AS 'Invoice',  
  P.ID AS 'Id'  
    FROM [dbo].[PAQ_PAQUETE_ARTICULOS] P WITH(NOLOCK)       
    WHERE (P.[NUMERO] = @P_number)     
      AND (    
            LEN(@inFilterBy) = 0     
            OR (P.[NUMERO] LIKE '%' + @inFilterBy + '%'                   
            OR P.[DESCRIPCION] LIKE '%' + @inFilterBy + '%'    
            )    
          )    
), CTE_Rank AS (    
    SELECT     
  BrandId,         ModelId,         Series,         [Description],         Composition,         Quantity,         UnitCost,         [Source],         [State],         Style,         Color,         Size,         Batch,         Invoice,  
  Number,  
  Id,  
        RowIndex = ROW_NUMBER() OVER (    
            ORDER BY     
                CASE WHEN @inSortBy = 'Number ASC' THEN P.Number END ASC,    
                CASE WHEN @inSortBy = 'Number DESC' THEN P.Number END DESC,    
                CASE WHEN @inSortBy = 'Series ASC' THEN P.Series END ASC,    
                CASE WHEN @inSortBy = 'Series DESC' THEN P.Series END DESC,    
                CASE WHEN @inSortBy = 'Composition ASC' THEN P.Composition END ASC,    
                CASE WHEN @inSortBy = 'Composition DESC' THEN P.Composition END DESC,    
                CASE WHEN @inSortBy = 'State ASC' THEN P.[State] END ASC,    
                CASE WHEN @inSortBy = 'State DESC' THEN P.[State] END DESC,    
                CASE WHEN @inSortBy = 'Color ASC' THEN P.Color END ASC,    
                CASE WHEN @inSortBy = 'Color DESC' THEN P.Color END DESC,    
                CASE WHEN @inSortBy = 'Size ASC' THEN P.Size END ASC,    
                CASE WHEN @inSortBy = 'Size DESC' THEN P.Size END DESC    
        ),     
        COUNT(1) OVER() AS TotalRows    
    FROM CTE_PackageInfo P    
)    
SELECT    
    o.BrandId,     
    o.ModelId,     
    o.Series,    
    o.[Description],     
    o.Composition, -- Include the company name in the final result    
    o.Quantity,     
    o.UnitCost,    
    o.[Source],     
    o.[State],     
    o.Style,     
    o.Color,     
    o.Size,    
    o.Batch,     
    o.Invoice,     
    o.[Id],  
 o.Number  
FROM (    
    SELECT     
         *    
    FROM CTE_Rank cter    
    WHERE RowIndex > @thePageLowerBound AND RowIndex <= @thePageUpperBound    
) AS o    
    
SET NOCOUNT OFF; 

-----------------------------STORED PROCEDURES----------------------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageItem_CreateOrUpdate')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_PackageItem_CreateOrUpdate] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_PackageItem_CreateOrUpdate]    
@Id AS INT,  
@Number AS INT,    
@BrandId AS NVARCHAR(500),  
@ModelId AS NVARCHAR(500),  
@Series AS NVARCHAR(500),  
@Description AS NVARCHAR(500),  
@Composition AS NVARCHAR(500),  
@Quantity AS INT,  
@UnitCost AS DECIMAL(18,2),  
@Source AS NVARCHAR(500),  
@State AS NVARCHAR(500),  
@Style AS NVARCHAR(500),  
@Color AS NVARCHAR(500),  
@Size AS NVARCHAR(500),  
@Batch AS VARCHAR(50),  
@Invoice AS VARCHAR(50),  
@Characteristics AS NVARCHAR(500),  
@Origin AS NVARCHAR(500)   
AS  
BEGIN  
SET NOCOUNT ON;    
  
 IF (ISNULL(@Id, 0) = 0)   
  BEGIN  
   INSERT INTO [dbo].[PAQ_PAQUETE_ARTICULOS] ([ID_MARCA],  
   [ID_MODELO],[SERIE],[DESCRIPCION],[COMPOSICION],[CANTIDAD],[COSTO_UNITARIO],[ORIGEN],[ESTADO],[ESTILO],[COLOR],[TALLA],[PARTIDA],[FACTURA],[NUMERO],[CARACTERISTICAS],[PROCEDENCIA],[FEC_INCLUSION],[USER_INCLUSION],[USER_MODIFICA],[FEC_MODIFICA])  
   VALUES (@BrandId,  
   @ModelId,@Series,@Description,@Composition,@Quantity,@UnitCost,@Source,@State,@Style,@Color,@Size,@Batch,@Invoice,@Number,@Characteristics,@Origin,getdate(),0,0,getdate());   
     
   SET @Id = SCOPE_IDENTITY();    
  END  
 ELSE  
  BEGIN  
   UPDATE PAQ_PAQUETE_ARTICULOS  
   SET   
    NUMERO = @Number,    
    ID_MARCA = @BrandId,    
    ID_MODELO = @ModelId,    
    SERIE = @Series,    
    DESCRIPCION = @Description,    
    COMPOSICION = @Composition,    
    CANTIDAD = @Quantity,    
    COSTO_UNITARIO = @UnitCost,    
    ORIGEN = @Source,    
    ESTADO = @State,    
    ESTILO = @Style,    
    COLOR = @Color,    
    TALLA = @Size,    
    PARTIDA = @Batch,    
    FACTURA = @Invoice    
   WHERE ID = @Id;  
  END  
  
SELECT @Id;  
END

-----------------------------STORED PROCEDURES----------------------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetPackageItems_PreStudy')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetPackageItems_PreStudy] AS RETURN')
END
GO          
          
ALTER PROCEDURE [dbo].[BKO_GetPackageItems_PreStudy]      
@MANIFESTNUMBER varchar(50),          
@PACKAGENUMBERS AS NVARCHAR(2000),        
@COMPANYID AS INT,        
@PAGENUMBER AS INT,        
@PAGESIZE AS INT        
AS          
BEGIN          
          
 IF (@PACKAGENUMBERS = '')          
 BEGIN          
  SELECT         
   A.ID,        
   CASE C.FACTURAR_COMPANNIA        
    WHEN 0 THEN C.NOMBRECOMPLETO        
    WHEN 1 THEN C.COMPANNIA        
    ELSE C.NOMBRECOMPLETO        
    END AS FullName,         
        
  D.NUMEROPAQUETE AS PACKAGENUMBER,     D.BOLSA AS BAG,     P.DESCRIPCION AS PACKAGEDESCRIPTION,     A.ID_MARCA AS BRAND,     A.ID_MODELO AS MODEL,        
  A.SERIE AS SERIALNUMBER,     A.DESCRIPCION AS [DESCRIPTION],         
  A.COMPOSICION AS COMPOSITION,     A.CANTIDAD AS QUANTITY,     A.COSTO_UNITARIO AS UNITCOST,     A.ORIGEN AS ORIGIN,         
  A.ESTADO AS STATUS,     A.ESTILO AS STYLE,     A.COLOR AS COLOR,     A.TALLA AS SIZE,     A.PARTIDA AS ITEMNUMBER,         
  A.FACTURA AS INVOICE,     P.PROCEDENCIA AS SOURCE,     ISNULL(A.CANTIDAD, 0) * ISNULL(A.COSTO_UNITARIO, 0) AS TOTALPRICE,         
  P.PRECIO AS PACKAGEPRICE,     A.CARACTERISTICAS AS    
 CHARACTERISTICS,     A.FECHA_FACTURA AS INVOICEDATE       
  FROM ENM_ENCABEZADO_MANIFIESTO M          
  INNER JOIN DEM_DETALLE_MANIFIESTO D          
  ON M.ID=D.ENM_ID          
  INNER JOIN PAQ_PAQUETE P          
  ON P.NUMERO=D.NUMEROPAQUETE          
  INNER JOIN PAQ_PAQUETE_ARTICULOS A          
  ON D.NUMEROPAQUETE= A.NUMERO          
  INNER JOIN CLI_CLIENTE C          
  ON P.CLIENTE = C.CODIGO          
  WHERE M.NUMERO = @MANIFESTNUMBER        
  and P.CompanyId = @COMPANYID  
  ORDER BY D.NUMEROPAQUETE          
 END           
 ELSE          
 BEGIN          
          
  SELECT         
   A.ID,        
   CASE C.FACTURAR_COMPANNIA        
    WHEN 0 THEN C.NOMBRECOMPLETO        
    WHEN 1 THEN C.COMPANNIA        
    ELSE C.NOMBRECOMPLETO        
    END AS FullName,         
        
  D.NUMEROPAQUETE AS PACKAGENUMBER,     D.BOLSA AS BAG,     P.DESCRIPCION AS PACKAGEDESCRIPTION,     A.ID_MARCA AS BRAND,         
  A.ID_MODELO AS MODEL,     A.SERIE AS SERIALNUMBER,     A.DESCRIPCION AS [DESCRIPTION],         
  A.COMPOSICION AS COMPOSITION,     A.CANTIDAD AS QUANTITY,     A.COSTO_UNITARIO AS UNITCOST,     A.ORIGEN AS ORIGIN,     A.ESTADO AS STATUS,         
  A.ESTILO AS STYLE,     A.COLOR AS COLOR,     A.TALLA AS SIZE,     A.PARTIDA AS ITEMNUMBER,     A.FACTURA AS INVOICE,         
  P.PROCEDENCIA AS SOURCE,     ISNULL(A.CANTIDAD, 0) * ISNULL(A.COSTO_UNITARIO, 0) AS TOTALPRICE,     P.PRECIO AS PACKAGEPRICE,         
  A.CARACTERISTICAS AS    
 CHARACTERISTICS,     A.FECHA_FACTURA AS INVOICEDATE       
  FROM ENM_ENCABEZADO_MANIFIESTO M          
  INNER JOIN DEM_DETALLE_MANIFIESTO D          
  ON M.ID=D.ENM_ID          
  INNER JOIN PAQ_PAQUETE P          
  ON P.NUMERO=D.NUMEROPAQUETE          
  INNER JOIN PAQ_PAQUETE_ARTICULOS A          
  ON D.NUMEROPAQUETE= A.NUMERO          
  INNER JOIN CLI_CLIENTE C          
  ON P.CLIENTE = C.CODIGO          
  WHERE M.NUMERO = @MANIFESTNUMBER        
  AND @PACKAGENUMBERS LIKE '%' + Convert(varchar, P.NUMERO) + '%'      
  and P.CompanyId = @COMPANYID        
  ORDER BY D.NUMEROPAQUETE       
          
          
 END          
          
END 

-----------------------------STORED PROCEDURES----------------------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_UpdatePackageItemBillingDetails')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_UpdatePackageItemBillingDetails] AS RETURN')
END
GO  

ALTER PROCEDURE [dbo].[BKO_UpdatePackageItemBillingDetails]      
 @ID AS INT,      
 @Price AS MONEY,        
 @Quantity AS INT,    
 @Description AS VARCHAR(200),  
 @Characteristics AS VARCHAR(200)  
AS      
BEGIN      
      
 -- Update package Item price and billing details       
 UPDATE PAQ_PAQUETE_ARTICULOS         
 SET COSTO_UNITARIO = @Price,             
 [DESCRIPCION] = @Description,             
 CANTIDAD = @Quantity,  
 CARACTERISTICAS = @Characteristics  
 WHERE ID = @ID;              
   
END 

---------------------------BKO_UpdatePackagePrice----------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_UpdatePackagePrice')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_UpdatePackagePrice] AS RETURN')
END
GO 

ALTER PROCEDURE [dbo].[BKO_UpdatePackagePrice]      
 @Number AS INT,      
 @Price AS MONEY,      
 @Description AS VARCHAR(50),    
 @IsPermission AS BIT,    
 @IsDocument AS BIT    
AS      
BEGIN      
      
 -- Update package price and modification details       
 UPDATE PAQ_PAQUETE         
 SET PRECIO = @Price,             
 [DESCRIPCION] = @Description,             
 ACTUALIZOPRECIO = 1         
 WHERE NUMERO = @Number;              
   
 -- Update Previo and TraeFactura based on IsPermission or IsDocument       
 UPDATE PAQ_PAQUETE       
 SET Previo = CASE WHEN @IsPermission = 1 OR @IsDocument = 1 THEN 1 ELSE 0 END,           
 TraeFactura = CASE WHEN @IsPermission = 1 OR @IsDocument = 1 THEN 1 ELSE 0 END       
 WHERE NUMERO = @Number;    
   
END 

---------------------------BKO_Package_GetByPackageNumber----------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Package_GetByPackageNumber')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Package_GetByPackageNumber] AS RETURN')
END
GO 

ALTER PROCEDURE [dbo].[BKO_Package_GetByPackageNumber]    
 @companyId INT,  
 @packageNumber INT  
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
 --WHERE P.[Id] = @inId;    
 WHERE P.[NUMERO] = @packageNumber and P.[CompanyId] = @companyId;    
     
 SET NOCOUNT OFF;     

 ---------------------------BKO_PackagePrice_GetByManifest----------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackagePrice_GetByManifest')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_PackagePrice_GetByManifest] AS RETURN')
END
GO 

ALTER PROCEDURE [dbo].[BKO_PackagePrice_GetByManifest]      
    @inCompanyId INT,      
    @inManifestId INT,      
    @inPageSize SMALLINT,      
    @inPageIndex SMALLINT,      
    @inSortBy VARCHAR(64),      
    @inFilterBy VARCHAR(64)      
AS      
 SET NOCOUNT ON;      
      
 Set @inPageIndex = @inPageIndex - 1      
      
 -- Set the page bounds      
 DECLARE @thePageLowerBound int= @inPageSize * @inPageIndex;      
 DECLARE @thePageUpperBound int= @thePageLowerBound + @inPageSize;      
      
      
 ;WITH CTE_PackageInfo AS (      
  SELECT       
   P.[Numero] as 'Number',      
   P.[Cliente] AS 'CustomerCode',      
   C.[NombreCompleto] AS 'CustomerName',      
   P.[Descripcion] AS 'Description',      
   P.[Categoria] AS 'Category',      
   P.[CompanyId] AS 'CompanyId',    
   P.[Precio] AS 'Price',    
   P.[Procedencia] AS 'Origin',    
   P.[Peso] AS 'Weight',    
   P.[PesoVolumetrico] AS 'VolumetricWeight',    
   P.[Courier] AS 'TrackingNumber'    
  FROM dbo.PAQ_PAQUETE P WITH(NOLOCK)      
  INNER JOIN DEM_DETALLE_MANIFIESTO DM      
  ON P.ID = DM.PAQ_ID      
  INNER JOIN CLI_CLIENTE C      
  ON P.CLIENTE = C.CODIGO      
  WHERE (@inCompanyId = 0 OR P.[CompanyId] = @inCompanyId) AND       
  ( DM.ENM_ID = @inManifestId ) AND (P.[Precio] is NULL OR P.[Precio] <= 0.00) AND  
  (LEN(@inFilterBy) = 0 OR ( p.[NUMERO] LIKE @inFilterBy+'%'))      
 ),CTE_Rank AS      
 (      
  SELECT       
     [Number]      
    ,[CustomerCode]      
    ,[CustomerName]      
    ,[Description]      
    ,[Category]      
    ,[CompanyId]    
 ,[Price]    
 ,[Origin]    
 ,[Weight]    
 ,[VolumetricWeight]    
 ,[TrackingNumber]    
    ,RowIndex = ROW_NUMBER() OVER (      
  ORDER BY       
   CASE WHEN @inSortBy = 'Number ASC'  THEN [Number] END ASC,      
   CASE WHEN @inSortBy = 'Number DESC'  THEN [Number] END DESC,      
   CASE WHEN @inSortBy = 'Client ASC'  THEN [CustomerCode] END ASC,      
   CASE WHEN @inSortBy = 'Client DESC'  THEN [CustomerCode] END DESC      
  ),       
  COUNT(1) OVER() AS TotalRows      
  FROM CTE_PackageInfo      
 )      
      
 SELECT      
     o.[Number]      
    ,o.[CustomerCode]      
    ,o.[CustomerName]      
    ,o.[Description]      
    ,o.[Category]      
    ,o.[CompanyId]      
 ,o.[Price]    
 ,o.[Origin]    
 ,o.[Weight]    
 ,o.[VolumetricWeight]    
 ,o.[TrackingNumber]    
    ,o.TotalRows      
    ,E.[EMPRESA] 'CompanyName'      
 FROM (      
  SELECT       
    *      
  FROM CTE_Rank cter      
  WHERE RowIndex > @thePageLowerBound AND RowIndex <= @thePageUpperBound      
 ) as o      
 INNER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK)       
 ON (o.[CompanyId] = E.[ID]);      
       
 SET NOCOUNT OFF; 

 
 ---------------------------BKO_GetManifestPreAlert----------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetManifestPreAlert')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetManifestPreAlert] AS RETURN')
END
GO 

ALTER PROCEDURE [dbo].[BKO_GetManifestPreAlert]  
@MANIFESTNUMBER varchar(50),  
@COMPANYID INT  
AS    
    
SET NOCOUNT ON;    
    
SELECT 'SJO' AS GATEWAY,'454741' AS Account,    
d.bolsa as asAIPE,d.numeropaquete as CRTRACK,'9' as CourierCode,    
p.descripcion as [Description],'WALKING' as Shipper,    
C.NOMBRECOMPLETO as Consignee,c.compannia as Company,c.numerodocumento as Identification,t.nombre as TypeId,    
p.precio as [Value],p.peso as [Weight], '0' AS Invoice,'0' as XTN, '0' as Address, '0' as City,'0' as  Country,'0' as     Telephone,'0'      as Exonerate    
FROM DEM_DETALLE_MANIFIESTO d     
inner join enm_encabezado_manifiesto e    
on d.enm_id=e.id    
inner join paq_paquete p    
on d.NUMEROPAQUETE=p.NUMERO    
INNER JOIN CLI_CLIENTE C    
ON P.CLIENTE=C.CODIGO    
inner join tipodocumento t    
on t.tipodocumento_id=c.tipodocumento    
WHERE e.NUMERO=@MANIFESTNUMBER    
AND e.CompanyId=@COMPANYID  
order by d.bolsa   

 ---------------------------BKO_GetManifestPreAlert----------------

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetManifestPreAlert')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetManifestPreAlert] AS RETURN')
END
GO 