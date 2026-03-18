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
GO

IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'utt_UpdatePaquetePrecio')
BEGIN
    -- Create the User-Defined Table Type (UDT) if it doesn't exist
    CREATE TYPE [dbo].[utt_UpdatePaquetePrecio] AS TABLE(
	[PackageNumber] [nvarchar](max) NULL,
	[Price] [decimal](18, 2) NULL,
	[Description] [nvarchar](max) NULL,
	[IsPermission] BIT,
	[IsDocument] BIT
    );
END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'usp_UpdatePaquetePrecio_Bulk')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[usp_UpdatePaquetePrecio_Bulk] AS RETURN')
END
GO
ALTER PROCEDURE usp_UpdatePaquetePrecio_Bulk  
(  
   @pricedata [dbo].utt_UpdatePaquetePrecio Readonly  
)  
AS  
 SET NOCOUNT ON;    
  
    MERGE dbo.PAQ_PAQUETE  AS P  
    USING @pricedata AS T  
    ON (P.[NUMERO] = T.[PackageNumber])  
  
    WHEN  MATCHED THEN  
        UPDATE SET  P.PRECIO = T.[Price],  
                    P.[Descripcion] = T.[Description];  
SET NOCOUNT OFF;
GO

