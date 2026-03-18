INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'DELIVERY_PROOF', 'Payment', 'Delivery Proof'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='DELIVERY_PROOF'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'DELIVERY_PROOF'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


IF OBJECT_ID('[dbo].[BKO_FlowGetSignaturePackage]', 'P') IS NOT NULL  
    DROP PROCEDURE [dbo].[BKO_FlowGetSignaturePackage];  
GO  

CREATE PROCEDURE [dbo].[BKO_FlowGetSignaturePackage]  
    @NUMERO AS INT  
AS  
BEGIN  
    SET NOCOUNT ON;  

    SELECT  
        PF.NUMERO,  
        PF.FIRMA,  
        ISNULL(PF.IMAGEN_PAQUETE, CONVERT(VARBINARY, '')) AS IMAGEN_PAQUETE,  
        P.CLIENTE,  
        P.FECHAMODIFICO,  
        P.MODIFICO,  
        P.DESCRIPCION,  
        E.NOMBRE AS ESTADO,  
        P.COURIER,  
        UPPER(PF.[NAME]) AS ENTREGADOA,  
        PF.FECHA  
    FROM PAQ_PAQUETE_FIRMA PF  
    INNER JOIN PAQ_PAQUETE P ON PF.NUMERO = P.NUMERO  
    INNER JOIN EST_ESTADO E ON P.EST_ID = E.ID  
    WHERE PF.NUMERO = @NUMERO;  
END  


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Payment')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Payment] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_Payment]
(
	@inCustomerId INT,
	@inInvoiceCSV VARCHAR(2048),
	@localAmount FLOAT,
	@dollarAmount FLOAT,
	@inPaidAmount FLOAT,
	@inChangeAmount FLOAT,
	@inCurrencyCode INT,
	@inPaymentType VARCHAR(10),
	@inSubPaymentTypeId INT,
	@inReference VARCHAR(50),
	@inPointOfSaleId INT,
	@inCompanyId INT,
	@inPartialPayment bit,
	@inCreditPayment bit,
	@inUser  VARCHAR(50)

)
AS
BEGIN

	-- INSERT AND GENERATE THE PAYMENT ID
	DECLARE @RC int
	DECLARE @CUSTOMERACCOUNT varchar(200)
	DECLARE @BANKID int
	DECLARE @PAYMENTID int
	DECLARE @PAYMENTDATE date
	DECLARE @INVOICESTATUS int --PAYED, PENDING, CREDIT PENDING

	SELECT @CUSTOMERACCOUNT = CODIGO FROM CLI_CLIENTE WHERE ID = @inCustomerId
	SELECT @BANKID = IDBANCO FROM FC_TIPODOCUMENTOPAGO WHERE ID = @inSubPaymentTypeId
	SET @PAYMENTDATE = GETDATE()

	IF (@inPartialPayment = 1)
		SET @INVOICESTATUS = 0 -- PENDING
	ELSE IF (@inCreditPayment = 1)
		SET @INVOICESTATUS = 3 -- CREDIT PENDING
	ELSE
		SET @INVOICESTATUS = 2 -- PAYED

	EXECUTE @RC = [dbo].[FC_SP_INSERTPAGO] 
	   @inCompanyId, @inUser, @inPointOfSaleId, @CUSTOMERACCOUNT, @inSubPaymentTypeId,
	   @inReference, @dollarAmount, @localAmount, @inPaidAmount, @inChangeAmount, 
	   @inCurrencyCode, @BANKID, @PAYMENTID OUTPUT, @PAYMENTDATE, @inPaymentType

	-- Process to change the invoices status.
	;WITH CTE_ItemsFP AS (
	SELECT Item AS [InvoiceId]
	FROM [dbo].[udfn_Split](@inInvoiceCSV, ',') l
	)
	UPDATE FC_FACTURA 
	SET ESTADO = @INVOICESTATUS, 
		SALDO = 0,
		SALDOLOCAL = 0,
		PAGADO = TOTAL
	WHERE N_FACTURA IN (
		SELECT [InvoiceId]
		FROM CTE_ItemsFP
	);

	-- Insert the invoices in the table FC_PagoFacturas (Payment 1 - * Invoices relation.
	;WITH CTE_ItemsF AS (
	SELECT Item AS [InvoiceId]
	FROM [dbo].[udfn_Split](@inInvoiceCSV, ',') l
	)
	INSERT INTO FC_PAGOFACTURAS (ID_EMPRESA, IDPAGO, N_FACTURA)
	(SELECT @inCompanyId, @PAYMENTID, [InvoiceId] 
	FROM CTE_ItemsF);


	-- Accounting process ONLY for companyId 2

	IF @inCompanyId = 2
	BEGIN

	-- Generate the Accounting entry

		DECLARE @FEC_PERIODO date
		DECLARE @FEC_ASIENTO datetime
		DECLARE @DET_ASIENTO varchar(200)
		DECLARE @IND_ESTADO varchar(5)
		DECLARE @COD_SISTEMA_ORIGEN varchar(50)
		DECLARE @IND_SISTEMA varchar(50)
		DECLARE @FEC_INCLUSION date
		DECLARE @USER_INCLUSION int
		DECLARE @ASIENTO VARCHAR(80)

		-- Save the Accounting entry for the payment	
		-- Accounting entry parameters
		SET @FEC_ASIENTO = GETDATE()
		SET @FEC_INCLUSION = @FEC_ASIENTO
		SET @FEC_PERIODO = DATEFROMPARTS (DATEPART(YYYY, @FEC_ASIENTO), DATEPART(MM, @FEC_ASIENTO), 27)
		SET @DET_ASIENTO = 'PAGO # ' + Convert(varchar, @PAYMENTID)
		SET @IND_ESTADO = 'A'
		SET @COD_SISTEMA_ORIGEN = 'CJ'
		SET @IND_SISTEMA = ''
		SELECT @USER_INCLUSION = ID FROM USU_USUARIO WHERE USUARIO = @inUser

		EXECUTE  @ASIENTO = [CN_SP_INSERT_ASIENTO] 
		   @inCompanyId
		  ,@FEC_PERIODO
		  ,@FEC_ASIENTO
		  ,@DET_ASIENTO
		  ,@IND_ESTADO
		  ,@COD_SISTEMA_ORIGEN
		  ,@IND_SISTEMA
		  ,@FEC_INCLUSION
		  ,@USER_INCLUSION 

		EXECUTE @RC = [dbo].[CN_SP_INSERT_ASIENTO_PAGO] 
		   @inCompanyId, @ASIENTO, @PAYMENTID, @inSubPaymentTypeId


		-- Save the Accounting entry DETAIL for the payment	
		DECLARE @COD_PLANTILLA int
		DECLARE @COMISIONBANCARIA float
		DECLARE @COMISIONBANCARIA_WEB float
		DECLARE @IMPUESTOVENTAS float
		DECLARE @ADELANTORENTA float
		DECLARE @COD_MONEDAPLANTILLA int
		DECLARE @TIPOCAMBIO_VENTA float
	
		-- Get the Exchange Rate

		SELECT @TIPOCAMBIO_VENTA = [dbo].[FC_FN_TIPOCAMBIOVENTAFACTURA] (@inCompanyId, 0)

		-- Get the accounting template data

		-- Get the document pay type values 
		SELECT 
		@COMISIONBANCARIA = COMISIONBANCARIA, @IMPUESTOVENTAS = IMPUESTOVENTAS,
		@ADELANTORENTA= ADELANTORENTA, @COD_MONEDAPLANTILLA = COD_MONEDA, @COD_PLANTILLA = COD_PLANTILLA, @COMISIONBANCARIA_WEB = 0.4
		FROM FC_TIPODOCUMENTOPAGO
		WHERE ID = @inSubPaymentTypeId AND IDEMPRESA = @inCompanyId

		DECLARE @NUM_LINEA_ASIENTO int
		DECLARE @MONTO_MOV float
		DECLARE @NUM_CUENTA varchar(50)
		DECLARE @IND_DEBCRE varchar(5)
		DECLARE @MON_TIPO_CAMBIO float
		DECLARE @MONTO_ORIGINAL float
		DECLARE @MONEDA_ORIGINAL varchar(5)
		DECLARE @COD_CLIENTE varchar(20)
		DECLARE @CIERRE_ASIENTO varchar(80)

		DECLARE cur CURSOR LOCAL for

			SELECT 
				cpd.NUM_LINEA AS NUM_LINEA_ASIENTO,
				CASE -- 1 total, 2 banco, 3 comision banco, 4 impuesto ventas, 5 renta, 6 comision web
					WHEN cpd.NUM_LINEA = 1 THEN CONVERT(DECIMAL(18,2), @localAmount)
					WHEN cpd.NUM_LINEA = 2 THEN CONVERT(DECIMAL(18,2), @localAmount - ((@COMISIONBANCARIA * @localAmount / 100) + (@IMPUESTOVENTAS * @localAmount / 100) + (@ADELANTORENTA * @localAmount / 100) + (@COMISIONBANCARIA_WEB * @TIPOCAMBIO_VENTA)) )
					WHEN cpd.NUM_LINEA = 3 THEN CONVERT(DECIMAL(18,2), (@COMISIONBANCARIA * @localAmount / 100) )
					WHEN cpd.NUM_LINEA = 4 THEN CONVERT(DECIMAL(18,2), (@IMPUESTOVENTAS * @localAmount / 100) )
					WHEN cpd.NUM_LINEA = 5 THEN CONVERT(DECIMAL(18,2), (@ADELANTORENTA * @localAmount / 100) )
					WHEN cpd.NUM_LINEA = 6 THEN CONVERT(DECIMAL(18,2), (@COMISIONBANCARIA_WEB * @TIPOCAMBIO_VENTA) )
					ELSE 0
				END AS MONTO_MOV,
				cc.NUM_CUENTA,
				cpd.IND_DEBCRE,
				@TIPOCAMBIO_VENTA AS MON_TIPO_CAMBIO,
				--IIF(@inCurrencyCode = 840, @dollarAmount, @localAmount) AS MONTO_ORIGINAL,
				--IIF(@inCurrencyCode = 840, 'Dolar', 'Local') AS MONEDA_ORIGINAL, 
				'Colon' AS MONEDA_ORIGINAL, 
				@CUSTOMERACCOUNT AS COD_CLIENTE,
				'' AS CIERRE_ASIENTO			
				FROM CN_PLANTILLA cp
				INNER JOIN CN_PLANTILLA_DETALLE cpd
				ON cp.ID_EMPRESA = cpd.ID_EMPRESA
				AND cp.COD_MODULO = cpd.COD_MODULO
				AND cp.COD_PLANTILLA = cpd.COD_PLANTILLA
				INNER JOIN CN_VW_SELECCIONA_CUENTA_HIJO cc
				ON cp.ID_EMPRESA = cc.ID_EMPRESA
				AND cpd.NUM_CUENTA = cc.NUM_CUENTA
				WHERE cp.ID_EMPRESA = @inCompanyId 
				AND cp.COD_MODULO = @COD_SISTEMA_ORIGEN 
				AND cp.COD_PLANTILLA = @COD_PLANTILLA	

			open cur

			FETCH next from cur into @NUM_LINEA_ASIENTO, @MONTO_MOV, @NUM_CUENTA, @IND_DEBCRE, @MON_TIPO_CAMBIO, @MONEDA_ORIGINAL, @COD_CLIENTE, @CIERRE_ASIENTO

			WHILE @@FETCH_STATUS = 0 BEGIN
				EXECUTE @RC = [dbo].[CN_SP_INSERT_ASIENTO_DETALLE] 
				   @inCompanyId
				  ,@ASIENTO
				  ,@FEC_PERIODO
				  ,@NUM_LINEA_ASIENTO 
				  ,@MONTO_MOV 
				  ,@NUM_CUENTA 
				  ,@IND_DEBCRE
				  ,@MON_TIPO_CAMBIO 
				  ,@MONTO_MOV
				  ,@MONEDA_ORIGINAL
				  ,@COD_CLIENTE 
				  ,@CIERRE_ASIENTO
	
				FETCH next from cur into @NUM_LINEA_ASIENTO, @MONTO_MOV, @NUM_CUENTA, @IND_DEBCRE, @MON_TIPO_CAMBIO, @MONEDA_ORIGINAL, @COD_CLIENTE, @CIERRE_ASIENTO
			END

			CLOSE cur
			DEALLOCATE cur

			-- Execute Validate Exchange Rate Differential Entry
			EXECUTE [CN_SP_VALIDA_ASIENTO_DIFERENCIA] @ASIENTO, @inCompanyId
		
			DECLARE @CUADRADO bit
			SELECT @CUADRADO = ISNULL(A.CUADRADO,0) FROM CN_ASIENTO A WHERE A.ID_EMPRESA = @inCompanyId AND COD_ASIENTO = @ASIENTO

			-- Mark the entry as applied.
			IF(@CUADRADO = 1)
			BEGIN
				UPDATE CN_ASIENTO SET IND_ESTADO = 'Apli' 
				WHERE ID_EMPRESA = @inCompanyId AND COD_ASIENTO = @Asiento	
			END
	END -- Finish Accounting process

	SELECT @PAYMENTID

END

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Payment')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Payment] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_Payment]
(
	@inCustomerId INT,
	@inInvoiceCSV VARCHAR(2048),
	@localAmount FLOAT,
	@dollarAmount FLOAT,
	@inPaidAmount FLOAT,
	@inChangeAmount FLOAT,
	@inCurrencyCode INT,
	@inPaymentType VARCHAR(10),
	@inSubPaymentTypeId INT,
	@inReference VARCHAR(50),
	@inPointOfSaleId INT,
	@inCompanyId INT,
	@inPartialPayment bit,
	@inCreditPayment bit,
	@inUser  VARCHAR(50)

)
AS
BEGIN

	-- INSERT AND GENERATE THE PAYMENT ID
	DECLARE @RC int
	DECLARE @CUSTOMERACCOUNT varchar(200)
	DECLARE @BANKID int
	DECLARE @PAYMENTID int
	DECLARE @PAYMENTDATE date
	DECLARE @INVOICESTATUS int --PAYED, PENDING, CREDIT PENDING

	SELECT @CUSTOMERACCOUNT = CODIGO FROM CLI_CLIENTE WHERE ID = @inCustomerId
	SELECT @BANKID = IDBANCO FROM FC_TIPODOCUMENTOPAGO WHERE ID = @inSubPaymentTypeId
	SET @PAYMENTDATE = GETDATE()

	IF (@inPartialPayment = 1)
		SET @INVOICESTATUS = 0 -- PENDING
	ELSE IF (@inCreditPayment = 1)
		SET @INVOICESTATUS = 3 -- CREDIT PENDING
	ELSE
		SET @INVOICESTATUS = 2 -- PAYED

	EXECUTE @RC = [dbo].[FC_SP_INSERTPAGO] 
	   @inCompanyId, @inUser, @inPointOfSaleId, @CUSTOMERACCOUNT, @inSubPaymentTypeId,
	   @inReference, @dollarAmount, @localAmount, @inPaidAmount, @inChangeAmount, 
	   @inCurrencyCode, @BANKID, @PAYMENTID OUTPUT, @PAYMENTDATE, @inPaymentType

	-- Process to change the invoices status.
	;WITH CTE_ItemsFP AS (
    SELECT CAST(Item AS INT) AS InvoiceId
    FROM [dbo].[udfn_Split](@inInvoiceCSV, ',')
	),
	CTE_Factura AS (
		SELECT ID_EMPRESA, N_FACTURA, FECHA 
		FROM FC_FACTURA 
		WHERE ID_EMPRESA = @inCompanyId
		AND N_FACTURA IN (SELECT InvoiceId FROM CTE_ItemsFP)
	),
	CTE_ExchangeRate AS (
		SELECT 
			F.N_FACTURA, 
			ISNULL(TCH.TIPO_CAMBIO_VENTA, 1) AS exchangeRate
		FROM CTE_Factura F
		LEFT JOIN CN_TIPO_CAMBIO_HISTORIAL TCH 
			ON F.ID_EMPRESA = TCH.ID_EMPRESA 
			AND F.FECHA = TCH.FECHA_HISTORIAL
	)

	UPDATE FC_FACTURA
	SET 
		ESTADO = @INVOICESTATUS, 

		SALDO = CASE 
					WHEN @inPartialPayment = 1 AND @inCurrencyCode = 840 
					THEN @dollarAmount - @inPaidAmount
					WHEN @inPartialPayment = 1 AND @inCurrencyCode = 188 
					THEN @dollarAmount - (@inPaidAmount / (SELECT exchangeRate FROM CTE_ExchangeRate WHERE N_FACTURA = FC_FACTURA.N_FACTURA))
					WHEN @inPartialPayment = 0 
					THEN 0
					ELSE @dollarAmount
				END,

		SALDOLOCAL = CASE 
					WHEN @inPartialPayment = 1 AND @inCurrencyCode = 188 
					THEN @localAmount - @inPaidAmount 
					WHEN @inPartialPayment = 1 AND @inCurrencyCode = 840 
					THEN @localAmount - (@inPaidAmount * (SELECT exchangeRate FROM CTE_ExchangeRate WHERE N_FACTURA = FC_FACTURA.N_FACTURA)) 
					WHEN @inPartialPayment = 0 
					THEN 0
					ELSE @localAmount
				END,

		PAGADO = CASE 
					WHEN @inPartialPayment = 1 
					THEN ISNULL(PAGADO, 0) + @inPaidAmount
					ELSE TOTAL 
				 END
	WHERE N_FACTURA IN (SELECT InvoiceId FROM CTE_ItemsFP);

	;WITH CTE_ItemsF AS (
	SELECT Item AS [InvoiceId]
	FROM [dbo].[udfn_Split](@inInvoiceCSV, ',') l
	)
	INSERT INTO FC_PAGOFACTURAS (ID_EMPRESA, IDPAGO, N_FACTURA)
	(SELECT @inCompanyId, @PAYMENTID, [InvoiceId] 
	FROM CTE_ItemsF);




	-- Accounting process ONLY for companyId 2

	IF @inCompanyId = 2
	BEGIN

	-- Generate the Accounting entry

		DECLARE @FEC_PERIODO date
		DECLARE @FEC_ASIENTO datetime
		DECLARE @DET_ASIENTO varchar(200)
		DECLARE @IND_ESTADO varchar(5)
		DECLARE @COD_SISTEMA_ORIGEN varchar(50)
		DECLARE @IND_SISTEMA varchar(50)
		DECLARE @FEC_INCLUSION date
		DECLARE @USER_INCLUSION int
		DECLARE @ASIENTO VARCHAR(80)

		-- Save the Accounting entry for the payment	
		-- Accounting entry parameters
		SET @FEC_ASIENTO = GETDATE()
		SET @FEC_INCLUSION = @FEC_ASIENTO
		SET @FEC_PERIODO = DATEFROMPARTS (DATEPART(YYYY, @FEC_ASIENTO), DATEPART(MM, @FEC_ASIENTO), 27)
		SET @DET_ASIENTO = 'PAGO # ' + Convert(varchar, @PAYMENTID)
		SET @IND_ESTADO = 'A'
		SET @COD_SISTEMA_ORIGEN = 'CJ'
		SET @IND_SISTEMA = ''
		SELECT @USER_INCLUSION = ID FROM USU_USUARIO WHERE USUARIO = @inUser

		EXECUTE  @ASIENTO = [CN_SP_INSERT_ASIENTO] 
		   @inCompanyId
		  ,@FEC_PERIODO
		  ,@FEC_ASIENTO
		  ,@DET_ASIENTO
		  ,@IND_ESTADO
		  ,@COD_SISTEMA_ORIGEN
		  ,@IND_SISTEMA
		  ,@FEC_INCLUSION
		  ,@USER_INCLUSION 

		EXECUTE @RC = [dbo].[CN_SP_INSERT_ASIENTO_PAGO] 
		   @inCompanyId, @ASIENTO, @PAYMENTID, @inSubPaymentTypeId


		-- Save the Accounting entry DETAIL for the payment	
		DECLARE @COD_PLANTILLA int
		DECLARE @COMISIONBANCARIA float
		DECLARE @COMISIONBANCARIA_WEB float
		DECLARE @IMPUESTOVENTAS float
		DECLARE @ADELANTORENTA float
		DECLARE @COD_MONEDAPLANTILLA int
		DECLARE @TIPOCAMBIO_VENTA float
	
		-- Get the Exchange Rate

		SELECT @TIPOCAMBIO_VENTA = [dbo].[FC_FN_TIPOCAMBIOVENTAFACTURA] (@inCompanyId, 0)

		-- Get the accounting template data

		-- Get the document pay type values 
		SELECT 
		@COMISIONBANCARIA = COMISIONBANCARIA, @IMPUESTOVENTAS = IMPUESTOVENTAS,
		@ADELANTORENTA= ADELANTORENTA, @COD_MONEDAPLANTILLA = COD_MONEDA, @COD_PLANTILLA = COD_PLANTILLA, @COMISIONBANCARIA_WEB = 0.4
		FROM FC_TIPODOCUMENTOPAGO
		WHERE ID = @inSubPaymentTypeId AND IDEMPRESA = @inCompanyId

		DECLARE @NUM_LINEA_ASIENTO int
		DECLARE @MONTO_MOV float
		DECLARE @NUM_CUENTA varchar(50)
		DECLARE @IND_DEBCRE varchar(5)
		DECLARE @MON_TIPO_CAMBIO float
		DECLARE @MONTO_ORIGINAL float
		DECLARE @MONEDA_ORIGINAL varchar(5)
		DECLARE @COD_CLIENTE varchar(20)
		DECLARE @CIERRE_ASIENTO varchar(80)

		DECLARE cur CURSOR LOCAL for

			SELECT 
				cpd.NUM_LINEA AS NUM_LINEA_ASIENTO,
				CASE -- 1 total, 2 banco, 3 comision banco, 4 impuesto ventas, 5 renta, 6 comision web
					WHEN cpd.NUM_LINEA = 1 THEN CONVERT(DECIMAL(18,2), @localAmount)
					WHEN cpd.NUM_LINEA = 2 THEN CONVERT(DECIMAL(18,2), @localAmount - ((@COMISIONBANCARIA * @localAmount / 100) + (@IMPUESTOVENTAS * @localAmount / 100) + (@ADELANTORENTA * @localAmount / 100) + (@COMISIONBANCARIA_WEB * @TIPOCAMBIO_VENTA)) )
					WHEN cpd.NUM_LINEA = 3 THEN CONVERT(DECIMAL(18,2), (@COMISIONBANCARIA * @localAmount / 100) )
					WHEN cpd.NUM_LINEA = 4 THEN CONVERT(DECIMAL(18,2), (@IMPUESTOVENTAS * @localAmount / 100) )
					WHEN cpd.NUM_LINEA = 5 THEN CONVERT(DECIMAL(18,2), (@ADELANTORENTA * @localAmount / 100) )
					WHEN cpd.NUM_LINEA = 6 THEN CONVERT(DECIMAL(18,2), (@COMISIONBANCARIA_WEB * @TIPOCAMBIO_VENTA) )
					ELSE 0
				END AS MONTO_MOV,
				cc.NUM_CUENTA,
				cpd.IND_DEBCRE,
				@TIPOCAMBIO_VENTA AS MON_TIPO_CAMBIO,
				--IIF(@inCurrencyCode = 840, @dollarAmount, @localAmount) AS MONTO_ORIGINAL,
				--IIF(@inCurrencyCode = 840, 'Dolar', 'Local') AS MONEDA_ORIGINAL, 
				'Colon' AS MONEDA_ORIGINAL, 
				@CUSTOMERACCOUNT AS COD_CLIENTE,
				'' AS CIERRE_ASIENTO			
				FROM CN_PLANTILLA cp
				INNER JOIN CN_PLANTILLA_DETALLE cpd
				ON cp.ID_EMPRESA = cpd.ID_EMPRESA
				AND cp.COD_MODULO = cpd.COD_MODULO
				AND cp.COD_PLANTILLA = cpd.COD_PLANTILLA
				INNER JOIN CN_VW_SELECCIONA_CUENTA_HIJO cc
				ON cp.ID_EMPRESA = cc.ID_EMPRESA
				AND cpd.NUM_CUENTA = cc.NUM_CUENTA
				WHERE cp.ID_EMPRESA = @inCompanyId 
				AND cp.COD_MODULO = @COD_SISTEMA_ORIGEN 
				AND cp.COD_PLANTILLA = @COD_PLANTILLA	

			open cur

			FETCH next from cur into @NUM_LINEA_ASIENTO, @MONTO_MOV, @NUM_CUENTA, @IND_DEBCRE, @MON_TIPO_CAMBIO, @MONEDA_ORIGINAL, @COD_CLIENTE, @CIERRE_ASIENTO

			WHILE @@FETCH_STATUS = 0 BEGIN
				EXECUTE @RC = [dbo].[CN_SP_INSERT_ASIENTO_DETALLE] 
				   @inCompanyId
				  ,@ASIENTO
				  ,@FEC_PERIODO
				  ,@NUM_LINEA_ASIENTO 
				  ,@MONTO_MOV 
				  ,@NUM_CUENTA 
				  ,@IND_DEBCRE
				  ,@MON_TIPO_CAMBIO 
				  ,@MONTO_MOV
				  ,@MONEDA_ORIGINAL
				  ,@COD_CLIENTE 
				  ,@CIERRE_ASIENTO
	
				FETCH next from cur into @NUM_LINEA_ASIENTO, @MONTO_MOV, @NUM_CUENTA, @IND_DEBCRE, @MON_TIPO_CAMBIO, @MONEDA_ORIGINAL, @COD_CLIENTE, @CIERRE_ASIENTO
			END

			CLOSE cur
			DEALLOCATE cur

			-- Execute Validate Exchange Rate Differential Entry
			EXECUTE [CN_SP_VALIDA_ASIENTO_DIFERENCIA] @ASIENTO, @inCompanyId
		
			DECLARE @CUADRADO bit
			SELECT @CUADRADO = ISNULL(A.CUADRADO,0) FROM CN_ASIENTO A WHERE A.ID_EMPRESA = @inCompanyId AND COD_ASIENTO = @ASIENTO

			-- Mark the entry as applied.
			IF(@CUADRADO = 1)
			BEGIN
				UPDATE CN_ASIENTO SET IND_ESTADO = 'Apli' 
				WHERE ID_EMPRESA = @inCompanyId AND COD_ASIENTO = @Asiento	
			END
	END -- Finish Accounting process

	SELECT @PAYMENTID

END
IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetDailyReportByDate')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetDailyReportByDate] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GetDailyReportByDate]
    @inputDate DATE,
    @companyId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @openingId INT;
    SELECT @openingId = MAX(COD_APERTURA)
    FROM FC_CAJA_MOVIMIENTOS
    WHERE CAST(FECHA AS DATE) = @inputDate 
      AND ID_EMPRESA = @companyId;

    IF @openingId IS NOT NULL
    BEGIN
        EXEC BKO_GetPointOfDetailByOpeningCode @openingId, @companyId;
    END
    ELSE
    BEGIN
        SELECT NULL AS CompanyId, NULL AS OpeningCode, NULL AS ID, NULL AS PaymentId,
               NULL AS SubPaymentId, NULL AS SubPaymentDescription, NULL AS PayTypeId, 
               NULL AS PaymentTypeDescription, NULL AS UserName, NULL AS PointOfSaleId, 
               NULL AS [Date], NULL AS Reference, NULL AS TotalDoller, NULL AS TotalLocal, 
               NULL AS PaidAmount, NULL AS CurrencyCode, NULL AS PaymentType, NULL AS Client, 
               NULL AS InvoiceIds, NULL AS ChangeInLocal, NULL AS ChangeInDollar
        WHERE 1 = 0;
    END
END;



IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetPointOfDetailByOpeningCode')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetPointOfDetailByOpeningCode] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GetPointOfDetailByOpeningCode]
    @openingCode INT,  
    @companyId INT      
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        CM.ID_EMPRESA AS CompanyId,
        CM.COD_APERTURA AS OpeningCode,
        CM.ID,
        CM.PAGO_ID AS PaymentId,
        AP.ID_TIPODOCUMENTOPAGO AS SubPaymentId, 
        TD.DESCRIPCION AS SubPaymentDescription,
        AP.ID_PAGO AS PayTypeId, 
        TP.DESCRIPCION AS PaymentTypeDescription,
        CM.USUARIO AS UserName,
        CM.CAJA_ID AS PointOfSaleId,
        CM.FECHA AS [Date],
        CM.REFERENCIA AS Reference,
        CM.TOTAL AS TotalDoller,
        CM.TOTALLOCAL AS TotalLocal,
        CM.PAGADO AS PaidAmount,
        CM.COD_MONEDA AS CurrencyCode,
        CM.TIPO_PAGO AS PaymentType,
        MAX(F.CLIENTE) AS Client,
        STRING_AGG(CONVERT(NVARCHAR(MAX), PF.N_FACTURA), ', ') AS InvoiceIds,
        -- Get CAMBIO from FC_PAGO and assign it based on CurrencyCode
        CASE 
            WHEN CM.COD_MONEDA = 188 THEN P.CAMBIO 
            ELSE 0 
        END AS ChangeInLocal,
        CASE 
            WHEN CM.COD_MONEDA <> 188 THEN P.CAMBIO 
            ELSE 0 
        END AS ChangeInDollar
    FROM FC_CAJA_MOVIMIENTOS CM
    LEFT JOIN FC_PAGOFACTURAS PF ON CM.PAGO_ID = PF.IDPAGO AND CM.PAGO_ID <> 0
    LEFT JOIN CN_ASIENTO_PAGO AP ON CM.PAGO_ID = AP.ID_PAGO AND CM.PAGO_ID <> 0
    LEFT JOIN FC_TIPODOCUMENTOPAGO TD ON AP.ID_TIPODOCUMENTOPAGO = TD.ID
    LEFT JOIN FC_TIPOPAGO TP ON TD.ID_TIPOPAGO = TP.ID
    LEFT JOIN FC_FACTURA F ON PF.N_FACTURA = F.N_FACTURA
    LEFT JOIN FC_PAGO P ON CM.PAGO_ID = P.ID
    WHERE CM.ID_EMPRESA = @companyId 
      AND CM.COD_APERTURA = @openingCode
    GROUP BY 
        CM.ID_EMPRESA, CM.COD_APERTURA, CM.ID, CM.PAGO_ID, AP.ID_TIPODOCUMENTOPAGO, 
        TD.DESCRIPCION,
        AP.ID_PAGO, 
        TP.DESCRIPCION, 
        CM.USUARIO, CM.CAJA_ID, CM.FECHA, CM.REFERENCIA, CM.TOTAL, CM.TOTALLOCAL, 
        CM.PAGADO, CM.COD_MONEDA, CM.TIPO_PAGO, P.CAMBIO;
END;



IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_CashInOut')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_CashInOut] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_CashInOut]
@ID_EMPRESA AS int,
@CAJA_ID AS int,
@USUARIO AS VARCHAR(50),
@MONTO_COLONES AS FLOAT,
@MONTO_DOLARES AS FLOAT,
@COD_APERTURA AS INT,
@RESULTADO AS INT OUTPUT
AS
BEGIN
	BEGIN
		SET @RESULTADO = 0
		INSERT INTO [dbo].[FC_CAJA_MOVIMIENTOS]
			([COD_APERTURA],[ID_EMPRESA],[PAGO_ID], [USUARIO],[CAJA_ID],[CLIENTE],[FECHA],[FORMAPAGO_ID],[REFERENCIA],[TOTAL],[TOTALLOCAL],[PAGADO],[CAMBIO],[IDBANCO],[COD_MONEDA],[TIPO_PAGO])
		VALUES
           (@COD_APERTURA, @ID_EMPRESA, 0, @USUARIO, @CAJA_ID, '', GETDATE(), 0, '', @MONTO_DOLARES, @MONTO_COLONES, @MONTO_COLONES, 0, 0, 0, 0)
	END
	RETURN @RESULTADO
END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetDailyReportByDate')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetDailyReportByDate] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_GetDailyReportByDate]
    @inputDate DATE,
    @companyId INT,
	@pointOfSaleId int
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @openingId INT;
    SELECT @openingId = MAX(COD_APERTURA)
    FROM FC_CAJA_MOVIMIENTOS
    WHERE CAST(FECHA AS DATE) = @inputDate 
      AND ID_EMPRESA = @companyId;

    IF @openingId IS NOT NULL
    BEGIN
        SELECT 
        CM.ID_EMPRESA AS CompanyId,
        CM.COD_APERTURA AS OpeningCode,
        CM.ID,
        CM.PAGO_ID AS PaymentId,
        AP.ID_TIPODOCUMENTOPAGO AS SubPaymentId, 
        TD.DESCRIPCION AS SubPaymentDescription,
        AP.ID_PAGO AS PayTypeId, 
        TP.DESCRIPCION AS PaymentTypeDescription,
        CM.USUARIO AS UserName,
        CM.CAJA_ID AS PointOfSaleId,
        CM.FECHA AS [Date],
        CM.REFERENCIA AS Reference,
        CM.TOTAL AS TotalDoller,
        CM.TOTALLOCAL AS TotalLocal,
        CM.PAGADO AS PaidAmount,
        CM.COD_MONEDA AS CurrencyCode,
        CM.TIPO_PAGO AS PaymentType,
        MAX(F.CLIENTE) AS Client,
        STRING_AGG(CONVERT(NVARCHAR(MAX), PF.N_FACTURA), ', ') AS InvoiceIds,
        CASE 
            WHEN CM.COD_MONEDA = 188 THEN P.CAMBIO 
            ELSE 0 
        END AS ChangeInLocal,
        CASE 
            WHEN CM.COD_MONEDA <> 188 THEN P.CAMBIO 
            ELSE 0 
        END AS ChangeInDollar
    FROM FC_CAJA_MOVIMIENTOS CM
    LEFT JOIN FC_PAGOFACTURAS PF ON CM.PAGO_ID = PF.IDPAGO AND CM.PAGO_ID <> 0
    LEFT JOIN CN_ASIENTO_PAGO AP ON CM.PAGO_ID = AP.ID_PAGO AND CM.PAGO_ID <> 0
    LEFT JOIN FC_TIPODOCUMENTOPAGO TD ON AP.ID_TIPODOCUMENTOPAGO = TD.ID
    LEFT JOIN FC_TIPOPAGO TP ON TD.ID_TIPOPAGO = TP.ID
    LEFT JOIN FC_FACTURA F ON PF.N_FACTURA = F.N_FACTURA
    LEFT JOIN FC_PAGO P ON CM.PAGO_ID = P.ID
    WHERE CM.ID_EMPRESA = @companyId 
      AND CM.COD_APERTURA = @openingId
	  AND CM.CAJA_ID = @pointOfSaleId
    GROUP BY 
        CM.ID_EMPRESA, CM.COD_APERTURA, CM.ID, CM.PAGO_ID, AP.ID_TIPODOCUMENTOPAGO, 
        TD.DESCRIPCION,
        AP.ID_PAGO, 
        TP.DESCRIPCION, 
        CM.USUARIO, CM.CAJA_ID, CM.FECHA, CM.REFERENCIA, CM.TOTAL, CM.TOTALLOCAL, 
        CM.PAGADO, CM.COD_MONEDA, CM.TIPO_PAGO, P.CAMBIO;
    END
    ELSE
    BEGIN
        SELECT NULL AS CompanyId, NULL AS OpeningCode, NULL AS ID, NULL AS PaymentId,
               NULL AS SubPaymentId, NULL AS SubPaymentDescription, NULL AS PayTypeId, 
               NULL AS PaymentTypeDescription, NULL AS UserName, NULL AS PointOfSaleId, 
               NULL AS [Date], NULL AS Reference, NULL AS TotalDoller, NULL AS TotalLocal, 
               NULL AS PaidAmount, NULL AS CurrencyCode, NULL AS PaymentType, NULL AS Client, 
               NULL AS InvoiceIds, NULL AS ChangeInLocal, NULL AS ChangeInDollar
        WHERE 1 = 0;
    END
END;

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetPackageManifestInfo')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_GetPackageManifestInfo] AS RETURN')
END
GO

ALTER PROCEDURE BKO_GetPackageManifestInfo
    @CompanyId INT,
    @PackageNumber INT
AS
BEGIN
    SET NOCOUNT ON;
	 DECLARE @PAQUETE_LIDER AS INT  
  
	 SET @PAQUETE_LIDER = 0  
  
	 SELECT @PAQUETE_LIDER = CGH.PAQUETE_LIDER  
	   FROM DEM_DETALLE_MANIFIESTO DE   
	   INNER JOIN CONSOLIDADO_GUIA CGH  
	   ON DE.ENM_ID = CGH.ENM_ID  
	   AND DE.BOLSA = CGH.GUIA_HIJA  
	   WHERE DE.NUMEROPAQUETE = @PackageNumber  

    SELECT 
        ISNULL(E.ID, 0) AS ManifestID,  
        E.NUMERO AS ManifestNumber,  
        E.PAIS AS ManifestCountry,  
        P.NUMERO AS PackageNumber,  
        P.CLIENTE AS CustomerAccount,
        D.ID AS Line,  
        P.ID AS PackageID,  
        P.DESCRIPCION AS PackageDescription,  
        P.PAIS AS PackageCountry,  
        C.NOMBRECOMPLETO AS CustomerName,
        Z.NOMBRE AS Zone,  
        A.NOMBRE AS Area,
        PAI.NOMBRE AS CountryName,  
        P.TOTALETIQUETA AS TotalLabel,  
        C.ENCOMIENDA AS UseTransport,  
        D.BOLSA AS BagReference,  
        P.EST_ID AS PackageStatusID,
        C.COMPANNIA AS CustomerCompanyName,  
        C.FACTURAR_COMPANNIA AS BillingByCompany,  
        C.NOMBRE AS CityName,  
        C.DIRECCION1 AS Address1,  
        C.DIRECCION2 AS Address2,  
        C.NUMERODOCUMENTO AS IdentificationNumber,  
        TD.NOMBRE AS DocumentType,  
        D.TIPOIMPUESTO AS TaxType,
        P.PESO AS Weight,  
        P.ANCHO AS Width,  
        P.ALTO AS Height,
        P.LARGO AS Length,  
        P.PESOVOLUMETRICO AS VolumetricWeight,  
        P.PRECIO AS Price,  
        P.PROCEDENCIA AS Origin,  
        P.COURIER AS Courier,  
        P.NOMBRECOURIER AS CourierName,  
        @PAQUETE_LIDER AS LeaderPackage  
		 FROM PAQ_PAQUETE P   
		 INNER JOIN CLI_CLIENTE C  
		 ON C.CODIGO = P.CLIENTE  
		 INNER JOIN ZON_ZONA Z  
		 ON C.ZON_ID = Z.ID  
		 INNER JOIN ARE_AREA A  
		 ON C.ARE_ID = A.ID  
		 LEFT JOIN CIUDAD CI  
		 ON C.CIUDAD_ID = CI.ID AND C.PAI_ID = CI.PAI_ID  
		 INNER JOIN PAI_PAIS PAI  
		 ON P.PAIS = PAI.INICIAL  
		 LEFT JOIN DEM_DETALLE_MANIFIESTO D  
		 ON P.ID = D.PAQ_ID   
		 LEFT JOIN ENM_ENCABEZADO_MANIFIESTO E  
		 ON E.ID = D.ENM_ID  
		 LEFT JOIN TIPODOCUMENTO TD  
		 ON C.TIPODOCUMENTO = TD.TIPODOCUMENTO_ID  WHERE P.NUMERO = @PackageNumber  
END;

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
