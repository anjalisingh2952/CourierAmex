IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetPackageEvents')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetPackageEvents] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_GetPackageEvents]
    @inCompanyId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;

	-- Set the page bounds
	DECLARE @thePageLowerBound int= @inPageSize * @inPageIndex;
	DECLARE @thePageUpperBound int= @thePageLowerBound + @inPageSize;

	;WITH CTE_PackageEventInfo AS (
		SELECT 
			o.[NUMERO] AS 'Number', 
			o.[FECHA] AS 'CreatedAt', 
			o.[USUARIO] AS 'User', 
			o.[PANTALLA] AS 'Section', 
			o.[DESCRIPCION] 'Description',
			p.CompanyId
		FROM dbo.[BITACORA_PAQUETES_EVENTOS] o WITH(NOLOCK) 
		INNER JOIN dbo.PAQ_PAQUETE p WITH(NOLOCK)
		ON (o.[NUMERO] = p.[NUMERO])
		WHERE (@inCompanyId = 0 OR [CompanyId] = @inCompanyId) AND
		(LEN(@inFilterBy) = 0 OR ( o.[NUMERO] LIKE @inFilterBy+'%'))
	),CTE_Rank AS
	(
		SELECT 
		   [Number]
		  ,[CreatedAt]
		  ,[User]
		  ,[Section]
		  ,[Description]
		  ,[CompanyId]
		  ,RowIndex = ROW_NUMBER() OVER (
		ORDER BY 
			CASE WHEN @inSortBy = 'CreatedAt ASC'  THEN [CreatedAt] END ASC,
			CASE WHEN @inSortBy = 'CreatedAt DESC'  THEN [CreatedAt] END DESC,
			CASE WHEN @inSortBy = 'Number ASC'  THEN [Number] END ASC,
			CASE WHEN @inSortBy = 'Number DESC'  THEN [Number] END DESC,
			CASE WHEN @inSortBy = 'User ASC'  THEN [User] END ASC,
			CASE WHEN @inSortBy = 'User DESC'  THEN [User] END DESC,
			CASE WHEN @inSortBy = 'Section ASC'  THEN [Section] END ASC,
			CASE WHEN @inSortBy = 'Section DESC'  THEN [Section] END DESC
		), 
		COUNT(1) OVER() AS TotalRows
		FROM CTE_PackageEventInfo
	)
	SELECT
  		   o.[Number]
		  ,o.[CreatedAt]
		  ,o.[User]
		  ,o.[Section]
		  ,o.[Description]
		  ,o.TotalRows
		  ,E.[EMPRESA] 'CompanyName'
		  --,o.CompanyId
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
SELECT 'PKG_EVENTS', 'Package', 'Events'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_EVENTS'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_EVENTS'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO
