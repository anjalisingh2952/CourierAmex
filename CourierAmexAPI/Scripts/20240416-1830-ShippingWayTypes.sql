IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.TIPO_CLASIFICACION'))
BEGIN
	ALTER TABLE [TIPO_CLASIFICACION] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.TIPO_CLASIFICACION'))
BEGIN
	ALTER TABLE [TIPO_CLASIFICACION] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.TIPO_CLASIFICACION'))
BEGIN
	ALTER TABLE [TIPO_CLASIFICACION] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.TIPO_CLASIFICACION'))
BEGIN
	ALTER TABLE [TIPO_CLASIFICACION] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE()
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.TIPO_CLASIFICACION'))
BEGIN
	ALTER TABLE [TIPO_CLASIFICACION] ADD [ModifiedBy] [uniqueidentifier] NULL
END
GO

UPDATE [dbo].[TIPO_CLASIFICACION]
SET [Status] = 2
WHERE [Status] != 2;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ShippingWayType_GetByShipType')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_ShippingWayType_GetByShipType] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_ShippingWayType_GetByShipType]
    @inShipType INT
AS
	SET NOCOUNT ON;

	SELECT [TIPOENVIO] 'ShipType', [DESCRIPCION] 'Name', *
	FROM [dbo].[TIPO_CLASIFICACION] WITH(NOLOCK)
	WHERE [Status] = 2
      AND [TIPOENVIO] = @inShipType;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ShippingWayType_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_ShippingWayType_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_ShippingWayType_GetPaged]
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'Name ASC' THEN T.[DESCRIPCION] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN T.[DESCRIPCION] END DESC,
            CASE WHEN @inSortBy = 'ShipType ASC' THEN T.[TIPOENVIO] END ASC,
            CASE WHEN @inSortBy = 'ShipType DESC' THEN T.[TIPOENVIO] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN T.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN T.[Status] END DESC
          ) AS [RowNum], T.[DESCRIPCION] 'Name', T.[TIPOENVIO] 'ShipType', T.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[TIPO_CLASIFICACION] T WITH(NOLOCK)
        WHERE (T.[DESCRIPCION] LIKE '%' + @inFilterBy + '%')
          AND T.[Status] != 4 -- DON'T RETURN DELETED
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
      CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
      CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
      CASE WHEN @inSortBy = 'ShipType ASC' THEN [ShipType] END ASC,
      CASE WHEN @inSortBy = 'ShipType DESC' THEN [ShipType] END DESC,
      CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
      CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ShippingWayType_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_ShippingWayType_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_ShippingWayType_GetById]
    @inId INT
AS
	SET NOCOUNT ON;

	SELECT [DESCRIPCION] 'Name', [TIPOENVIO] 'ShipType', *
	FROM [dbo].[TIPO_CLASIFICACION]
	WHERE [ID] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_ShippingWayType_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_ShippingWayType_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_ShippingWayType_CreateOrUpdate]
  @inId INT,
  @inShipType INT,
  @inName NVARCHAR(20),
  @inStatus TINYINT,
  @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
	  BEGIN
      INSERT INTO [dbo].[TIPO_CLASIFICACION]([TIPOENVIO], [DESCRIPCION], [Status], [CreatedBy], [ModifiedBy])
      VALUES(@inShipType, @inName, @inStatus, @inUserId, @inUserId);

      SET @inId = SCOPE_IDENTITY();
    END
	ELSE
	  BEGIN
        UPDATE [dbo].[TIPO_CLASIFICACION]
        SET [TIPOENVIO] = @inShipType,
            [DESCRIPCION] = @inName,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [ID] = @inId;
      END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'GEN_SHIPPINGWAY', 'General', 'Shipping Way Types'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_SHIPPINGWAY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM(
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'GEN_SHIPPINGWAY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO
