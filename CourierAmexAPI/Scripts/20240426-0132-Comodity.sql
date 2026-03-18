IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CompanyId' AND Object_ID = Object_ID(N'dbo.FC_COMODITYS'))
BEGIN
	ALTER TABLE [FC_COMODITYS] ADD [CompanyId] [int] NULL;
END
GO
ALTER TABLE [FC_COMODITYS] ADD CONSTRAINT [FK_FC_COMODITYS_EMP_EMPRESA] FOREIGN KEY ([CompanyId]) REFERENCES [dbo].[EMP_EMPRESA]([ID]);
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.FC_COMODITYS'))
BEGIN
	ALTER TABLE [FC_COMODITYS] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.FC_COMODITYS'))
BEGIN
	ALTER TABLE [FC_COMODITYS] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.FC_COMODITYS'))
BEGIN
	ALTER TABLE [FC_COMODITYS] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.FC_COMODITYS'))
BEGIN
	ALTER TABLE [FC_COMODITYS] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.FC_COMODITYS'))
BEGIN
	ALTER TABLE [FC_COMODITYS] ADD [ModifiedBy] [uniqueidentifier] NULL;
END;
GO

UPDATE [dbo].[FC_COMODITYS]
SET [Status] = 2
WHERE [Status] != 2;
GO

-- UPDATE COMMODITY TO JAMAICA
UPDATE [dbo].[FC_COMODITYS]
SET [CompanyId] = 29;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Commodity_GetAll')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Commodity_GetAll] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Commodity_GetAll]
    @inCompanyId INT
AS
	SET NOCOUNT ON;

    SELECT C.[CODE] 'Code', C.[DESCRIPTION], C.[CUSTOMS_DUTY] 'CustomsDuty',
        C.[CUSTOMS_GCT] 'CustomsGct', C.[CUSTOMS_FEE] 'CustomsFee', C.*
    FROM [dbo].[FC_COMODITYS] C WITH(NOLOCK)
    WHERE [Status] = 2 AND [CompanyId] = @inCompanyId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Commodity_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Commodity_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Commodity_GetById]
	@inId INT
AS
	SET NOCOUNT ON;

	SELECT C.[CODE] 'Code', C.[DESCRIPTION], C.[CUSTOMS_DUTY] 'CustomsDuty', 
        C.[CUSTOMS_GCT] 'CustomsGct', C.[CUSTOMS_FEE] 'CustomsFee', C.*
	FROM [dbo].[FC_COMODITYS] C WITH(NOLOCK)
	WHERE C.[Id] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Commodity_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Commodity_GetPaged] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Commodity_GetPaged]
    @inCompanyId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
                CASE WHEN @inSortBy = 'Code ASC' THEN C.[CODE] END ASC,
                CASE WHEN @inSortBy = 'Code DESC' THEN C.[CODE] END DESC,
                CASE WHEN @inSortBy = 'Description ASC' THEN C.[DESCRIPTION] END ASC,
                CASE WHEN @inSortBy = 'Description DESC' THEN C.[DESCRIPTION] END DESC,
                CASE WHEN @inSortBy = 'Status ASC' THEN C.[Status] END ASC,
                CASE WHEN @inSortBy = 'Status DESC' THEN C.[Status] END DESC
            ) AS [RowNum], COUNT(*) OVER() [TotalRows],
            C.[CUSTOMS_DUTY] 'CustomsDuty', 
            C.[CUSTOMS_GCT] 'CustomsGct', C.[CUSTOMS_FEE] 'CustomsFee', E.[EMPRESA] 'CompanyName', 
            C.*
        FROM [dbo].[FC_COMODITYS] C WITH(NOLOCK)
            LEFT OUTER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK) ON (C.[CompanyId] = E.[ID])
        WHERE (C.[CODE] LIKE '%' + @inFilterBy + '%'
          OR C.[DESCRIPTION] LIKE '%' + @inFilterBy + '%')
          AND (@inCompanyId = 0 OR C.[CompanyId] = @inCompanyId)
          AND C.[Status] != 4 -- DON'T RETURN DELETED COUNTRIES
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'Code ASC' THEN [Code] END ASC,
        CASE WHEN @inSortBy = 'Code DESC' THEN [Code] END DESC,
        CASE WHEN @inSortBy = 'Description ASC' THEN [Description] END ASC,
        CASE WHEN @inSortBy = 'Description DESC' THEN [Description] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Commodity_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Commodity_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Commodity_CreateOrUpdate]
    @inId INT,
    @inCompanyId INT,
    @inCode NVARCHAR(20),
    @inDescription NVARCHAR(100),
    @inCustomsDuty FLOAT,
    @inCustomsGct FLOAT,
    @inCustomsFee FLOAT,
    @inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
      BEGIN
        INSERT INTO [dbo].[FC_COMODITYS]([CompanyId], [CODE], [DESCRIPTION], [CUSTOMS_DUTY], [CUSTOMS_GCT], [CUSTOMS_FEE], [Status], [CreatedBy], [ModifiedBy])
        VALUES (@inCompanyId, @inCode, @inDescription, @inCustomsDuty, @inCustomsGct, @inCustomsFee, @inStatus, @inUserId, @inUserId);

        SET @inId = SCOPE_IDENTITY();
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[FC_COMODITYS]
        SET [CompanyId] = @inCompanyId,
            [CODE] = @inCode,
            [DESCRIPTION] = @inDescription,
            [CUSTOMS_DUTY] = @inCustomsDuty,
            [CUSTOMS_GCT] = @inCustomsGct,
            [CUSTOMS_FEE] = @inCustomsFee,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [Id] = @inId;
		END

	SELECT @inId;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Commodity_ValidateDelete')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Commodity_ValidateDelete] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Commodity_ValidateDelete]
	@inId INT
AS
	SET NOCOUNT ON;

    DECLARE @PAQSCOUNT INT;

    SELECT @PAQSCOUNT = COUNT(1)
    FROM [dbo].[PAQ_PAQUETE] WITH(NOLOCK)
    WHERE [ID_COMODITY] = @inId;

    IF (@PAQSCOUNT > 0)
      BEGIN
        SELECT @inId 'Id';
      END
    ELSE
      BEGIN
        SELECT 0 'Id';
      END

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Commodity_ValidateNumber')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Commodity_ValidateNumber] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Commodity_ValidateNumber]
    @inId INT,
    @inCompanyId INT,
	@inCode NVARCHAR(20)
AS
	SET NOCOUNT ON;

	SELECT C.*
	FROM [dbo].[FC_COMODITYS] C WITH(NOLOCK)
	WHERE C.[CODE] = @inCode AND C.[CompanyId] = @inCompanyId
      AND C.[ID] != @inId;

	SET NOCOUNT OFF; 
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CIA_COMMODITY', 'Company', 'Commodities'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='CIA_COMMODITY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'CIA_COMMODITY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO
