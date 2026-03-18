SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BKO_Cashier_GetPaged]
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
            CASE WHEN @inSortBy = 'Name ASC' THEN T.[NOMBRE] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN T.[NOMBRE] END DESC,
            CASE WHEN @inSortBy = 'CompanyName ASC' THEN E.[Empresa] END ASC,
            CASE WHEN @inSortBy = 'CompanyName DESC' THEN E.[Empresa] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN T.ESTADO END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN T.ESTADO END DESC
          ) AS [RowNum], T.[NOMBRE] 'Name', E.[Empresa] 'CompanyName', T.CAJA_ID as 'Id', T.ESTADO as 'Status', T.PrinterName, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[FC_CAJA] T WITH(NOLOCK)
        INNER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK) ON (T.ID_EMPRESA = E.[ID])
        WHERE (T.[NOMBRE] LIKE '%' + @inFilterBy + '%')
          AND (@inCompanyId = 0 OR T.ID_EMPRESA = @inCompanyId)
          --AND T.[Status] != 4 -- DON'T RETURN DELETED
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
      CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
      CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
      CASE WHEN @inSortBy = 'CompanyName ASC' THEN [CompanyName] END ASC,
      CASE WHEN @inSortBy = 'CompanyName DESC' THEN [CompanyName] END DESC,
      CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
      CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Cashier_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Cashier_GetById] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Cashier_GetById]
	@inId INT,
	@inCompanyId INT = 0
AS
BEGIN
	SELECT 
		T.CAJA_ID as 'Id', 
		T.[NOMBRE] 'Name', 
		T.ESTADO as 'Status',
		T.Fecha as 'CreatedAt',
		T.PrinterName,
		E.[Empresa] 'CompanyName',
        T.ID_EMPRESA 'CompanyId'
	FROM [dbo].[FC_CAJA] T WITH(NOLOCK)
    INNER JOIN [dbo].[EMP_EMPRESA] E WITH(NOLOCK) ON (T.ID_EMPRESA = E.[ID])
    WHERE (T.CAJA_ID = @inId);-- AND (T.ID_EMPRESA = @inCompanyId);
END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Cashier_CreateOrUpdate')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Cashier_CreateOrUpdate] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Cashier_CreateOrUpdate]
	@inId INT,
	@inCompanyId INT,
    @inName VARCHAR(80),
    @inPrinterName VARCHAR(32),
    @inStatus BIT
AS
BEGIN

    DECLARE	@return_value int, @RESULTADO int;

    IF (ISNULL(@inId, 0) = 0) 
	BEGIN

        EXEC @return_value = [dbo].[FC_SP_GETIDCAJA] @RESULTADO = @RESULTADO OUTPUT;

        INSERT INTO [dbo].[FC_CAJA]
               ([ID_EMPRESA]
               ,[CAJA_ID]
               ,[NOMBRE]
               ,[FECHA]
               ,[ESTADO]
               ,[PrinterName])
         VALUES
               (@inCompanyId
               ,@RESULTADO
               ,@inName
               ,GETDATE()
               ,@inStatus
               ,@inPrinterName);

         SET @inId = @RESULTADO;
    END
	ELSE
	BEGIN
		UPDATE [dbo].[FC_CAJA]
		SET 
			[NOMBRE] = @inName,
			ESTADO = @inStatus,
			PrinterName = @inPrinterName
		WHERE CAJA_ID = @inId;
	END;

    SELECT @inId;
END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetPointOfSaleByUser')
BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_GetPointOfSaleByUser] AS RETURN');
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
        CA.ESTADO AS [State],  
        CA.PrinterName  
    FROM  
        FC_CAJA CA  
    INNER JOIN  
        FC_CAJAUSUARIO CU  
        ON CA.ID_EMPRESA = CU.ID_EMPRESA  
        AND CA.CAJA_ID = CU.CAJA_ID  
    WHERE  
        CA.ID_EMPRESA = @CompanyId  
        AND (@UserId = '0' OR CU.USUARIO = @UserId)  
        AND ESTADO = @State;  
END  
GO  

IF EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_StartPointOfSale')
BEGIN
    DROP PROCEDURE [dbo].[BKO_StartPointOfSale]
END
GO

CREATE PROCEDURE [dbo].[BKO_StartPointOfSale]
@ID_EMPRESA AS int,
@CAJA_ID AS int,
@USUARIO AS VARCHAR(50),
@MONTO_COLONES AS FLOAT,
@MONTO_DOLARES AS FLOAT,
@RESULTADO AS INT OUTPUT
AS
BEGIN
    SET @RESULTADO = 0

    IF EXISTS(SELECT 1 FROM FC_CAJAAPERTURA WHERE CAJA_ID = @CAJA_ID AND ESTADO = 1)
    BEGIN
        SET @RESULTADO = 1
        RETURN
    END
    ELSE
    BEGIN
        DECLARE @TableTemp table(COD_APERTURA int)
        DECLARE @COD_APERTURA AS INT

        INSERT INTO FC_CAJAAPERTURA (ID_EMPRESA, COD_CIERRE_CAJA, CAJA_ID, USUARIO, MONTO_COLONES, MONTO_DOLAR, FECHA_APERTURA, ESTADO)
        OUTPUT INSERTED.COD_APERTURA INTO @TableTemp 
        VALUES(@ID_EMPRESA, 0, @CAJA_ID, @USUARIO, @MONTO_COLONES, @MONTO_DOLARES, GETDATE(), 1)

        SELECT @COD_APERTURA = COD_APERTURA FROM @TableTemp

        IF @COD_APERTURA IS NOT NULL
        BEGIN
            INSERT INTO [dbo].[FC_CAJA_MOVIMIENTOS]
                ([COD_APERTURA], [ID_EMPRESA], [PAGO_ID], [USUARIO], [CAJA_ID], [CLIENTE], [FECHA], [FORMAPAGO_ID], [REFERENCIA], [TOTAL], [TOTALLOCAL], [PAGADO], [CAMBIO], [IDBANCO], [COD_MONEDA], [TIPO_PAGO])
            VALUES
                (@COD_APERTURA, @ID_EMPRESA, 0, @USUARIO, @CAJA_ID, '', GETDATE(), 0, 'APERTURA', @MONTO_DOLARES, @MONTO_COLONES, @MONTO_COLONES, 0, 0, 188, 0)

            SET @RESULTADO = 2
        END
    END

    RETURN @RESULTADO
END
GO