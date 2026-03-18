
-- Adding Permission for Invoice History

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'INV_INVOICE_HISTORY', 'Invoice', 'Invoice History'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='INV_INVOICE_HISTORY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'INV_INVOICE_HISTORY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

-- Adding Permission for Repost Generation

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'INV_REPORT_GENERATION', 'Invoice', 'Repost Generation'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='INV_REPORT_GENERATION'
);
GO



INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'INV_REPORT_GENERATION'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO



IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_POS_GetPaymentDetail')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_POS_GetPaymentDetail] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_POS_GetPaymentDetail]  
    @PaymentID INT = NULL,  
    @InvoiceNumber INT = NULL  
AS  
BEGIN  
    SET NOCOUNT ON;

    DECLARE @CompanyId INT;
    DECLARE @Clave VARCHAR(50);

    -- Resolve InvoiceNumber and CompanyId from PaymentID if InvoiceNumber is not provided
    IF @InvoiceNumber IS NULL AND @PaymentID IS NOT NULL
    BEGIN
        SELECT TOP 1 
            @CompanyId = P.ID_EMPRESA,
            @InvoiceNumber = PF.N_FACTURA
        FROM FC_PAGO P
        JOIN FC_PAGOFACTURAS PF ON PF.IDPAGO = P.ID
        WHERE P.ID = @PaymentID;
    END

    -- Resolve CompanyId if still not set
    IF @CompanyId IS NULL
    BEGIN
        SELECT TOP 1 @CompanyId = C.CompanyId  
        FROM FC_FACTURA F  
        INNER JOIN CLI_CLIENTE C ON F.CLIENTE = C.CODIGO  
        WHERE F.N_FACTURA = @InvoiceNumber;
    END

    -- Get Clave
    SELECT TOP 1 @Clave = Clave 
    FROM FC_FACTURA_ELECTRONICA 
    WHERE N_FACTURA = @InvoiceNumber 
      AND NumeroConsecutivoTipoComprobante IN ('01','04')  
      AND Respuesta = 'OK-aceptado';  

    -- Main Invoice Info
    SELECT  
      CAST(F.N_FACTURA AS VARCHAR(10)) AS InvoiceNumber,  
      F.USUARIO AS [User],  
      F.CAJA_ID AS CashRegisterID,  
      F.CLIENTE AS Client,  
      F.FECHA AS Date,  
      F.MONTOGRAVADO AS TaxableAmount,
      F.MONTOEXENTO AS ExemptAmount,  
      CONVERT(DECIMAL(18,2), F.IMPUESTOADUANAS) AS CustomsTax,  
      F.IMPUESTOVENTAS AS SalesTax,  
      F.SUBTOTAL AS Subtotal,  
      F.DESCUENTO AS Discount,  
      CONVERT(DECIMAL(18,2), F.TOTAL) AS Total,  
      CONVERT(DECIMAL(18,2), F.TOTALLOCAL) AS TotalLocal,  
      F.SALDO AS Balance,  
      F.SALDOLOCAL AS LocalBalance,  
      CONVERT(DECIMAL(18,2), F.PAGADO) AS PaidAmount,  
      F.CAMBIO AS Change,  
      F.ESTADO AS Status,
      CASE FACTURAR_COMPANNIA  
        WHEN 0 THEN C.NOMBRECOMPLETO  
        WHEN 1 THEN C.COMPANNIA  
        ELSE C.NOMBRECOMPLETO  
      END AS FullName,  
      TC.TIPO_CAMBIO_COMPRA AS ExchangeRatePurchase,  
      TC.TIPO_CAMBIO_VENTA AS ExchangeRateSale,  
      F.Nota AS Note,  
      CASE WHEN F.ESTADO = 2 THEN 'INVOICE' ELSE 'PROFORMA' END AS Type,  
      @Clave AS [Key],  

	-- Payment Type
	STUFF((
		SELECT DISTINCT ', ' + TP.DESCRIPCION  
		FROM FC_PAGO P
		JOIN FC_TIPOPAGO TP ON TP.ID = P.FORMAPAGO_ID
		WHERE P.ID = @PaymentID
		  AND TP.DESCRIPCION IS NOT NULL
		FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS PaymentType,


	-- Sub Payment Type
	STUFF((
		SELECT DISTINCT ', ' + TDP.DESCRIPCION  
		FROM FC_PAGO P
		JOIN FC_TIPODOCUMENTOPAGO TDP ON TDP.ID = P.FORMAPAGO_ID
		WHERE P.ID = @PaymentID
		  AND TDP.DESCRIPCION IS NOT NULL
		FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS SubPaymentType


    FROM FC_FACTURA F  
    JOIN CLI_CLIENTE C ON F.CLIENTE = C.CODIGO  
    LEFT JOIN CN_TIPO_CAMBIO_HISTORIAL TC 
      ON CONVERT(DATE, F.FECHA) = CONVERT(DATE, TC.FECHA_HISTORIAL)  
    WHERE F.N_FACTURA = @InvoiceNumber  
      AND EXISTS (  
        SELECT 1  
        FROM FC_PAGOFACTURAS PF  
        JOIN FC_PAGO P ON PF.IDPAGO = P.ID  
        LEFT JOIN FC_TIPOPAGO TP ON TP.ID = P.FORMAPAGO_ID  
        LEFT JOIN FC_TIPODOCUMENTOPAGO SPT ON SPT.ID = P.FORMAPAGO_ID  
        WHERE PF.N_FACTURA = F.N_FACTURA  
          AND (TP.DESCRIPCION IS NOT NULL OR SPT.DESCRIPCION IS NOT NULL)  
      );

    -- Invoice Details
    SELECT   
      FD.N_FACTURA AS InvoiceNumber,  
      FD.PRODUCTO_ID AS ProductID,  
      P.DESCRIPCION AS Description,  
      FD.CANTIDAD AS Quantity,  
      CONVERT(DECIMAL(18,2), FD.PRECIO) AS Price,  
      CONVERT(DECIMAL(18,2), FD.IMPUESTOADUANAS) AS CustomsTax,  
      FD.IMPUESTOVENTAS AS SalesTax,  
      FD.MONTOGRAVADO AS TaxableAmount,  
      FD.MONTOEXENTO AS ExemptAmount,  
      CONVERT(DECIMAL(18,2), FD.SUBTOTAL) AS Subtotal,  
      FD.DESCUENTO AS Discount,  
      CONVERT(DECIMAL(18,2), FD.TOTAL) AS Total,  
      P.EXENTO AS Exempt,  
      P.IMPUESTOADUANA AS IsCustomsTax,  
      CASE   
        WHEN P.EXENTO = 1 AND P.IMPUESTOADUANA = 0 THEN 'OtherCharges'  
        WHEN P.EXENTO = 1 AND P.IMPUESTOADUANA = 1 THEN 'CustomsTax'  
        ELSE 'Services'  
      END AS ProductType  
    FROM FC_FACTURADETALLE FD  
    INNER JOIN FC_PRODUCTOS P ON FD.PRODUCTO_ID = P.ID  
    WHERE FD.N_FACTURA = @InvoiceNumber;

    -- Company Info
    SELECT  
      [ID] AS CompanyId,  
      [CODIGO] AS Code,  
      [EMPRESA] AS Name,  
      [DIRECCION] AS Address,  
      [PHONE] AS Phone,  
      [EMAIL] AS Email,  
      [COD_MONEDA] AS CurrencyId,  
      [PAI_ID] AS CountryId  
    FROM [dbo].[EMP_EMPRESA]  
    WHERE [ID] = @CompanyId;

    -- Package Info
    SELECT   
      FP.N_FACTURA AS Invoice,  
      FP.NUMERO AS Number,  
      P.COURIER AS Courier,  
      CONVERT(DECIMAL(18,0), P.PESO) AS Weight,  
      CONVERT(DECIMAL(18,0), P.PESOVOLUMETRICO) AS VolumetricWeight,  
      P.PROCEDENCIA AS Origin  
    FROM FC_FACTURAPAQUETES FP  
    INNER JOIN PAQ_PAQUETE P ON FP.NUMERO = P.NUMERO  
    WHERE FP.N_FACTURA = @InvoiceNumber;

    -- Outstanding Balance
    SELECT   
      ISNULL(SUM(F.SALDO), 0) AS Balance  
    FROM FC_FACTURA F   
    WHERE F.CLIENTE = (SELECT CLIENTE FROM FC_FACTURA WHERE N_FACTURA = @InvoiceNumber)  
      AND F.ESTADO IN (0, 3); -- Pending Payment, Credit Pending

END
