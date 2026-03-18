INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'PAY_POINT_OF_SALE', 'Payment', 'Point Of Sale'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='PAY_POINT_OF_SALE'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'PAY_POINT_OF_SALE'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetPaymentType')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetPaymentType] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_GetPaymentType]
    @CompanyId INT
AS
BEGIN
    SET NOCOUNT ON;
	SELECT 
	ID as PaymentId,
	DESCRIPCION as Description,
	IDEMPRESA as CompanyId,
	Status,
	CreatedAt,
	CreatedBy,
	ModifiedAt,
	ModifiedBy
	FROM FC_TIPOPAGO 
	WHERE IDEMPRESA = @CompanyId
END

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetSubPaymentTypeByPaymentId')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetSubPaymentTypeByPaymentId] AS RETURN')
END

GO
ALTER PROCEDURE [dbo].[BKO_GetSubPaymentTypeByPaymentId]
    @CompanyId INT,
    @PaymentId INT,
    @PointOfSaleId INT
AS
BEGIN
    SELECT 
        SPT.IDEMPRESA AS CompanyId,
        SPT.ID AS SubPaymentId,
        SPT.ID_TIPOPAGO AS PaymentId,
        SPT.DESCRIPCION AS Description,
        SPT.IMPUESTOVENTAS AS SalesTex,
        SPT.COMISIONBANCARIA AS BankCommission,
        SPT.COD_MONEDA AS CurrencyCode,
        SPT.COD_PLANTILLA AS TemplateCode,
        SPT.COD_MODULO AS ModuleCode,
        SPT.Status,
        SPT.CreatedAt,
        SPT.CreatedBy,
        SPT.ModifiedAt,
        SPT.ModifiedBy
    FROM 
        FC_TIPODOCUMENTOPAGO SPT
    INNER JOIN 
        FC_CAJA_TIPODOCUMENTOPAGO SPTC ON SPTC.ID_FC_TIPODOCUMENTOPAGO = SPT.ID
        AND SPTC.CAJA_ID = @PointOfSaleId
    WHERE 
        SPT.IDEMPRESA = @CompanyId 
        AND SPT.ID_TIPOPAGO = @PaymentId
END




IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetPointOfSaleByUser')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetPointOfSaleByUser] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GetPointOfSaleByUser] 
    @UserId VARCHAR(50),
    @CompanyId INT,
    @State INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CA.ID_EMPRESA AS CompanyId,
        CA.CAJA_ID AS PointOfSaleId,
        CA.NOMBRE AS PointOfSaleName,
        CA.FECHA AS CreatedAt,
        CAP.ESTADO AS [State],
        CA.PrinterName,
        CAP.COD_APERTURA as OpeningCode
    FROM 
        FC_CAJA CA 
    INNER JOIN 
        FC_CAJAUSUARIO CU
        ON CA.ID_EMPRESA = CU.ID_EMPRESA 
        AND CA.CAJA_ID = CU.CAJA_ID
    LEFT JOIN 
        (SELECT ID_EMPRESA, CAJA_ID, USUARIO, ESTADO, COD_APERTURA -- Added COD_APERTURA
         FROM FC_CAJAAPERTURA CAP1
         WHERE ESTADO IS NOT NULL
         AND COD_APERTURA = (SELECT MAX(COD_APERTURA) 
                             FROM FC_CAJAAPERTURA CAP2
                             WHERE CAP1.ID_EMPRESA = CAP2.ID_EMPRESA
                             AND CAP1.CAJA_ID = CAP2.CAJA_ID)
        ) CAP
        ON CA.ID_EMPRESA = CAP.ID_EMPRESA 
        AND CA.CAJA_ID = CAP.CAJA_ID
    WHERE 
        CA.ID_EMPRESA = @CompanyId
        AND (@UserId = '0' OR CU.USUARIO = @UserId)
        AND (CA.ESTADO = @State);
END
GO



IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_POS_GetInvoiceDetail')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_POS_GetInvoiceDetail] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[FC_SP_GETINFOINVOICE]  
@InvoiceNumber AS INT  
AS  
BEGIN  
    SET NOCOUNT ON;
    
    DECLARE @Clave VARCHAR(50);  
    DECLARE @CompanyId INT;

    -- Get Company ID
    SELECT @CompanyId = C.CompanyId  
    FROM FC_FACTURA F  
    INNER JOIN CLI_CLIENTE C ON F.CLIENTE = C.CODIGO  
    WHERE F.N_FACTURA = @InvoiceNumber;

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
        SELECT DISTINCT ', ' + TP2.DESCRIPCION  
        FROM FC_PAGOFACTURAS PF2  
        JOIN FC_PAGO P2 ON PF2.IDPAGO = P2.ID  
        JOIN FC_TIPOPAGO TP2 ON TP2.ID = P2.FORMAPAGO_ID  
        WHERE PF2.N_FACTURA = F.N_FACTURA AND TP2.DESCRIPCION IS NOT NULL  
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS PaymentType,  

      -- Sub Payment Type
      STUFF((  
        SELECT DISTINCT ', ' + SPT2.DESCRIPCION  
        FROM FC_PAGOFACTURAS PF2  
        JOIN FC_PAGO P2 ON PF2.IDPAGO = P2.ID  
        JOIN FC_TIPODOCUMENTOPAGO SPT2 ON SPT2.ID = P2.FORMAPAGO_ID  
        WHERE PF2.N_FACTURA = F.N_FACTURA AND SPT2.DESCRIPCION IS NOT NULL  
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