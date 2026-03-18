--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Enabled Credit----------------------------------
--------------------------------------------------------------------------

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CUST_ENABLED_CREDIT', 'Customers', 'Enabled Credit'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='CUST_ENABLED_CREDIT'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'CUST_ENABLED_CREDIT'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


/****** Object:  StoredProcedure [dbo].[BKO_GET_CLIENT_CREDIT_SEARCH]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GET_CLIENT_CREDIT_SEARCH')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GET_CLIENT_CREDIT_SEARCH] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GET_CLIENT_CREDIT_SEARCH]  
    @CustomerCode VARCHAR(200),  
    @CompanyId INT  
AS  
BEGIN  
  
  
    SELECT   
        CODIGO AS CustomerCode,  
        NOMBRECOMPLETO AS CustomerName,  
        IDENTIFICACION AS Identification,  
        CompanyId  
    FROM CLI_CLIENTE_CREDITO  
    WHERE  
        CompanyId = @CompanyId  
        AND (  
            @CustomerCode = ''  
            OR CODIGO LIKE '%' + @CustomerCode + '%'  
            OR NOMBRECOMPLETO LIKE '%' + @CustomerCode + '%'  
        );  
END  

GO          

/****** Object:  StoredProcedure [dbo].[BKO_SET_CLIENT_CREDIT]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_SET_CLIENT_CREDIT')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_SET_CLIENT_CREDIT] AS RETURN')
END
GO
  
ALTER PROCEDURE [dbo].[BKO_SET_CLIENT_CREDIT]  
    @CustomerCode VARCHAR(200),  
    @CompanyId INT  
AS  
BEGIN  
     
  
    INSERT INTO CLI_CLIENTE_CREDITO (CODIGO, IDENTIFICACION, NOMBRECOMPLETO, CompanyId)  
    SELECT   
        CODIGO,  
        IDENTIFICACION,  
        NOMBRECOMPLETO,  
        @CompanyId  
    FROM CLI_CLIENTE  
    WHERE CODIGO = @CustomerCode;  
END  
GO


/****** Object:  StoredProcedure [dbo].[BKO_GET_ALL_ENABLED_CUSTOMERS]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GET_ALL_ENABLED_CUSTOMERS')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GET_ALL_ENABLED_CUSTOMERS] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GET_ALL_ENABLED_CUSTOMERS]  
    @CompanyId INT  
AS  
BEGIN  
      
  
    SELECT   
        CC.CODIGO AS CustomerCode,  
        CC.IDENTIFICACION AS Identification,  
        CC.NOMBRECOMPLETO AS CustomerName,  
        CC.CompanyId  
    FROM CLI_CLIENTE_CREDITO CC  
    WHERE CC.CompanyId = @CompanyId;  
END


/****** Object:  StoredProcedure [dbo].[BKO_DELETE_CLI_CLIENT_CREDIT]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DELETE_CLI_CLIENT_CREDIT')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_DELETE_CLI_CLIENT_CREDIT] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_DELETE_CLI_CLIENT_CREDIT]      
    @CustomerCode VARCHAR(200),  
    @CompanyId INT  
AS  
BEGIN  
     
  
    DELETE FROM CLI_CLIENTE_CREDITO  
    WHERE CODIGO = @CustomerCode  
      AND CompanyId = @CompanyId;  
END  
