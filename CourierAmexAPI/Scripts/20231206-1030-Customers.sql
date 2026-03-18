IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CompanyId' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE'))
BEGIN
	ALTER TABLE [CLI_CLIENTE] ADD [CompanyId] [int] NULL;
END
GO
ALTER TABLE [CLI_CLIENTE] ADD CONSTRAINT [FK_CLI_CLIENTE_EMP_EMPRESA] FOREIGN KEY ([CompanyId]) REFERENCES [dbo].[EMP_EMPRESA]([ID]);
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE'))
BEGIN
	ALTER TABLE [CLI_CLIENTE] ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE'))
BEGIN
	ALTER TABLE [CLI_CLIENTE] ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE'))
BEGIN
	ALTER TABLE [CLI_CLIENTE] ADD [CreatedBy] [uniqueidentifier] NULL;
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE'))
BEGIN
	ALTER TABLE [CLI_CLIENTE] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.CLI_CLIENTE'))
BEGIN
	ALTER TABLE [CLI_CLIENTE] ADD [ModifiedBy] [uniqueidentifier] NULL;
END
GO

UPDATE [dbo].[CLI_CLIENTE]
SET [Status] = 2
WHERE [ESTADO] = 1 AND [Status] != 2;
GO

UPDATE [dbo].[CLI_CLIENTE]
SET [Status] = 3
WHERE [ESTADO] = 0 AND [Status] != 3;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Customer_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Customer_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Customer_GetById]
	@inId INT
AS
	SET NOCOUNT ON;

	SELECT C.[ID], C.[CompanyId], C.[PAI_ID] 'CountryId', C.[IDENTIFICACION] 'Identification', C.[TIPOIDENTIFICADOR] 'IdentificationType',
    C.[NOMBRE] 'Name', C.[APELLIDO1] 'Lastname', C.[APELLIDO2] 'Lastname2', C.[DIRECCION] 'Address', C.[CODIGO] 'Code',
    C.[NOMBRECOMPLETO] 'FullName', C.[COMPANNIA] 'CompanyName', C.[ARE_ID] 'AreaId', C.[ZON_ID] 'ZoneId', C.[Tmp] 'Tmp',
    C.[COMPLEMENTO] 'Complement', C.[CAMBIA] 'Change', C.[FACTURABLE] 'Billable', C.[SINCRONIZADO] 'Synched', C.[ENVIOAEREO] 'ShipByAir',
    C.[ENVIOMARITIMO] 'ShipBySea', C.[NUMERODOCUMENTO] 'DocumentId', C.[TIPODOCUMENTO] 'DocumentTypeId', C.[Password] 'PasswordHash',
    C.[EMPRESA_ID] 'SupplierId', C.[ENCOMIENDA] 'UseBusShipment', C.[DESTINO_ID] 'LocationId', C.[CONTACTO_AUTORIZADO] 'Contact',
    C.[ENTREGA] 'UseDelivery', C.[FACTURAR_COMPANNIA] 'BillCompany', C.[TIPOPAGO_ID] 'CustomerPayTypeId', C.[CIUDAD_ID] 'StateId',
    C.[DIRECCION1] 'AddressLine1', C.[DIRECCION2] 'AddressLine2', C.[EMAIL_FACTELECTRONICA] 'BillableEmail', C.[EMAIL_CLIENTE] 'Email',
    C.[LastLoginDate], C.[SecurityStamp], C.[PASSWORD_PLANO] 'Password', C.[Role], C.[CATEGORIA] 'ClientCategoryId', C.[REFERRED_BY] 'ReferredBy',
    C.[Status], C.[CreatedAt], C.[CreatedBy], C.[ModifiedAt], C.[ModifiedBy]
	FROM [dbo].[CLI_CLIENTE] C WITH(NOLOCK)
	WHERE C.[Id] = @inId;

	SET NOCOUNT OFF; 
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_Customer_GetByCode]') AND type = N'P')
    DROP PROCEDURE [dbo].[BKO_Customer_GetByCode]
GO

CREATE PROCEDURE [dbo].[BKO_Customer_GetByCode]
    @inId VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT C.[ID], C.[CompanyId], C.[PAI_ID] AS 'CountryId', C.[IDENTIFICACION] AS 'Identification', 
           C.[TIPOIDENTIFICADOR] AS 'IdentificationType', C.[NOMBRE] AS 'Name', 
           C.[APELLIDO1] AS 'Lastname', C.[APELLIDO2] AS 'Lastname2', C.[DIRECCION] AS 'Address', 
           C.[CODIGO] AS 'Code', C.[NOMBRECOMPLETO] AS 'FullName', C.[COMPANNIA] AS 'CompanyName', 
           C.[ARE_ID] AS 'AreaId', C.[ZON_ID] AS 'ZoneId', C.[Tmp] AS 'Tmp', C.[COMPLEMENTO] AS 'Complement', 
           C.[CAMBIA] AS 'Change', C.[FACTURABLE] AS 'Billable', C.[SINCRONIZADO] AS 'Synched', 
           C.[ENVIOAEREO] AS 'ShipByAir', C.[ENVIOMARITIMO] AS 'ShipBySea', 
           C.[NUMERODOCUMENTO] AS 'DocumentId', C.[TIPODOCUMENTO] AS 'DocumentTypeId', 
           C.[Password] AS 'PasswordHash', C.[EMPRESA_ID] AS 'SupplierId', 
           C.[ENCOMIENDA] AS 'UseBusShipment', C.[DESTINO_ID] AS 'LocationId', 
           C.[CONTACTO_AUTORIZADO] AS 'Contact', C.[ENTREGA] AS 'UseDelivery', 
           C.[FACTURAR_COMPANNIA] AS 'BillCompany', C.[TIPOPAGO_ID] AS 'CustomerPayTypeId', 
           C.[CIUDAD_ID] AS 'StateId', C.[DIRECCION1] AS 'AddressLine1', 
           C.[DIRECCION2] AS 'AddressLine2', C.[EMAIL_FACTELECTRONICA] AS 'BillableEmail', 
           C.[EMAIL_CLIENTE] AS 'Email', C.[LastLoginDate], C.[SecurityStamp], 
           C.[PASSWORD_PLANO] AS 'Password', C.[Role], C.[CATEGORIA] AS 'ClientCategoryId', 
           C.[REFERRED_BY] AS 'ReferredBy', C.[Status], C.[CreatedAt], C.[CreatedBy], 
           C.[ModifiedAt], C.[ModifiedBy]
    FROM [dbo].[CLI_CLIENTE] C WITH(NOLOCK)
    WHERE C.[CODIGO] = @inId;

    SET NOCOUNT OFF;
END
GO


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Customer_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Customer_GetPaged] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Customer_GetPaged]
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
            CASE WHEN @inSortBy = 'FullName ASC' THEN C.[NOMBRECOMPLETO] END ASC,
            CASE WHEN @inSortBy = 'FullName DESC' THEN C.[NOMBRECOMPLETO] END DESC,
            CASE WHEN @inSortBy = 'Code ASC' THEN C.[CODIGO] END ASC,
            CASE WHEN @inSortBy = 'Code DESC' THEN C.[CODIGO] END DESC,
            CASE WHEN @inSortBy = 'DocumentId ASC' THEN C.[NUMERODOCUMENTO] END ASC,
            CASE WHEN @inSortBy = 'DocumentId DESC' THEN C.[NUMERODOCUMENTO] END DESC,
            CASE WHEN @inSortBy = 'BillableEmail ASC' THEN C.[EMAIL_FACTELECTRONICA] END ASC,
            CASE WHEN @inSortBy = 'BillableEmail DESC' THEN C.[EMAIL_FACTELECTRONICA] END DESC,
            CASE WHEN @inSortBy = 'Email ASC' THEN C.[EMAIL_CLIENTE] END ASC,
            CASE WHEN @inSortBy = 'Email DESC' THEN C.[EMAIL_CLIENTE] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN C.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN C.[Status] END DESC
          ) AS [RowNum], C.[NUMERODOCUMENTO] 'DocumentId', C.[CODIGO] 'Code', 
          C.[NOMBRECOMPLETO] 'FullName', C.[EMAIL_FACTELECTRONICA] 'BillableEmail', C.[EMAIL_CLIENTE] 'Email',
          C.[DIRECCION] 'Address', C.[COMPANNIA] 'CompanyName', C.[ENVIOAEREO] 'ShipByAir', C.[ENVIOMARITIMO] 'ShipBySea', 
          C.[Status], COUNT(*) OVER() [TotalRows]
        FROM [dbo].[CLI_CLIENTE] C WITH(NOLOCK)
        WHERE (C.[NUMERODOCUMENTO] LIKE '%' + @inFilterBy + '%'
          OR C.[NOMBRECOMPLETO] LIKE '%' + @inFilterBy + '%'
          OR C.[EMAIL_FACTELECTRONICA] LIKE '%' + @inFilterBy + '%'
          OR C.[EMAIL_CLIENTE] LIKE '%' + @inFilterBy + '%')
          AND (@inCompanyId = 0 OR C.[CompanyId] = @inCompanyId)
          AND C.[Status] != 4 -- DON'T RETURN DELETED CUSTOMERS
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'DocumentId ASC' THEN [DocumentId] END ASC,
        CASE WHEN @inSortBy = 'DocumentId DESC' THEN [DocumentId] END DESC,
        CASE WHEN @inSortBy = 'Code ASC' THEN [Code] END ASC,
        CASE WHEN @inSortBy = 'Code DESC' THEN [Code] END DESC,
        CASE WHEN @inSortBy = 'FullName ASC' THEN [FullName] END ASC,
        CASE WHEN @inSortBy = 'FullName DESC' THEN [FullName] END DESC,
        CASE WHEN @inSortBy = 'BillableEmail ASC' THEN [BillableEmail] END ASC,
        CASE WHEN @inSortBy = 'BillableEmail DESC' THEN [BillableEmail] END DESC,
        CASE WHEN @inSortBy = 'Email ASC' THEN [Email] END ASC,
        CASE WHEN @inSortBy = 'Email DESC' THEN [Email] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Customer_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Customer_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Customer_CreateOrUpdate]
  @inId INT,
  @inCompanyId INT,
  @inDocumentTypeId INT,
  @inDocumentId NVARCHAR(50),
  @inName NVARCHAR(50),
  @inLastname NVARCHAR(50),
  @inLastname2 NVARCHAR(50),
  @inFullName NVARCHAR(150),
  @inCompanyName NVARCHAR(200),
  @inCode NVARCHAR(200),
  @inCountryId INT,
  @inStateId INT,
  @inZoneId INT,
  @inAreaId INT,
  @inShipByAir BIT,
  @inShipBySea BIT,
  @inTmp INT,
  @inChange INT,
  @inComplement NVARCHAR(2000),
  @inBillable INT,
  @inSynched BIT,
  @inContact NVARCHAR(100),
  @inUseBusShipment BIT,
  @inSupplierId INT,
  @inLocationId INT,
  @inUseDelivery BIT,
  @inBillCompany BIT,
  @inCustomerPayTypeId INT,
  @inAddress NVARCHAR(2000),
  @inAddressLine1 NVARCHAR(45),
  @inAddressLine2 NVARCHAR(45),
  @inBillableEmail NVARCHAR(100),
  @inEmail NVARCHAR(100),
  @inPasswordHash NVARCHAR(255),
  @inLastLoginDate DATETIME,
  @inToken NVARCHAR(64),
  @inSecurityStamp NVARCHAR(64),
  @inPassword NVARCHAR(64),
  @inRole TINYINT,
  @inClientCategoryId TINYINT,
  @inReferredBy NVARCHAR(200),
  @inStatus TINYINT,
  @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
      BEGIN
        DECLARE @Identification AS INT;
        EXECUTE usp_GetNumeroClienteNoUtilizado @inCountryId, @Identification OUTPUT;

        IF @Identification IS NULL	
          BEGIN
            SELECT @Identification = ISNULL(MAX(CAST([IDENTIFICACION] AS INT)), 0) + 1
            FROM [dbo].[CLI_CLIENTE] WITH(NOLOCK)
            Where [PAI_ID] = @inCountryId;
          END

        SELECT @inCode = CONCAT([INICIAL], [NUMERO], @Identification)
        FROM [PAI_PAIS] WITH(NOLOCK)
        WHERE [ID] = @inCountryId;

        INSERT INTO [dbo].[CLI_CLIENTE]([CompanyId], [TIPODOCUMENTO], [NUMERODOCUMENTO], [NOMBRE], [APELLIDO1], [APELLIDO2], [NOMBRECOMPLETO], [COMPANNIA], [CODIGO], [PAI_ID], [CIUDAD_ID], [ZON_ID], 
          [ARE_ID], [IDENTIFICACION], [TIPOIDENTIFICADOR], [ENVIOAEREO], [ENVIOMARITIMO], [Tmp], [CAMBIA], [COMPLEMENTO], [FACTURABLE], [SINCRONIZADO], [CONTACTO_AUTORIZADO], 
          [ENCOMIENDA], [EMPRESA_ID], [DESTINO_ID], [ENTREGA], [FACTURAR_COMPANNIA], [TIPOPAGO_ID], [DIRECCION], [DIRECCION1], [DIRECCION2], 
          [EMAIL_FACTELECTRONICA], [EMAIL_CLIENTE], [PASSWORD], [LastLoginDate], [Token], [SecurityStamp], [PASSWORD_PLANO], [Role], [CATEGORIA], [REFERRED_BY], 
          [CREO], [MODIFICO], [FECHACREO], [FECHAMODIFICO], [Status], [CreatedBy], [ModifiedBy])
        VALUES (@inCompanyId, @inDocumentTypeId, @inDocumentId, @inName, @inLastname, ISNULL(@inLastname2, ''), @inFullName, ISNULL(@inCompanyName, ''), @inCode, @inCountryId, @inStateId, @inZoneId, 
          @inAreaId, @Identification, 0, @inShipByAir, @inShipBySea, @inTmp, @inChange, ISNULL(@inComplement, ''), @inBillable, @inSynched, @inContact, 
          @inUseBusShipment, ISNULL(@inSupplierId, 0), @inLocationId, @inUseDelivery, @inBillCompany, ISNULL(@inCustomerPayTypeId, 0), ISNULL(@inAddress, ''), ISNULL(@inAddressLine1, ''), ISNULL(@inAddressLine2, ''), 
          ISNULL(@inBillableEmail, ''), ISNULL(@inEmail, ''), @inPasswordHash, @inLastLoginDate, @inToken, @inSecurityStamp, @inPassword, @inRole, @inClientCategoryId, @inReferredBy,
          'NA', 'NA', GETDATE(), GETDATE(), @inStatus, @inUserId, @inUserId);

        SET @inId = SCOPE_IDENTITY();

        INSERT INTO FC_NOTIFICACIONES
        SELECT 'CLIENTE_NUEVO_EN', @inId, GETDATE(), 0, NULL 
        FROM [dbo].[CLI_CLIENTE];

        IF (EXISTS(SELECT [IDENTIFICACION] FROM [dbo].[ClientesNoUtilizados] WHERE [IDENTIFICACION] = @Identification AND [UTILIZADO] = 0))
		      UPDATE [dbo].[ClientesNoUtilizados] SET [UTILIZADO] = 1 WHERE [IDENTIFICACION] = @Identification;
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[CLI_CLIENTE]
        SET [CompanyId] = @inCompanyId,
            [TIPODOCUMENTO] = @inDocumentTypeId,
            [NUMERODOCUMENTO] = @inDocumentId,
            [NOMBRE] = @inName,
            [APELLIDO1] = @inLastname,
            [APELLIDO2] = ISNULL(@inLastname2, ''),
            [NOMBRECOMPLETO] = @inFullName,
            [COMPANNIA] = ISNULL(@inCompanyName, ''),
            [CODIGO] = @inCode,
            [PAI_ID] = @inCountryId,
            [CIUDAD_ID] = @inStateId,
            [ZON_ID] = @inZoneId,
            [ARE_ID] = @inAreaId,
            [ENVIOAEREO] = @inShipByAir,
            [ENVIOMARITIMO] = @inShipBySea,
            [Tmp] = @inTmp,
            [CAMBIA] = @inChange,
            [COMPLEMENTO] = ISNULL(@inComplement, ''),
            [FACTURABLE] = @inBillable,
            [SINCRONIZADO] = @inSynched,
            [CONTACTO_AUTORIZADO] = @inContact,
            [ENCOMIENDA] = @inUseBusShipment,
            [EMPRESA_ID] = ISNULL(@inSupplierId, 0),
            [DESTINO_ID] = @inLocationId,
            [ENTREGA] = @inUseDelivery,
            [FACTURAR_COMPANNIA] = @inBillCompany,
            [TIPOPAGO_ID] = ISNULL(@inCustomerPayTypeId, 0),
            [DIRECCION] = ISNULL(@inAddress, ''),
            [DIRECCION1] = ISNULL(@inAddressLine1, ''),
            [DIRECCION2] = ISNULL(@inAddressLine2, ''),
            [EMAIL_FACTELECTRONICA] = ISNULL(@inBillableEmail, ''),
            [EMAIL_CLIENTE] = ISNULL(@inEmail, ''),
            [PASSWORD] = @inPasswordHash,
            [LastLoginDate] = @inLastLoginDate,
            [Token] = @inToken,
            [SecurityStamp] = @inSecurityStamp,
            [PASSWORD_PLANO] = @inPassword,
            [Role] = @inRole,
            [CATEGORIA] = @inClientCategoryId,
            [REFERRED_BY] = @inReferredBy,
            [Status] = @inStatus,
            [ModifiedBy] = @inUserId,
            [ModifiedAt] = GETDATE()
        WHERE [Id] = @inId;
		END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CTM_CUSTOMERS', 'Customer', 'Customers'
WHERE EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='CTM_CUSTOMERS'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'CTM_CUSTOMERS'
) as t
WHERE EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO
