IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Package_GetByManifest')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Package_GetByManifest] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Package_GetByManifest]
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

	Set @inPageIndex = @inPageIndex - 1

	;WITH CTE_PackageInfo AS (
		SELECT 
			P.[Numero] as 'Number',
			P.[Cliente] AS 'CustomerCode',
			C.[NombreCompleto] AS 'CustomerName',
			P.[Descripcion] AS 'Description',
			P.[Categoria] AS 'Category',
			P.[CompanyId] AS 'CompanyId'
		FROM dbo.PAQ_PAQUETE P WITH(NOLOCK)
		INNER JOIN DEM_DETALLE_MANIFIESTO DM
		ON P.ID = DM.PAQ_ID
		INNER JOIN CLI_CLIENTE C
		ON P.CLIENTE = C.CODIGO
		WHERE (@inCompanyId = 0 OR P.[CompanyId] = @inCompanyId) AND 
		( DM.ENM_ID = @inManifestId ) AND
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



INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_CATEGORY', 'Package', 'Category'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_CATEGORY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_CATEGORY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

