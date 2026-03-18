--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Purchases ----------------------------------
--------------------------------------------------------------------------

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_PURCHASES', 'Reports', 'Purchases'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_PURCHASES'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_PURCHASES'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Customs Taxes----------------------------------
--------------------------------------------------------------------------

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_CUSTOMS_TAXES', 'Reports', 'Customs Taxes'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_CUSTOMS_TAXES'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_CUSTOMS_TAXES'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO




/****** Object:  StoredProcedure [dbo].[BKO_Report_Purchases]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Report_Purchases')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Report_Purchases] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_Report_Purchases]  
    @StartDate DATETIME,  
    @EndDate DATETIME,  
    @CompanyId INT  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
    SELECT    
        a.COD_ASIENTO AS EntryCode,  
        ap.COD_PROVEEDOR AS SupplierCode,  
        p.NOMBRE AS SupplierName,  
        app.OBSERVACION AS PaymentNote,  
        a.DET_ASIENTO AS EntryDetail,  
        a.FEC_ASIENTO AS EntryDate,  
        app.FEC_PAGO AS PaymentDate,  
        app.REFERENCIA AS Reference,  
        app.OBSERVACION AS Description,  
  
        -- Currency adjusted values  
        CASE   
            WHEN MONEDA_ORIGINAL = 'Dolar' THEN MONTO_SUBTOTAL * MON_TIPO_CAMBIO   
            ELSE MONTO_SUBTOTAL   
        END AS SubtotalAmount,  
  
        CASE   
            WHEN MONEDA_ORIGINAL = 'Dolar' THEN MONTO_EXENTO * MON_TIPO_CAMBIO   
            ELSE MONTO_EXENTO   
        END AS ExemptAmount,  
  
        CASE   
            WHEN MONEDA_ORIGINAL = 'Dolar' THEN MONTO_GRAVADO * MON_TIPO_CAMBIO   
            ELSE MONTO_GRAVADO   
        END AS TaxedAmount,  
  
        CASE   
            WHEN MONEDA_ORIGINAL = 'Dolar' THEN MONTO_TOTAL * MON_TIPO_CAMBIO   
            ELSE MONTO_TOTAL   
        END AS TotalAmount,  
  
        CASE   
            WHEN MONEDA_ORIGINAL = 'Dolar' THEN CONTRIBUCION_PARAFISCAL * MON_TIPO_CAMBIO   
            ELSE CONTRIBUCION_PARAFISCAL   
        END AS ParaFiscalContribution,  
  
        ap.PORCENTAJE_IVA AS VATPercentage,  
        CONVERT(VARCHAR(50), @StartDate, 103) AS ReportStartDate,  
        CONVERT(VARCHAR(50), @EndDate, 103) AS ReportEndDate  
  
    FROM CN_ASIENTO_PROVEEDOR ap WITH (NOLOCK)  
    LEFT JOIN CN_ASIENTO_PROVEEDOR_PAGO app  
        ON ap.COD_ASIENTO = app.COD_ASIENTO_FACTURA  
        AND ap.ID_EMPRESA = app.ID_EMPRESA  
    INNER JOIN CN_ASIENTO a WITH (NOLOCK)  
        ON ap.COD_ASIENTO = a.COD_ASIENTO  
        AND a.IND_ESTADO = 'Apli'  
    INNER JOIN CXP_PROVEEDOR p WITH (NOLOCK)  
        ON ap.COD_PROVEEDOR = p.COD_PROVEEDOR  
    WHERE   
        a.FEC_ASIENTO >= @StartDate   
        AND a.FEC_ASIENTO < @EndDate  
        AND ap.ES_GASTO = 0  
        AND ap.CLASIFICACION_D151 = 'Compras'  
        AND ap.ID_EMPRESA = @CompanyId  
END 
GO



/****** Object:  StoredProcedure [dbo].[BKO_REPORTE_CUSTOMS_TAXES]   Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_REPORTE_CUSTOMS_TAXES')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_REPORTE_CUSTOMS_TAXES] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_REPORTE_CUSTOMS_TAXES] --'CR61644','2015-01-01','2025-01-01','KOSLLIOPEV10264',''  
    @CustomerCode VARCHAR(50),  
    @FromDate VARCHAR(50),  
    @ToDate VARCHAR(50),  
    @ManifestNumber VARCHAR(50) = NULL,  
    @Bag VARCHAR(50) = NULL  
AS  
BEGIN  
    SET NOCOUNT ON;  
  
 SELECT * into #pkgCustomsTaxLoad from CustomsTaxLoad where (loadtype='Package' or loadtype='PACKAGE') and CRTRACK is not NULL  
 SELECT * into #bagCustomsTaxLoad from CustomsTaxLoad where (loadtype='Bag' or loadtype='BAG') and CRTRACK is not NULL  
  
    Select    
     p.NUMERO AS Package,  
        c.NOMBRECOMPLETO AS CustomerName,  
        ISNULL(p.PROCEDENCIA, '') AS Origin,  
        p.PESO AS [Weight KG],  
        p.DESCRIPCION AS [Package Description],  
        ctl.FOB,  
        ctl.CIF,  
        ctl.DUA,  
        ctl.Amount,  
        dm.BOLSA AS AWB,  
  dm.NUMERO  
    FROM   
        #pkgCustomsTaxLoad as ctl  
  INNER JOIN PAQ_Paquete p ON cast(ctl.CRTRACK as int) = p.NUMERO  
  INNER JOIN CLI_Cliente c ON p.CLIENTE = c.CODIGO  
  LEFT JOIN DEM_DETALLE_MANIFIESTO dm ON p.ID = dm.PAQ_ID  
    WHERE   
        c.CODIGO = @CustomerCode  
        AND p.FECHACREO BETWEEN @FromDate AND @ToDate  
  AND (dm.numero = @ManifestNumber or @ManifestNumber = '')  
  
  UNION ALL  
  
 Select    
     p.NUMERO AS Package,  
        c.NOMBRECOMPLETO AS CustomerName,  
        ISNULL(p.PROCEDENCIA, '') AS Origin,  
        p.PESO AS [Weight KG],  
        p.DESCRIPCION AS [Package Description],  
        ctl.FOB,  
        ctl.CIF,  
        ctl.DUA,  
        ctl.Amount,  
        dm.BOLSA AS AWB,  
        dm.NUMERO  
    FROM   
        #bagCustomsTaxLoad as ctl  
  INNER JOIN DEM_DETALLE_MANIFIESTO dm ON ctl.CRTRACK = dm.BOLSA  
        INNER JOIN PAQ_Paquete p ON dm.PAQ_ID = p.NUMERO  
  INNER JOIN CLI_Cliente c ON p.CLIENTE = c.CODIGO  
    WHERE   
        c.CODIGO = @CustomerCode  
        AND p.FECHACREO BETWEEN @FromDate AND @ToDate  
  AND (dm.bolsa = @Bag or @Bag = '')  
  AND (dm.numero = @ManifestNumber or @ManifestNumber = '')  
    ORDER BY   
        p.NUMERO;  
  
  drop table #pkgCustomsTaxLoad;  
  drop table #bagCustomsTaxLoad;  
  
END  