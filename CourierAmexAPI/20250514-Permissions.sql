--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Package Inventory----------------------------------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_PACKAGE_INVENTORY', 'Packages', 'Package Inventory'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_PACKAGE_INVENTORY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_PACKAGE_INVENTORY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Customer Service-----------------
--------------------------------------------------------------------------

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CUST_COSTOMER_SERVICE', 'Customers', 'Customer Service'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='CUST_COSTOMER_SERVICE'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'CUST_COSTOMER_SERVICE'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Pending Invoices-----------------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_PENDING_INVOICES', 'Reports', 'Pending Invoices'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_PENDING_INVOICES'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_PENDING_INVOICES'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Sales Detail--------------------------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_SALES_DETAIL', 'Reports', 'Sales Detail'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_SALES_DETAIL'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_SALES_DETAIL'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Manifest Report By Bag-----
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_MNF_REPORT_BY_BAG', 'Reports', 'Manifest Report By Bag'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_MNF_REPORT_BY_BAG'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_MNF_REPORT_BY_BAG'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO



--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Courier / Consolidated-----------------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_COURIER_CONSOLIDATED', 'Reports', 'Courier / Consolidated'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_COURIER_CONSOLIDATED'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_COURIER_CONSOLIDATED'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Has Invoice Maintenance----------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_HAS_INVOICE_MAINTENANCE', 'Packages', 'Has Invoice Maintenance'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_HAS_INVOICE_MAINTENANCE'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_HAS_INVOICE_MAINTENANCE'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
--------------------------PERMISSIONS-Price Image Maintenance----------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PKG_PRICE_IMAGE_MAINTENANCE', 'Packages', 'Price Image Maintenance'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PKG_PRICE_IMAGE_MAINTENANCE'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PKG_PRICE_IMAGE_MAINTENANCE'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Load Customs Taxex-------------------
--------------------------------------------------------------------------

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'INV_LOAD_CUSTOMS_TAXEX', 'Invoice', 'Load Customs Taxex'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='INV_LOAD_CUSTOMS_TAXEX'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'INV_LOAD_CUSTOMS_TAXEX'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Aeropost Mass Upload-------------------
--------------------------------------------------------------------------

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_AEROPOST_MASS_UPLOAD', 'Reports', 'Aeropost Mass Upload'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_AEROPOST_MASS_UPLOAD'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_AEROPOST_MASS_UPLOAD'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


/****** Object:  StoredProcedure [dbo].[BKO_GET_STORE_INVENTORY_REPORT]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GET_STORE_INVENTORY_REPORT')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GET_STORE_INVENTORY_REPORT] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GET_STORE_INVENTORY_REPORT]    
    @StoreId INT,    
    @CompanyId INT    
AS    
BEGIN    
    SELECT     
        FC.NOMBRE AS Store,     
        C.CODIGO AS Customer,     
        CASE C.FACTURAR_COMPANNIA    
            WHEN 0 THEN C.NOMBRECOMPLETO    
            WHEN 1 THEN C.COMPANNIA    
            ELSE C.NOMBRECOMPLETO    
        END AS Name,      
        P.NUMERO AS Package,     
        E.NOMBRE AS PackageStatus,     
        ISNULL(FP.N_FACTURA, 0) AS Invoice,    
        ISNULL(EF.[DESCRIPCION], 'NA') AS InvoiceStatus,    
        TP.DESCRIPCION AS PaymentType,    
        Z.NOMBRE AS Zone,     
        A.NOMBRE AS Stop,     
        P.FECHACREO AS CreatedDate,    
        IIF(P.TIPOPAQUETE = 1, 'AIR', 'SEA') AS Transport,    
        CASE     
            WHEN C.ENVIOAEREO = 1 AND C.ENVIOMARITIMO = 1 THEN 'AIR-SEA'    
            WHEN C.ENVIOAEREO = 1 THEN 'AIR'    
            WHEN C.ENVIOMARITIMO = 1 THEN 'SEA'    
        END AS TransportType,    
        CASE    
            WHEN C.ENCOMIENDA = 1 AND C.ENTREGA = 1 THEN 'PICKUP-DELIVERY'    
            WHEN C.ENCOMIENDA = 1 THEN 'PICKUP'    
            WHEN C.ENTREGA = 1 THEN 'DELIVERY'    
            ELSE 'NA'    
        END AS DeliveryType,     
        'IN INVENTORY' AS Difference,    
        HRE.DESCRIPCION AS Route      
    FROM     
        [dbo].[INVENTARIO_PAQUETE] IP    
    INNER JOIN [dbo].[PAQ_PAQUETE] P ON IP.NUMERO = P.NUMERO    
    INNER JOIN [dbo].[FC_CAJA] FC ON IP.CAJA_ID = FC.CAJA_ID    
    INNER JOIN [dbo].[EST_ESTADO] E ON P.EST_ID = E.ID     
    INNER JOIN [dbo].[CLI_CLIENTE] C ON P.CLIENTE = C.CODIGO     
    LEFT JOIN [dbo].[FC_TIPOPAGO] TP ON C.TIPOPAGO_ID = TP.ID    
    LEFT JOIN [dbo].[FC_FACTURAPAQUETES] FP ON FP.NUMERO = P.NUMERO     
    LEFT JOIN [dbo].[FC_FACTURA] F ON F.N_FACTURA = FP.N_FACTURA     
    LEFT JOIN [dbo].[FC_ESTADOFACTURA] EF ON EF.ID = F.ESTADO      
    LEFT JOIN [dbo].[ZON_ZONA] Z ON Z.ID = C.ZON_ID     
    LEFT JOIN [dbo].[ARE_AREA] A ON A.ID = C.ARE_ID    
    LEFT JOIN HOJA_RUTA_DETALLE HRD ON P.ID = HRD.PAQ_ID    
    LEFT JOIN HOJA_RUTA_ENCABEZADO HRE ON HRD.HOJARUTA_ID = HRE.ID    
    WHERE     
        IP.CAJA_ID = @StoreId AND C.CompanyId = @CompanyId    
END 

GO

/****** Object:  StoredProcedure [dbo].[BKO_INSERT_INVENTORY_PACKAGE]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_INSERT_INVENTORY_PACKAGE')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_INSERT_INVENTORY_PACKAGE] AS RETURN')
END
GO
  
CREATE PROCEDURE [dbo].[BKO_INSERT_INVENTORY_PACKAGE]  
    @StoreId INT,  
    @PackageNumber INT,  
    @UserName VARCHAR(100),  
    @Date DATETIME  
AS  
BEGIN  
    -- Declare variables to hold customer data  
    DECLARE @CustomerAccount VARCHAR(250)  
    DECLARE @CustomerName VARCHAR(250)  
  
    -- Get customer data from PAQ_PAQUETE based on package number  
    SELECT   
        @CustomerAccount = CLI.CODIGO,  
        @CustomerName = CLI.NOMBRE  
    FROM PAQ_PAQUETE P  
    INNER JOIN CLI_CLIENTE CLI ON P.CLIENTE = CLI.CODIGO  
  
    WHERE P.NUMERO = @PackageNumber  
  
    -- Insert into inventory table  
    INSERT INTO [dbo].[INVENTARIO_PAQUETE] (  
        [CAJA_ID],  
        [NUMERO],  
        [USUARIO],  
        [CLIENTE],  
        [NOMBRE],  
        [FECHA]  
    )  
    VALUES (  
        @StoreId,  
        @PackageNumber,  
        @UserName,  
        @CustomerAccount,  
        @CustomerName,  
        @Date  
    );  
END  
GO

/****** Object:  StoredProcedure [dbo].[BKO_Delete_Inventory_Package]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Delete_Inventory_Package')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Delete_Inventory_Package] AS RETURN')
END
GO
    
CREATE PROCEDURE [dbo].[BKO_Delete_Inventory_Package]  
    @PackageNumber INT = 0,     -- Specific package number to delete (if deleting one)  
    @DeleteAll INT = 0,         -- Set to 1 to delete all packages in a store  
    @StoreId INT                -- Store ID (CAJA_ID)  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    IF @DeleteAll = 1  
    BEGIN  
        -- Delete all packages from the specified store  
        DELETE FROM INVENTARIO_PAQUETE  
        WHERE CAJA_ID = @StoreId;  
    END  
    ELSE IF @PackageNumber > 0  
    BEGIN  
        -- Delete a single package from the specified store  
        DELETE FROM INVENTARIO_PAQUETE  
        WHERE NUMERO = @PackageNumber AND CAJA_ID = @StoreId;  
    END  
END  
 GO

 /****** Object:  StoredProcedure [dbo].[BKO_Resend_Package_Notification]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Resend_Package_Notification')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Resend_Package_Notification] AS RETURN')
END
GO

CREATE PROCEDURE [dbo].[BKO_Resend_Package_Notification]  
  
@PACKAGENUMBER int,  
@DOCUMENTTYPE varchar(50)  
AS  
  
BEGIN  
 -- Check if a notification for the package already exists  
 IF(SELECT COUNT(1) FROM PAQ_NOTIFICACIONES WHERE TIPODOCUMENTO = @DOCUMENTTYPE AND NODOCUMENTO = @PACKAGENUMBER) > 0  
 BEGIN  
  -- Update the existing notification to reflect the resend status  
  UPDATE PAQ_NOTIFICACIONES  
  SET ESTADO = 0, FECHA = GETDATE(), FECHAENVIO = NULL  
  WHERE TIPODOCUMENTO = @DOCUMENTTYPE AND NODOCUMENTO = @PACKAGENUMBER  
 END  
 ELSE  
 BEGIN  
  -- Insert a new notification request for the customer notification  
  INSERT INTO PAQ_NOTIFICACIONES (TIPODOCUMENTO, NODOCUMENTO, FECHA, ESTADO, FECHAENVIO)  
  VALUES (@DOCUMENTTYPE, @PACKAGENUMBER, GETDATE(), 0, NULL)  
 END  
END
GO

 /****** Object:  StoredProcedure [dbo].[BKO_REPORTE_PENDING_INVOICES]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_REPORTE_PENDING_INVOICES')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_REPORTE_PENDING_INVOICES] AS RETURN')
END
GO
   
CREATE PROCEDURE [dbo].[BKO_REPORTE_PENDING_INVOICES]    
    @CompanyId INT,    
    @StartDate DATETIME,    
    @EndDate DATETIME,    
    @PaymentType INT,    
    @ZoneId INT    
AS    
BEGIN    
    SET NOCOUNT ON;    
    
    SELECT     
        C.CODIGO AS CustomerCode,    
        C.NOMBRECOMPLETO AS CustomerFullName,    
        TP.DESCRIPCION AS PaymentType,    
        Z.NOMBRE AS Zone,    
        F.N_FACTURA AS InvoiceNumber,    
        F.FECHA AS InvoiceDate,    
        EF.DESCRIPCION AS InvoiceStatus,      
       F.TOTAL,2 AS TOTAL,    
        F.TOTALLOCAL AS TOTALLOCAL,    
       F.SALDO AS Balance,    
       F.SALDOLOCAL AS LocalBalance,    
        A.NOMBRE AS Stop    
    FROM FC_FACTURA F    
    INNER JOIN CLI_CLIENTE C ON F.CLIENTE = C.CODIGO    
    INNER JOIN FC_ESTADOFACTURA EF ON F.ESTADO = EF.ID    
    INNER JOIN ZON_ZONA Z ON C.ZON_ID = Z.ID    
    INNER JOIN ARE_AREA A ON Z.ID = A.ZON_ID AND C.ARE_ID = A.ID    
    INNER JOIN FC_TIPOPAGOCLIENTE TP ON C.TIPOPAGO_ID = TP.ID    
    WHERE F.FECHA BETWEEN @StartDate AND @EndDate    
      AND (C.TIPOPAGO_ID = @PaymentType OR @PaymentType = 0)    
      AND (C.ZON_ID = @ZoneId OR @ZoneId = 0)    
      AND F.ESTADO IN (0, 3) -- 0: Pending Payment, 3: Credit Pending    
      AND F.ID_EMPRESA = @CompanyId    
    ORDER BY F.FECHA ASC, Z.NOMBRE ASC, C.NOMBRECOMPLETO ASC    
END 

 /****** Object:  StoredProcedure [dbo].[BKO_SALES_REPORT]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_SALES_REPORT')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_SALES_REPORT] AS RETURN')
END
GO

CREATE PROCEDURE [dbo].[BKO_SALES_REPORT]  
@StartDate datetime,  
@EndDate datetime,  
@CustomerCode varchar(200),  
@CompanyID int   
AS  
  
SET NOCOUNT ON;  
  
SELECT   
    fe.NumeroConsecutivo AS InvoiceNumber,   
    CONVERT(datetime, fe.FechaEmision) AS IssueDate,   
    CASE   
        WHEN fe.NumeroConsecutivoTipoComprobante = '01' THEN 'Electronic Invoice'  
        WHEN fe.NumeroConsecutivoTipoComprobante = '04' THEN 'Electronic Receipt'  
        WHEN fe.NumeroConsecutivoTipoComprobante = '03' THEN 'Credit Note'   
    END AS InvoiceType,  
    fe.ReceptorNombre AS CustomerName,   
    fe.LineaDetalleDetalle AS DetailLineDescription,   
    fe.LineaDetalleCantidad AS DetailLineQuantity,  
    fe.ResumenFacturaCodigoTipoMonedaCodigoMoneda AS CurrencyCode,   
    CAST(ROUND(fe.LineaDetallePrecioUnitario, 2) AS DECIMAL(18, 2)) AS UnitPrice,    
    CAST(ROUND(fe.LineaDetalleMontoDescuento, 2) AS DECIMAL(18, 2)) AS DiscountAmount,    
    CAST(ROUND(fe.LineaDetalleImpuestoTarifa, 2) AS DECIMAL(18, 2)) AS TaxRate,    
    CAST(ROUND(fe.LineaDetalleImpuestoMonto, 2) AS DECIMAL(18, 2)) AS TaxAmount,    
    CAST(ROUND(fe.LineaDetalleMontoTotalLinea, 2) AS DECIMAL(18, 2)) AS TotalLineAmount,    
    CAST(ROUND(fe.ResumenFacturaCodigoTipoMonedaTipoCambio, 2) AS DECIMAL(18, 2)) AS CurrencyExchangeRate,   
    fe.Respuesta AS Response,   
    CASE   
        WHEN fe.MedioPago = '01' THEN 'Cash'  
        WHEN fe.MedioPago = '02' THEN 'Card'  
        WHEN fe.MedioPago = '03' THEN 'Cheque'  
        WHEN fe.MedioPago = '04' THEN 'Transfer'  
        WHEN fe.MedioPago = '05' THEN 'Collected by third parties'  
        WHEN fe.MedioPago = '06' THEN 'Others'  
        ELSE 'Transfer'  
    END AS PaymentMethod,   
    'Cash' AS SaleCondition,   
    ff.CLIENTE AS CustomerCode,  
    fe.OtrosCargosDetalle AS OtherChargesDescription,  
   CAST(ROUND( fe.OtrosCargosMontoCargo, 2) AS DECIMAL(18, 2)) AS OtherChargesAmount  
    --CONVERT(varchar(50), @StartDate, 103) AS StartDate,   
    --CONVERT(varchar(50), @EndDate, 103) AS EndDate   
FROM   
    FC_FACTURA_ELECTRONICA fe WITH (NOLOCK)   
INNER JOIN   
    FC_FACTURA ff  
    ON ff.N_FACTURA = fe.N_FACTURA  
    AND fe.Id_Reconciliacion = 0  
    AND fe.Respuesta = 'OK-aceptado'  
WHERE   
    ff.ESTADO NOT IN (1) -- Excluding canceled invoices   
    AND fe.LineaDetalleCodigoComercialCodigo NOT IN (6)   
    AND fe.ClaveFechaFactura >= @StartDate   
    AND fe.ClaveFechaFactura < @EndDate  
    AND (ff.CLIENTE = @CustomerCode OR @CustomerCode = '') -- Customer filter  
    AND fe.NumeroConsecutivoTipoComprobante IN ('01', '04') -- Filtering invoice types   
    AND fe.ClaveFechaFactura >= '20180101' -- Date filter   
    AND ff.ID_EMPRESA = @CompanyID -- Filter by CompanyID  


 /****** Object:  StoredProcedure [dbo].[BKO_GetManifestReportByBag]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetManifestReportByBag')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetManifestReportByBag] AS RETURN')
END
GO
    
CREATE PROCEDURE [dbo].[BKO_GetManifestReportByBag] --'330-22459010',2      
    @MANIFESTNUMBER AS VARCHAR(50),    
    @COMPANYID AS INT   
AS      
BEGIN      
    DECLARE @NOMBREPROVEEDOR AS VARCHAR(50)      
  
    -- Get the provider name  
    SELECT @NOMBREPROVEEDOR = NOMBREPROVEEDOR FROM PAR_PARAMETRO      
  
    -- Get the manifest billing details, grouped by Bolsa (Bag)  
    SELECT   
        CASE DM.NUMERO   
            WHEN '' THEN 'GUIA MADRE'   
            ELSE DM.NUMERO   
        END AS ChildGuide,  -- Child Guide  
        CASE C.FACTURAR_COMPANNIA      
            WHEN 0 THEN C.NOMBRECOMPLETO      
            WHEN 1 THEN C.COMPANNIA      
        END AS CustomerName,  -- Customer Name  
        P.NUMERO AS PackageNumbers,  -- Individual Package Number  
        P.PESO AS [Weight],  -- Weight  
        P.PESOVOLUMETRICO AS VolumeWeight,  -- Volumetric Weight  
        @NOMBREPROVEEDOR AS ProviderName,  -- Provider Name  
        ISNULL(TI.DESCRIPCION, '') AS [Classification],  -- Classification  
        ISNULL(Z.NOMBRE, '') + ' - ' + ISNULL(A.NOMBRE, '') AS [Address],  -- Address  
        [dbo].[GetEmail](C.ID) AS Email,  -- Email  
        [dbo].[GetTelefono](C.ID) AS Phone,  -- Phone  
        CASE DM.BOLSA   
            WHEN NULL THEN '0'      
            WHEN '' THEN '0'   
            ELSE DM.BOLSA   
        END AS Bag,  -- Bag  
        CASE P.PALETS   
            WHEN 0 THEN 1   
            ELSE P.PAQUETES   
        END AS Pieces,  -- Pieces  
        P.CATEGORIA AS Category,  -- Category  
        ISNULL(P.PIESCUBICOS, 0) AS CubicFeet,  -- Cubic Feet  
        P.BUSCOCLIENTE AS CustomerPickup,  -- Customer Pickup  
        P.PROCEDENCIA AS Origin,  
        P.COURIER AS Courier,  
        P.NOMBRECOURIER AS CourierName,  
        P.DESCRIPCION AS [Description]  
    FROM ENM_ENCABEZADO_MANIFIESTO EM      
    INNER JOIN DEM_DETALLE_MANIFIESTO DM ON EM.ID = DM.ENM_ID      
    INNER JOIN PAQ_PAQUETE P ON P.ID = DM.PAQ_ID      
    INNER JOIN CLI_CLIENTE C ON P.CLIENTE = C.CODIGO      
    LEFT JOIN TIPO_IMPUESTO TI ON DM.TIPOIMPUESTO = TI.ID      
    LEFT JOIN ZON_ZONA Z ON C.ZON_ID = Z.ID      
    LEFT JOIN ARE_AREA A ON C.ARE_ID = A.ID      
    WHERE EM.NUMERO = @MANIFESTNUMBER   
    AND EM.CompanyId = @COMPANYID    
    ORDER BY   
        DM.BOLSA,   
        CustomerName,   
        PackageNumbers;  -- Grouping by Bolsa (Bag) and sorting by Customer Name and Package Numbers  
  
END
GO

 /****** Object:  StoredProcedure [dbo].[BKO_GetManifiestInfo]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetManifiestInfo')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetManifiestInfo] AS RETURN')
END
GO
      
CREATE PROCEDURE [dbo].[BKO_GetManifiestInfo]  --'330-22459010',2      
 @MANIFESTNUMBER AS VARCHAR(50),      
 @COMPANYID AS INT      
AS        
BEGIN        
          
 SELECT         
  E.ID as Id, E.NUMERO AS ManifestNumber, C.[EMPRESA] as Country,         
  E.FECHA as [Date], E.DIRECCION as Address, GETDATE() AS CurrentDate        
 FROM ENM_ENCABEZADO_MANIFIESTO E   
 inner join [dbo].[EMP_EMPRESA] C on C.ID = E.CompanyId  
 WHERE E.NUMERO = @MANIFESTNUMBER      
 AND E.CompanyId = @COMPANYID      
       
        
END 
GO

 /****** Object:  StoredProcedure [dbo].[BKO_Report_Packaging_Courier]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Report_Packaging_Courier')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Report_Packaging_Courier] AS RETURN')
END
GO
       
CREATE PROCEDURE [dbo].[BKO_Report_Packaging_Courier]   
    @NUMERO VARCHAR(50),       -- Manifest number  
    @COMPANYID INT             -- Company identifier  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    DECLARE @SEAL_COUNT INT;  
  
    -- Count the number of unique seal numbers (bags) in the manifest for the given company  
    SELECT @SEAL_COUNT = COUNT(DISTINCT D.BOLSA)  
    FROM ENM_MANIFIESTO_BOLSA EB  
    INNER JOIN ENM_ENCABEZADO_MANIFIESTO E ON EB.EMN_ID = E.ID  
    INNER JOIN DEM_DETALLE_MANIFIESTO D ON E.ID = D.ENM_ID AND D.BOLSA = EB.BOLSA  
    GROUP BY E.NUMERO;  
  
    -- Retrieve Courier Packaging report data  
    SELECT DISTINCT  
        E.ID,  
  E.companyId,  
        E.NUMERO AS ManifestNumber,  
        ISNULL(EB.PAQUETES, 0) AS PackageCount,  
        ISNULL(EB.BOLSA, '') AS SealNumber,  
        CONVERT(VARCHAR(30), ISNULL(EB.LARGO, 0), 1) + 'x' +   
        CONVERT(VARCHAR, ISNULL(EB.ANCHO, 0), 0) + 'x' +   
        CONVERT(VARCHAR, ISNULL(EB.ALTO, 0), 0) AS Dimensions,  
        ISNULL(EB.PESOSISTEMA, 0) AS SystemGrossWeight,  
        ISNULL(EB.PESOREAL, 0) AS PhysicalGrossWeight,  
        ISNULL(EB.PESOVOLUMETRICOSISTEMA, 0) AS SystemVolWeight,  
        ISNULL(EB.PESOVOLUMETRICOREAL, 0) AS PhysicalVolWeight,  
        0 AS PendingPackages,  
        @SEAL_COUNT AS TotalSeals  
    FROM ENM_ENCABEZADO_MANIFIESTO E  
    INNER JOIN DEM_DETALLE_MANIFIESTO D ON E.ID = D.ENM_ID  
    LEFT JOIN ENM_MANIFIESTO_BOLSA EB ON EB.EMN_ID = E.ID AND D.BOLSA = EB.BOLSA  
     
END
GO

 /****** Object:  StoredProcedure [dbo].[BKO_Report_Packaging_Consolidated]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Report_Packaging_Consolidated')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Report_Packaging_Consolidated] AS RETURN')
END
GO

CREATE PROCEDURE [dbo].[BKO_Report_Packaging_Consolidated] --'992-14067572' ,2  
    @NUMERO VARCHAR(50),  
    @CompanyId INT  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    DECLARE @ManifestId INT  
  
    -- Get Manifest ID from manifest number and company  
    SELECT @ManifestId = ID   
    FROM ENM_ENCABEZADO_MANIFIESTO   
    WHERE NUMERO = @NUMERO AND CompanyId = @CompanyId  
  
    -- Aggregate package data by sub-guide (GUIAHIJA)  
    SELECT SubGuideNumber,    
           SUM(Weight) AS TotalWeight,   
           SUM(VolumetricWeight) AS TotalVolumetricWeight,   
           SUM(Quantity) AS TotalPackages  
    INTO #TempSubGuide  
    FROM (  
        -- From non-palleted packages  
        SELECT D.BOLSA AS SubGuideNumber,    
               SUM(P.PESO) AS Weight,   
               SUM(P.PESOVOLUMETRICO) AS VolumetricWeight,   
               COUNT(1) AS Quantity  
        FROM DEM_DETALLE_MANIFIESTO D  
        INNER JOIN PAQ_PAQUETE P ON P.NUMERO = D.NUMEROPAQUETE  
        WHERE D.ENM_ID = @ManifestId AND D.PALET = '0'  
        GROUP BY D.BOLSA  
  
        UNION  
  
        -- From palleted packages  
        SELECT GH.GUIAHIJA AS SubGuideNumber,   
               SUM(GHP.PESOREAL) AS Weight,   
               SUM(GHP.PESOVOLUMETRICOREAL) AS VolumetricWeight,   
               COUNT(GHP.PALET) AS Quantity  
        FROM GUIAHIJA GH   
        INNER JOIN GUIAHIJA_PALET GHP ON GH.ID = GHP.GUIAHIJA_ID  
        WHERE GH.GUIAMADRE_ID = @ManifestId  
        GROUP BY GH.GUIAHIJA  
    ) A  
    GROUP BY A.SubGuideNumber  
  
    -- Final consolidated report  
    SELECT   
        --@NUMERO AS ManifestNumber,  
        GH.GUIAHIJA AS SubGuideNumber,  
        '4634 NW 74 AVE' + CHAR(10) + 'MIAMI FL 33166' + CHAR(10) + 'PH: 305-597-8377' AS CarrierAddress,  
        GM.SHIPPER AS Shipper,  
        CASE C.FACTURAR_COMPANNIA   
            WHEN 0 THEN C.NOMBRECOMPLETO  
            ELSE C.COMPANNIA  
        END + CHAR(10) +  
        UPPER(GH.TIPO_IDENTIFICACION) + ': ' + C.NUMERODOCUMENTO + CHAR(10) +  
        'ADDRESS: ' + C.DIRECCION AS ConsigneeInfo,  
        T.TotalWeight,  
        T.TotalVolumetricWeight,  
        T.TotalPackages,  
        GM.AIRPORTDEPARTURE AS DepartureAirport,  
        GM.AIRPORTDESTINATION AS DestinationAirport  
    FROM GUIAMADRE GM   
    INNER JOIN GUIAHIJA GH ON GM.EMN_ID = GH.GUIAMADRE_ID  
    INNER JOIN #TempSubGuide T ON GH.GUIAHIJA = T.SubGuideNumber  
    INNER JOIN CLI_CLIENTE C ON C.CODIGO = GH.CONSIGNEE  
    WHERE GM.EMN_ID = @ManifestId  
  
 drop table #TempSubGuide  
END  
GO

 /****** Object:  StoredProcedure [dbo].[BKO_UpdateRoadMapStatus]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_UpdateRoadMapStatus')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_UpdateRoadMapStatus] AS RETURN')
END
GO

CREATE PROCEDURE [dbo].[BKO_UpdateRoadMapStatus]  
 @HOJARUTA_ID AS INT  
AS  
BEGIN  
   
 UPDATE HOJA_RUTA_ENCABEZADO  
 SET ESTADO = 0  
 WHERE ID = @HOJARUTA_ID   
   
END
GO

 /****** Object:  StoredProcedure [dbo].[BKO_GetRouteSheet]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetRouteSheet')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetRouteSheet] AS RETURN')
END
GO

CREATE PROCEDURE [dbo].[BKO_GetRouteSheet]  
    @HOJARUTA_ID INT = NULL,  
    @ESTADO INT = NULL,  
    @COMPANY_ID VARCHAR(6),  
    @PageIndex INT = 1,  
    @PageSize INT = 10,  
    @Filter NVARCHAR(100) = NULL  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    DECLARE @Offset INT = (@PageIndex - 1) * @PageSize;  
  
    SELECT DISTINCT   
        E.ID AS RouteSheetID,   
        E.DESCRIPCION AS Description,   
        E.USUARIO AS UserID,   
        E.FECHACREACION AS CreationDate,   
        E.FECHACIERRE AS CloseDate,   
        CASE E.ESTADO   
            WHEN 0 THEN 'Abierta'  
            WHEN 1 THEN 'En Ruta'  
            ELSE 'Cerrada'  
        END AS Status,   
        ISNULL(Z.NOMBRE, '') AS Zone,   
        (  
            SELECT STRING_AGG(NOMBRE, ',')  
            FROM ARE_AREA   
            WHERE ZON_ID = E.ZONA_ID   
              AND ID IN (  
                  SELECT AREA_ID   
                  FROM HOJA_RUTA_AREA   
                  WHERE HOJARUTA_ID = E.ID   
                    AND ZONA_ID = E.ZONA_ID  
              )  
        ) AS Areas,   
        te.DESCRIPCION AS DeliveryType,   
        fc.NOMBRE AS Branch   
    FROM HOJA_RUTA_ENCABEZADO E  
    LEFT JOIN ZON_ZONA Z ON E.ZONA_ID = Z.ID  
    LEFT JOIN ARE_AREA A ON Z.ID = A.ZON_ID  
    LEFT JOIN TIPOENTREGA te ON te.ID_TIPOENTREGA = E.ID_TIPOENTREGA  
    LEFT JOIN FC_CAJA fc ON fc.CAJA_ID = E.ID_CAJA  
    WHERE   
        (@HOJARUTA_ID IS NULL OR E.ID = @HOJARUTA_ID)  
        AND (  
            @ESTADO IS NULL   
            OR (@ESTADO = 3 AND E.ESTADO <> 0)  
            OR (@ESTADO <> 3 AND E.ESTADO = @ESTADO)  
        )  
        AND E.COMPANY_ID = @COMPANY_ID  
        AND (  
            @Filter IS NULL OR   
            E.DESCRIPCION LIKE '%' + @Filter + '%' OR   
            E.USUARIO LIKE '%' + @Filter + '%' OR  
            Z.NOMBRE LIKE '%' + @Filter + '%' OR  
            (CASE E.ESTADO   
                WHEN 0 THEN 'Abierta'  
                WHEN 1 THEN 'En Ruta'  
                ELSE 'Cerrada'  
             END) LIKE '%' + @Filter + '%'  
        )  
    ORDER BY CreationDate DESC  
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;  
  
    SELECT COUNT(DISTINCT E.ID) AS TotalRows  
 FROM HOJA_RUTA_ENCABEZADO E  
 LEFT JOIN ZON_ZONA Z ON E.ZONA_ID = Z.ID  
 WHERE   
  (@HOJARUTA_ID IS NULL OR E.ID = @HOJARUTA_ID)  
  AND (  
   @ESTADO IS NULL   
   OR (@ESTADO = 3 AND E.ESTADO <> 0)  
   OR (@ESTADO <> 3 AND E.ESTADO = @ESTADO)  
  )  
  AND E.COMPANY_ID = @COMPANY_ID  
  AND (  
   @Filter IS NULL OR   
   E.DESCRIPCION LIKE '%' + @Filter + '%' OR   
   E.USUARIO LIKE '%' + @Filter + '%' OR  
   Z.NOMBRE LIKE '%' + @Filter + '%' OR  
   (CASE E.ESTADO   
    WHEN 0 THEN 'Abierta'  
    WHEN 1 THEN 'En Ruta'  
    ELSE 'Cerrada'  
    END) LIKE '%' + @Filter + '%'  
  );  
END
GO

 /****** Object:  StoredProcedure [dbo].[BKO_GetPackageByInvoiceStatus]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetPackageByInvoiceStatus')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetPackageByInvoiceStatus] AS RETURN')
END
GO

    
CREATE PROCEDURE [dbo].[BKO_GetPackageByInvoiceStatus]      
    @SearchBy NVARCHAR(50),    
    @CompanyId INT    
AS    
BEGIN    
    SET NOCOUNT ON;   
   
  
 IF(@SearchBy = '')  
 BEGIN  
  
   SELECT TOP 100  
            p.[NUMERO] AS 'PackageNumber',      
            p.[CLIENTE] AS 'CustomerAccount',     
            c.NOMBRECOMPLETO AS 'CustomerName',      
            p.[DESCRIPCION] AS 'Description',      
            p.[PESO] AS 'Weight',      
            p.[PRECIO] AS 'Price',      
            p.[TRAEFACTURA] AS 'HasInvoice',      
            p.[FECHACREO] AS 'CreationDate',      
            p.[SEGURO] AS 'Insurance',      
            p.[ID]    
        FROM PAQ_PAQUETE p WITH (NOLOCK)    
        INNER JOIN CLI_CLIENTE c ON p.CLIENTE = c.CODIGO     
        WHERE p.CompanyId = @CompanyId    
    AND P.NUMERO is not NULL AND P.NUMERO > 0    
  AND P.CLIENTE is not NULL AND P.CLIENTE != ''   
  
 END  
 ELSE  
 BEGIN  
  
 IF(ISNUMERIC(@SearchBy) = 1)  
 BEGIN  
  
   SELECT     
            p.[NUMERO] AS 'PackageNumber',      
            p.[CLIENTE] AS 'CustomerAccount',     
            c.NOMBRECOMPLETO AS 'CustomerName',      
            p.[DESCRIPCION] AS 'Description',      
            p.[PESO] AS 'Weight',      
            p.[PRECIO] AS 'Price',      
            p.[TRAEFACTURA] AS 'HasInvoice',      
            p.[FECHACREO] AS 'CreationDate',      
            p.[SEGURO] AS 'Insurance',      
            p.[ID]    
        FROM PAQ_PAQUETE p WITH (NOLOCK)    
        INNER JOIN CLI_CLIENTE c ON p.CLIENTE = c.CODIGO     
        WHERE p.NUMERO = CAST(@SearchBy as INT)  
          AND p.CompanyId = @CompanyId    
    AND P.NUMERO is not NULL AND P.NUMERO > 0    
  AND P.CLIENTE is not NULL AND P.CLIENTE != ''   
     
   UNION ALL  
  
    SELECT     
            p.[NUMERO] AS 'PackageNumber',      
            p.[CLIENTE] AS 'CustomerAccount',     
            c.NOMBRECOMPLETO AS 'CustomerName',      
            p.[DESCRIPCION] AS 'Description',      
            p.[PESO] AS 'Weight',      
            p.[PRECIO] AS 'Price',      
            p.[TRAEFACTURA] AS 'HasInvoice',      
            p.[FECHACREO] AS 'CreationDate',      
            p.[SEGURO] AS 'Insurance',      
            p.[ID]    
        FROM PAQ_PAQUETE p WITH (NOLOCK)    
        INNER JOIN CLI_CLIENTE c ON p.CLIENTE = c.CODIGO     
        WHERE p.CLIENTE = @SearchBy    
          AND p.CompanyId = @CompanyId    
    AND P.NUMERO is not NULL AND P.NUMERO > 0    
  AND P.CLIENTE is not NULL AND P.CLIENTE != ''   
  
 END  
 ELSE  
 BEGIN  
  
   SELECT     
            p.[NUMERO] AS 'PackageNumber',      
            p.[CLIENTE] AS 'CustomerAccount',     
            c.NOMBRECOMPLETO AS 'CustomerName',      
            p.[DESCRIPCION] AS 'Description',      
            p.[PESO] AS 'Weight',      
            p.[PRECIO] AS 'Price',      
            p.[TRAEFACTURA] AS 'HasInvoice',      
            p.[FECHACREO] AS 'CreationDate',      
            p.[SEGURO] AS 'Insurance',      
            p.[ID]    
        FROM PAQ_PAQUETE p WITH (NOLOCK)    
        INNER JOIN CLI_CLIENTE c ON p.CLIENTE = c.CODIGO     
        WHERE p.CLIENTE = @SearchBy    
          AND p.CompanyId = @CompanyId    
    AND P.NUMERO is not NULL AND P.NUMERO > 0    
  AND P.CLIENTE is not NULL AND P.CLIENTE != ''   
  
 END  
        
  
    END  
END 
GO

 /****** Object:  StoredProcedure [dbo].[BKO_UpdatePackageInvoiceStatus]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_UpdatePackageInvoiceStatus')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_UpdatePackageInvoiceStatus] AS RETURN')
END
GO

CREATE PROCEDURE [dbo].[BKO_UpdatePackageInvoiceStatus]   
    @PackageId INT,  
    @HasInvoice INT,  
    @CompanyId INT  
AS  
BEGIN  
    
  
  
    UPDATE PAQ_PAQUETE  
    SET TRAEFACTURA = @HasInvoice   
    WHERE ID = @PackageId AND CompanyId = @CompanyId;  
END  
GO

 /****** Object:  StoredProcedure [dbo].[BKO_UpdatePackageCommodityAndPrice]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_UpdatePackageCommodityAndPrice')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_UpdatePackageCommodityAndPrice] AS RETURN')
END
GO

Create PROCEDURE [dbo].[BKO_UpdatePackageCommodityAndPrice]  
    @PackageNumber INT,  
    @ModifiedBy VARCHAR(50),  
    @Price MONEY,  
    @CommodityId INT  
AS  
BEGIN  
    UPDATE PAQ_PAQUETE   
    SET   
        PRECIO = @Price,   
        ID_COMODITY = @CommodityId,   
        MODIFICO = @ModifiedBy  
    WHERE NUMERO = @PackageNumber  
END  
GO


/****** Object:  StoredProcedure [dbo].[BKO_GetPendingBillingPackages]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetPendingBillingPackages')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetPendingBillingPackages] AS RETURN')
END
GO

  
CREATE PROCEDURE [dbo].[BKO_GetPendingBillingPackages]   
    @CompanyId INT  
AS  
BEGIN  
    SELECT   
        0 AS Filter,  
        PAQ.Id AS PackageId,  
        PAQ.Numero AS PackageNumber,  
        PAQ.Cliente AS CustomerCode,  
        PAQ.Courier AS CourierId,  
        PAQ.NombreCourier AS CourierName,  
        PAQ.Procedencia AS Origin,  
        PAQ.Observaciones AS Observations,  
        PAQ.Seguro AS Insurance,  
        PAQ.Pais AS Country,  
        PAQ.FechaCreo AS CreatedDate,  
        PAQ.FechaModifico AS ModifiedDate,  
        PAQ.Creo AS CreatedBy,  
        PAQ.Modifico AS ModifiedBy,  
        PAQ.Paquetes AS PackageCount,  
        PAQ.Est_Id AS StatusId,  
        PAQ.Descripcion AS Description,  
        PAQ.Peso AS Weight,  
        PAQ.Precio AS Price,  
        PAQ.Ancho AS Width,  
        PAQ.Alto AS Height,  
        PAQ.Largo AS Length,  
        PAQ.PesoVolumetrico AS VolumetricWeight,  
        PAQ.Recibidopor AS ReceivedBy,  
        PAQ.Des_Id AS DestinationId,  
        PAQ.TIPOPAQUETE AS PackageType,  
        PAQ.COD AS COD,  
        PAQ.FACTURADO AS IsBilled,  
        PAQ.PALETS AS Pallets,  
        PAQ.BOLSA AS Bag,  
        PAQ.TOTALKILOS AS TotalWeightKgs,  
        PAQ.TIPO AS Type,  
        PAQ.TOTALETIQUETA AS TotalLabels,  
        PAQ.DETALLEEMPAQUE AS PackageDetails,  
        PAQ.BUSCOCLIENTE AS SearchedCustomer,  
        PAQ.ID_COMODITY AS CommodityId,  
        PAQ.Resources AS Resources,  
        C.NOMBRECOMPLETO AS CustomerFullName,  
        C.DIRECCION AS CustomerAddress,  
        C.EMAIL_CLIENTE AS CustomerEmail,  
        E.NUMERO AS ManifestNumber  
    FROM PAQ_PAQUETE PAQ   
    INNER JOIN CLI_CLIENTE C ON PAQ.Cliente = C.CODIGO  
    LEFT JOIN DEM_DETALLE_MANIFIESTO D ON D.PAQ_ID = PAQ.Id  
    LEFT JOIN ENM_ENCABEZADO_MANIFIESTO E ON D.ENM_ID = E.Id  
    WHERE  
        PAQ.CompanyId = @CompanyId  
        AND PAQ.ESTADOFACTURA != 2 -- Not yet billed  
          
    ORDER BY PAQ.Numero  
END  
GO

/****** Object:  StoredProcedure [dbo].[BKO_GetCommodities]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetCommodities')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetCommodities] AS RETURN')
END
GO

  
CREATE PROCEDURE [dbo].[BKO_GetCommodities]  
    @inCompanyId INT  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    SELECT   
        FC.ID AS Id,  
        FC.CODE AS Code,  
        FC.DESCRIPTION AS Description,  
        FC.Status AS Status  
    FROM   
        FC_COMODITYS FC  
    WHERE   
        (@inCompanyId = 0 OR FC.[CompanyId] = @inCompanyId)  
        AND FC.[Status] = 2 -- 2 means ACTIVE  
    ORDER BY   
        FC.DESCRIPTION;  
END;  
GO

/****** Object:  StoredProcedure [dbo].[BKO_GetUrlAttachmentByCompanyId]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetUrlAttachmentByCompanyId')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetUrlAttachmentByCompanyId] AS RETURN')
END
GO

CREATE PROCEDURE [dbo].[BKO_GetUrlAttachmentByCompanyId]  
    @CompanyId INT  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    SELECT   
        e.ID AS CompanyId,  
        e.AttachmentUrl  
    FROM   
        EMP_EMPRESA e  
    WHERE   
        e.ID = @CompanyId;  
END;
GO


/****** Object:  StoredProcedure [dbo].[BKO_GetCustomsTax_ByPackageNumber]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetCustomsTax_ByPackageNumber')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetCustomsTax_ByPackageNumber] AS RETURN')
END
GO

  
CREATE PROCEDURE [dbo].[BKO_GetCustomsTax_ByPackageNumber]  
    @PackageNumber VARCHAR(50)  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    SELECT   
        Id,  
        LoadType,  
        PackageNumber,  
        Origin,  
        WeightKg,  
        Description,  
        Amount,  
        CIF,  
        DUA,  
        FOB,  
        AWB,  
        CompanyId,  
        CreatedBy,  
        CreatedDate  
    FROM CustomsTaxLoad  
    WHERE LoadType = 'PACKAGE'  
      AND PackageNumber = @PackageNumber;  
END  
GO

/****** Object:  StoredProcedure [dbo].[BKO_GetCustomsTax_ByBag]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetCustomsTax_ByBag')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetCustomsTax_ByBag] AS RETURN')
END
GO

  
CREATE   PROCEDURE [dbo].[BKO_GetCustomsTax_ByBag]  
     @Bag VARCHAR(50)  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    SELECT   
        Id,  
        LoadType,  
        PackageNumber,  
        Origin,  
        WeightKg,  
        Description,  
        Amount,  
        CIF,  
        DUA,  
        FOB,  
        AWB,  
        CompanyId,  
        CreatedBy,  
        CreatedDate  
    FROM CustomsTaxLoad  
    WHERE LoadType = 'BAG'  
      AND AWB = @Bag;  
END
GO

/****** Object:  StoredProcedure [dbo].[BKO_InsertCustomsTaxLoad]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_InsertCustomsTaxLoad')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_InsertCustomsTaxLoad] AS RETURN')
END
GO
  
CREATE PROCEDURE [dbo].[BKO_InsertCustomsTaxLoad]  
   @CustomsTaxTable dbo.CustomsTaxLoadType READONLY  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    INSERT INTO dbo.CustomsTaxLoad (  
        LoadType, PackageNumber, Origin, WeightKg, Description,  
        Amount, CIF, DUA, FOB, AWB, CompanyId, CreatedBy, CreatedDate  
    )  
    SELECT   
        LoadType, PackageNumber, Origin, WeightKg, Description,  
        Amount, CIF, DUA, FOB, AWB, CompanyId, CreatedBy, CreatedDate  
    FROM @CustomsTaxTable;  
  
    -- Optionally update the DUA field in PAQ_PAQUETE for PACKAGE entries  
    UPDATE P  
    SET P.DUA = CT.DUA  
    FROM PAQ_PAQUETE P  
    INNER JOIN @CustomsTaxTable CT ON P.NUMERO = CT.PackageNumber  
    WHERE CT.LoadType = 'PACKAGE';  
  
    SET NOCOUNT OFF;  
END;

GO

/****** Object:  StoredProcedure [dbo].[BKO_InsertCustomsTaxLoad]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_InsertCustomsTaxLoad')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_InsertCustomsTaxLoad] AS RETURN')
END
GO

  
CREATE   PROCEDURE [dbo].[BKO_GetCustomsTax_ByBag]  
     @Bag VARCHAR(50)  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    SELECT   
        Id,  
        LoadType,  
        PackageNumber,  
        Origin,  
        WeightKg,  
        Description,  
        Amount,  
        CIF,  
        DUA,  
        FOB,  
        AWB,  
        CompanyId,  
        CreatedBy,  
        CreatedDate  
    FROM CustomsTaxLoad  
    WHERE LoadType = 'BAG'  
      AND AWB = @Bag;  
END  
GO



/****** Object:  StoredProcedure [dbo].[BKO_Report_MassUpload_Aeropost]  Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Report_MassUpload_Aeropost')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Report_MassUpload_Aeropost] AS RETURN')
END
GO
 
CREATE PROCEDURE [dbo].[BKO_Report_MassUpload_Aeropost]   
    @PROVIDER_ID INT,  
    @COMPANY_ID INT,  
    @StartDate DATE,  
    @EndDate DATE  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    SELECT  
        ap.FACTURA_PROVEEDOR AS Invoice,  
        p.NOMBRE AS ProviderName,  
        RIGHT(ca.DET_ASIENTO, 15) AS GLDetail,  
        CONVERT(DATE, GETDATE()) AS ReportDate,  
        ap.MONEDA_ORIGINAL AS Currency,  
        ap.MONTO_SUBTOTAL AS Subtotal,  
        ap.MONTO_IVA AS VAT,  
        ap.MONTO_EXENTO AS Exempt,  
        ap.MONTO_GRAVADO AS Taxable,  
        ap.CONTRIBUCION_PARAFISCAL AS Parafiscal,  
        ap.MONTO_TOTAL AS Total  
    FROM CN_ASIENTO_PROVEEDOR ap WITH (NOLOCK)  
    INNER JOIN CXP_PROVEEDOR p WITH (NOLOCK)  
        ON ap.COD_PROVEEDOR = p.COD_PROVEEDOR  
        AND ap.ID_EMPRESA = p.ID_EMPRESA  
    INNER JOIN CN_ASIENTO ca WITH (NOLOCK)  
        ON ca.COD_ASIENTO = ap.COD_ASIENTO  
        AND ca.ID_EMPRESA = ap.ID_EMPRESA  
    WHERE  
        ap.COD_PROVEEDOR = @PROVIDER_ID  
        AND ap.ID_EMPRESA = @COMPANY_ID  
        AND ap.FACTURA_PROVEEDOR LIKE '%SJO%'  
       AND ca.FEC_ASIENTO BETWEEN @StartDate AND @EndDate  
    GROUP BY  
        ap.FACTURA_PROVEEDOR,  
        p.NOMBRE,  
        RIGHT(ca.DET_ASIENTO, 15),  
        ap.MONEDA_ORIGINAL,  
        ap.MONTO_SUBTOTAL,  
        ap.MONTO_IVA,  
        ap.MONTO_EXENTO,  
        ap.MONTO_GRAVADO,  
        ap.CONTRIBUCION_PARAFISCAL,  
        ap.MONTO_TOTAL  
    HAVING COUNT(1) > 1  
END  





