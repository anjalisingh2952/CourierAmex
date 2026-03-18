IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.FC_TIPODOCUMENTOPAGO'))
BEGIN
	ALTER TABLE [FC_TIPODOCUMENTOPAGO] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.FC_TIPODOCUMENTOPAGO'))
BEGIN
	ALTER TABLE [FC_TIPODOCUMENTOPAGO] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.FC_TIPODOCUMENTOPAGO'))
BEGIN
	ALTER TABLE [FC_TIPODOCUMENTOPAGO] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.FC_TIPODOCUMENTOPAGO'))
BEGIN
	ALTER TABLE [FC_TIPODOCUMENTOPAGO] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.FC_TIPODOCUMENTOPAGO'))
BEGIN
	ALTER TABLE [FC_TIPODOCUMENTOPAGO] ADD [ModifiedBy] [uniqueidentifier] NULL;
END
GO

UPDATE [dbo].[FC_TIPODOCUMENTOPAGO]
SET [Status] = 2
WHERE [Status] != 2;
GO



IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DocumentPayType_GetPaged')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_DocumentPayType_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_DocumentPayType_GetPaged]
    @inCompanyId INT,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
  
	SET @inPageIndex = @inPageIndex - 1

  	-- Set the page bounds
	DECLARE @thePageLowerBound int= @inPageSize * @inPageIndex;
	DECLARE @thePageUpperBound int= @thePageLowerBound + @inPageSize;

	;WITH CTE_DocumentPayTypeInfo AS (
		SELECT 
			td.[ID] AS 'Id',
			td.[DESCRIPCION] AS 'Name',
			tp.[DESCRIPCION] AS 'PayType', 
			tc.[DES_MONEDA] AS 'Currency', 
			td.[COMISIONBANCARIA] AS 'BankComission', 
			td.[IMPUESTOVENTAS] AS 'VATWithholding', 
			td.[ADELANTORENTA] 'IncomeWithholding',
			td.[IDEMPRESA] As 'CompanyId',
			td.[Status] As 'Status'
		FROM dbo.FC_TIPODOCUMENTOPAGO td WITH(NOLOCK) 
		INNER JOIN dbo.FC_TIPOPAGO tp WITH(NOLOCK)
		ON td.[ID_TIPOPAGO] = tp.[ID]
		INNER JOIN dbo.CN_TIPO_CAMBIO tc
		ON td.[COD_MONEDA] = TC.[COD_MONEDA]
		and td.[IDEMPRESA] = tc.[ID_EMPRESA]
		WHERE (@inCompanyId = 0 OR td.[IDEMPRESA] = @inCompanyId) 
		AND	(LEN(@inFilterBy) = 0 OR ( td.[DESCRIPCION] LIKE @inFilterBy+'%'))
		AND td.[Status] != 4 -- DON'T RETURN DELETED

	),CTE_Rank AS
	(
		SELECT 
		   [Id]
		  ,[Name]
		  ,[PayType]
		  ,[Currency]
		  ,[BankComission]
		  ,[VATWithholding]
		  ,[IncomeWithholding]
		  ,[CompanyId]
		  ,[Status]
		  ,RowIndex = ROW_NUMBER() OVER (
		ORDER BY 
			CASE WHEN @inSortBy = 'Name ASC'  THEN [Name] END ASC,
			CASE WHEN @inSortBy = 'Name DESC'  THEN [Name] END DESC,
			CASE WHEN @inSortBy = 'PayType ASC'  THEN [PayType] END ASC,
			CASE WHEN @inSortBy = 'PayType DESC'  THEN [PayType] END DESC,
			CASE WHEN @inSortBy = 'Currency ASC'  THEN [Currency] END ASC,
			CASE WHEN @inSortBy = 'Currency Desc'  THEN [Currency] END DESC
		), 
		COUNT(1) OVER() AS TotalRows
		FROM CTE_DocumentPayTypeInfo
	)
	SELECT
		   o.[Id]
		  ,o.[Name]
		  ,o.[PayType]
		  ,o.[Currency]
		  ,o.[BankComission]
		  ,o.[VATWithholding]
		  ,o.[IncomeWithholding]
		  ,E.[EMPRESA] 'CompanyName'
		  ,o.[Status]
		  ,o.[TotalRows]
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


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DocumentPayType_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_DocumentPayType_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].BKO_DocumentPayType_GetById
	@inId INT
AS
	SET NOCOUNT ON;

		SELECT 
		td.[ID] AS 'Id',
		td.[DESCRIPCION] AS 'Name',
		td.[IDBANCO] AS 'BankId',
		td.[IDMARCA] AS 'BrandId',
		td.[ID_TIPOPAGO] AS 'PayTypeId',
		tp.[DESCRIPCION] AS 'PayType', 
		td.[COD_MONEDA] AS 'CurrencyCode',
		tc.[DES_MONEDA] AS 'Currency', 
		td.[COMISIONBANCARIA] AS 'BankComission', 
		td.[IMPUESTOVENTAS] AS 'VATWithholding', 
		td.[ADELANTORENTA] 'IncomeWithholding',
		td.[COD_MODULO] AS 'ModuleId',
		td.[COD_PLANTILLA] AS 'TemplateId', 
		td.[IDEMPRESA] As 'CompanyId',
		td.[Status] As 'Status'
		FROM dbo.FC_TIPODOCUMENTOPAGO td WITH(NOLOCK) 
		INNER JOIN dbo.FC_TIPOPAGO tp WITH(NOLOCK)
		ON td.[ID_TIPOPAGO] = tp.[ID]
		INNER JOIN dbo.CN_TIPO_CAMBIO tc WITH(NOLOCK)
		ON td.[COD_MONEDA] = TC.[COD_MONEDA]
		and td.[IDEMPRESA] = tc.[ID_EMPRESA]
		WHERE td.[Id] = @inId;

	SET NOCOUNT OFF; 
GO


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DocumentPayType_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_DocumentPayType_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_DocumentPayType_CreateOrUpdate]
    @inId TINYINT,
    @inCompanyId INT,
    @inBankId TINYINT,
    @inBrandId TINYINT,
    @inPayTypeId INT,
	@inName VARCHAR(100),
	@inCurrencyCode VARCHAR(10),
	@inBankComission MONEY,
	@inVATWithholding MONEY,
	@inIncomeWithholding MONEY,
	@inModuleId VARCHAR(10),
	@inTemplateId TINYINT,
	@inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
BEGIN
	IF (ISNULL(@inId, 0) = 0) 
		BEGIN
    		INSERT INTO FC_TIPODOCUMENTOPAGO
			   ([IDEMPRESA], [ID_TIPOPAGO] ,[DESCRIPCION], [IDMARCA], [IDBANCO], [COMISIONBANCARIA], [IMPUESTOVENTAS], [ADELANTORENTA], [COD_MONEDA], [COD_MODULO], [COD_PLANTILLA], [Status], [CreatedBy], [ModifiedBy])
			VALUES(@inCompanyId, @inPayTypeId, @inName, @inBrandId, @inBankId, @inBankComission, @inVATWithholding, @inIncomeWithholding, @inCurrencyCode, @inModuleId, @inTemplateId, @inStatus, @inUserId, @inUserId);

			SET @inId = SCOPE_IDENTITY();
		END
	ELSE
	BEGIN
		UPDATE [dbo].FC_TIPODOCUMENTOPAGO
			SET 
				[ID_TIPOPAGO] = @inPayTypeId,
				[DESCRIPCION] = @inName, 
				[IDMARCA] = @inBrandId,
				[IDBANCO] = @inBankId,
				[COMISIONBANCARIA] = @inBankComission,
				[IMPUESTOVENTAS] = @inVATWithholding,
				[ADELANTORENTA] = @inIncomeWithholding,
				[COD_MONEDA] = @inCurrencyCode,
				[Status] = @inStatus,
				[ModifiedAt] = GETDATE(),
				[ModifiedBy] = @inUserId
			WHERE [ID] = @inId;
	END

	SELECT @inId;
END

GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CIA_DOCUMENTPAYTYPES', 'Company', 'Document Pay Types'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='CIA_DOCUMENTPAYTYPES'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'CIA_DOCUMENTPAYTYPES'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

