IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DocumentByCustomerChartData')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_DocumentByCustomerChartData] AS RETURN')
END
GO

ALTER PROCEDURE [dbo].[BKO_DocumentByCustomerChartData]  
    @CLIENTE AS VARCHAR(200),      -- ClientId  
    @DESDE AS DATE,                -- FromDate  
    @HASTA AS DATE,                -- ToDate  
    @LIST AS VARCHAR(100),         -- (FACTURA,PAGO)  
    @ID_EMPRESA AS INT = NULL,     -- ID_EMPRESA (nullable, defaults to NULL)
    @SelectedMonths AS VARCHAR(50) = NULL,  -- Comma-separated months (e.g., "Blank,01-January,02-February")
    @Selectedfilter AS VARCHAR(50) = NULL   -- Status filter (e.g., "Blank,PAGADA")
AS  
BEGIN  
    SET NOCOUNT ON;

    DECLARE @IncludeFactura BIT = CASE WHEN CHARINDEX('FACTURA' COLLATE DATABASE_DEFAULT, @LIST COLLATE DATABASE_DEFAULT) > 0 THEN 1 ELSE 0 END;
    DECLARE @IncludePago BIT = CASE WHEN CHARINDEX('PAGO' COLLATE DATABASE_DEFAULT, @LIST COLLATE DATABASE_DEFAULT) > 0 THEN 1 ELSE 0 END;

    DECLARE @EffectiveEmpresaId INT = COALESCE(@ID_EMPRESA, 2);
    DECLARE @LocalCliente VARCHAR(200) = @CLIENTE;
    DECLARE @LocalDesde DATE = @DESDE;
    DECLARE @LocalHasta DATE = @HASTA;

    CREATE TABLE #SelectedMonths (MonthValue INT);
    CREATE TABLE #SelectedStatuses (StatusValue NVARCHAR(50) COLLATE DATABASE_DEFAULT);

    IF @SelectedMonths IS NOT NULL AND @SelectedMonths != ''
    BEGIN
        IF CHARINDEX('Blank' COLLATE DATABASE_DEFAULT, @SelectedMonths COLLATE DATABASE_DEFAULT) = 0
        BEGIN
            DECLARE @MonthValue NVARCHAR(50) = '';
            DECLARE @MonthPos INT = 1;

            WHILE @MonthPos <= LEN(@SelectedMonths)
            BEGIN
                SET @MonthValue = SUBSTRING(@SelectedMonths, @MonthPos, 
                    CHARINDEX(',', @SelectedMonths + ',', @MonthPos) - @MonthPos);

                SET @MonthPos = CHARINDEX(',', @SelectedMonths + ',', @MonthPos) + 1;

                IF @MonthValue != ''
                BEGIN
                    DECLARE @MonthInt INT = CAST(LEFT(@MonthValue, 2) AS INT);
                    INSERT INTO #SelectedMonths (MonthValue) VALUES (@MonthInt);
                END
            END
        END
    END

    -- Parse @Selectedfilter
    IF @Selectedfilter IS NOT NULL AND @Selectedfilter != ''
    BEGIN
        -- Check if "Blank" is included
        IF CHARINDEX('Blank' COLLATE DATABASE_DEFAULT, @Selectedfilter COLLATE DATABASE_DEFAULT) = 0
        BEGIN
            DECLARE @StatusValue NVARCHAR(50) = '';
            DECLARE @StatusPos INT = 1;

            WHILE @StatusPos <= LEN(@Selectedfilter)
            BEGIN
                SET @StatusValue = SUBSTRING(@Selectedfilter, @StatusPos, 
                    CHARINDEX(',', @Selectedfilter + ',', @StatusPos) - @StatusPos);

                SET @StatusPos = CHARINDEX(',', @Selectedfilter + ',', @StatusPos) + 1;

                IF @StatusValue != ''
                BEGIN
                    INSERT INTO #SelectedStatuses (StatusValue) VALUES (TRIM(@StatusValue) COLLATE DATABASE_DEFAULT);
                END
            END
        END
    END

    CREATE TABLE #FilteredFacturas (
        FECHA DATE,
        CLIENTE VARCHAR(200) COLLATE DATABASE_DEFAULT,
        ID_EMPRESA INT,
        TOTAL DECIMAL(18, 2),
        PAGADO DECIMAL(18, 2),
        MONTOGRAVADO DECIMAL(18, 2),  -- For Gravado
        MONTOEXENTO DECIMAL(18, 2),   -- For Exento
        IMPUESTOVENTAS DECIMAL(18, 2),-- For Sales Tax
        IMPUESTOADUANAS DECIMAL(18, 2),-- For Customs Tax
        ESTADO INT,
        YearInt INT,
        MonthInt INT
    );

    CREATE TABLE #FilteredPagos (
        FECHA DATE,
        CLIENTE VARCHAR(200) COLLATE DATABASE_DEFAULT,
        ID_EMPRESA INT,
        PAGADO DECIMAL(18, 2),
        CAJA_ID VARCHAR(50) COLLATE DATABASE_DEFAULT,
        YearInt INT,
        MonthInt INT
    );

    IF @IncludeFactura = 1
    BEGIN
        INSERT INTO #FilteredFacturas (FECHA, CLIENTE, ID_EMPRESA, TOTAL, PAGADO, MONTOGRAVADO, MONTOEXENTO, IMPUESTOVENTAS, IMPUESTOADUANAS, ESTADO, YearInt, MonthInt)
        SELECT 
            F.FECHA,
            F.CLIENTE,
            F.ID_EMPRESA,
            F.TOTAL,
            F.PAGADO,
            F.MONTOGRAVADO,
            F.MONTOEXENTO,
            F.IMPUESTOVENTAS,
            F.IMPUESTOADUANAS,
            F.ESTADO,
            YEAR(F.FECHA),
            MONTH(F.FECHA)
        FROM FC_FACTURA F
        INNER JOIN FC_ESTADOFACTURA E ON F.ESTADO = E.ID
        WHERE (@LocalCliente = 'All' COLLATE DATABASE_DEFAULT OR F.CLIENTE = @LocalCliente COLLATE DATABASE_DEFAULT)
            AND F.FECHA >= @LocalDesde 
            AND F.FECHA <= @LocalHasta  
            AND F.ID_EMPRESA = @EffectiveEmpresaId
            AND (NOT EXISTS (SELECT 1 FROM #SelectedMonths) OR MONTH(F.FECHA) IN (SELECT MonthValue FROM #SelectedMonths))
            AND (NOT EXISTS (SELECT 1 FROM #SelectedStatuses) OR E.DESCRIPCION COLLATE DATABASE_DEFAULT IN (SELECT StatusValue FROM #SelectedStatuses));
    END;

    IF @IncludePago = 1
    BEGIN
        INSERT INTO #FilteredPagos (FECHA, CLIENTE, ID_EMPRESA, PAGADO, CAJA_ID, YearInt, MonthInt)
        SELECT 
            P.FECHA,
            P.CLIENTE,
            P.ID_EMPRESA,
            P.PAGADO,
            P.CAJA_ID,
            YEAR(P.FECHA),
            MONTH(P.FECHA)
        FROM FC_PAGO P
        WHERE (@LocalCliente = 'All' COLLATE DATABASE_DEFAULT OR P.CLIENTE = @LocalCliente COLLATE DATABASE_DEFAULT)
            AND P.FECHA >= @LocalDesde 
            AND P.FECHA <= @LocalHasta  
            AND P.ID_EMPRESA = @EffectiveEmpresaId
            AND (NOT EXISTS (SELECT 1 FROM #SelectedMonths) OR MONTH(P.FECHA) IN (SELECT MonthValue FROM #SelectedMonths));
    END;

    -- Result Set 1: Status of Invoices
    SELECT 
        E.DESCRIPCION AS StatusLabel,
        COUNT(*) AS Count
    FROM #FilteredFacturas F
    INNER JOIN FC_ESTADOFACTURA E ON F.ESTADO = E.ID
    GROUP BY E.DESCRIPCION;

    -- Result Set 2: Billed vs. Paid per Month
    SELECT 
        F.YearInt AS [Year],
        F.MonthInt AS [Month],
        SUM(F.TOTAL) AS TotalFacturado,
        SUM(F.PAGADO) AS TotalPagado
    FROM #FilteredFacturas F
    GROUP BY F.YearInt, F.MonthInt;

    SELECT 
        P.YearInt AS [Year],
        P.MonthInt AS [Month],
        SUM(P.PAGADO) AS TotalPagado
    FROM #FilteredPagos P
    GROUP BY P.YearInt, P.MonthInt;

    -- Result Set 3: Number of Invoices Paid per Cashier
    SELECT 
        ISNULL(C.NOMBRE, 'UNKNOWN' COLLATE DATABASE_DEFAULT) AS Cashier,
        COUNT(*) AS Count
    FROM #FilteredPagos P
    LEFT JOIN FC_CAJA C ON P.CAJA_ID = C.CAJA_ID
    GROUP BY C.NOMBRE;

    -- Result Set 4: Invoices per Month
    SELECT 
        F.YearInt AS [Year],
        F.MonthInt AS [Month],
        COUNT(*) AS Count
    FROM #FilteredFacturas F
    GROUP BY F.YearInt, F.MonthInt;

    -- Result Set 5: Amounts per Year (Grouped by Year and Broken Down into Gravado, Exento, Sales Tax, Customs Tax)
    SELECT 
        F.YearInt AS [Year],
        'Gravado' AS AmountType,
        SUM(F.MONTOGRAVADO) AS Amount
    FROM #FilteredFacturas F
    GROUP BY F.YearInt
    UNION ALL
    SELECT 
        F.YearInt AS [Year],
        'Exento' AS AmountType,
        SUM(F.MONTOEXENTO) AS Amount
    FROM #FilteredFacturas F
    GROUP BY F.YearInt
    UNION ALL
    SELECT 
        F.YearInt AS [Year],
        'Sales Tax' AS AmountType,
        SUM(F.IMPUESTOVENTAS) AS Amount
    FROM #FilteredFacturas F
    GROUP BY F.YearInt
    UNION ALL
    SELECT 
        F.YearInt AS [Year],
        'Customs Tax' AS AmountType,
        SUM(F.IMPUESTOADUANAS) AS Amount
    FROM #FilteredFacturas F
    GROUP BY F.YearInt;

    -- Clean up temporary tables
    DROP TABLE #FilteredFacturas;
    DROP TABLE #FilteredPagos;
    DROP TABLE #SelectedMonths;
    DROP TABLE #SelectedStatuses;
END;


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DSH_GetProductChartDetail')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_DSH_GetProductChartDetail] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_DSH_GetProductChartDetail]
   @ID_EMPRESA INT,
    @FechaInicio DATE,
    @FechaFin DATE,
    @InvoiceId VARCHAR(50) = NULL,
    @ProductId INT = NULL,
    @Months VARCHAR(200) = 'Blank' -- e.g., '01-January,02-February' or 'Blank'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Result Set 1: Product Amounts by Year
        SELECT 
            fp.DESCRIPCION AS ProductName,
            YEAR(f.FECHA) AS Year,
            SUM(fd.CANTIDAD * fd.PRECIO) AS TotalAmount
        FROM FC_FACTURA f
        INNER JOIN FC_FACTURADETALLE fd 
            ON f.N_FACTURA = fd.N_FACTURA 
            AND f.ID_EMPRESA = @ID_EMPRESA
        INNER JOIN FC_PRODUCTOS fp 
            ON fd.PRODUCTO_ID = fp.ID
        WHERE f.FECHA BETWEEN @FechaInicio AND @FechaFin
            AND YEAR(f.FECHA) IN (2023, 2024)
            AND (@InvoiceId IS NULL OR f.N_FACTURA = @InvoiceId)
            AND (@ProductId IS NULL OR fd.PRODUCTO_ID = @ProductId)
            AND (@Months = 'Blank' OR MONTH(f.FECHA) IN (
                SELECT CAST(LEFT(value, 2) AS INT)
                FROM STRING_SPLIT(@Months, ',')
                WHERE ISNUMERIC(LEFT(value, 2)) = 1
                    AND CAST(LEFT(value, 2) AS INT) BETWEEN 1 AND 12
                    AND LEN(value) >= 9 -- Ensures format like '01-January'
                    AND CHARINDEX('-', value) = 3 -- Ensures hyphen after 'MM-'
            ))
        GROUP BY fp.DESCRIPCION, YEAR(f.FECHA)
        ORDER BY SUM(fd.CANTIDAD * fd.PRECIO) DESC;

        -- Result Set 2: Percentage of Products
        WITH ProductCounts AS (
            SELECT 
                fp.DESCRIPCION AS ProductName,
                COUNT(*) AS ProductCount
            FROM FC_FACTURA f
            INNER JOIN FC_FACTURADETALLE fd 
                ON f.N_FACTURA = fd.N_FACTURA 
                AND f.ID_EMPRESA = @ID_EMPRESA
            INNER JOIN FC_PRODUCTOS fp 
                ON fd.PRODUCTO_ID = fp.ID
            WHERE f.FECHA BETWEEN @FechaInicio AND @FechaFin
                AND (@InvoiceId IS NULL OR f.N_FACTURA = @InvoiceId)
                AND (@ProductId IS NULL OR fd.PRODUCTO_ID = @ProductId)
                AND (@Months = 'Blank' OR MONTH(f.FECHA) IN (
                    SELECT CAST(LEFT(value, 2) AS INT)
                    FROM STRING_SPLIT(@Months, ',')
                    WHERE ISNUMERIC(LEFT(value, 2)) = 1
                        AND CAST(LEFT(value, 2) AS INT) BETWEEN 1 AND 12
                        AND LEN(value) >= 9
                        AND CHARINDEX('-', value) = 3
                ))
            GROUP BY fp.DESCRIPCION
        ),
        TotalCount AS (
            SELECT SUM(ProductCount) AS TotalProductCount
            FROM ProductCounts
        )
        SELECT 
            pc.ProductName,
            CASE 
                WHEN tc.TotalProductCount = 0 THEN 0
                ELSE ROUND((pc.ProductCount * 100.0) / tc.TotalProductCount, 2)
            END AS Percentage
        FROM ProductCounts pc
        CROSS JOIN TotalCount tc
        ORDER BY Percentage DESC;

        -- Result Set 3: Total by Product Name
        SELECT 
            fp.DESCRIPCION AS ProductName,
            SUM(fd.TOTAL) AS Total
        FROM FC_FACTURA f
        INNER JOIN FC_FACTURADETALLE fd 
            ON f.N_FACTURA = fd.N_FACTURA 
            AND f.ID_EMPRESA = @ID_EMPRESA
        INNER JOIN FC_PRODUCTOS fp 
            ON fd.PRODUCTO_ID = fp.ID
        WHERE f.FECHA BETWEEN @FechaInicio AND @FechaFin
            AND (@InvoiceId IS NULL OR f.N_FACTURA = @InvoiceId)
            AND (@ProductId IS NULL OR fd.PRODUCTO_ID = @ProductId)
            AND (@Months = 'Blank' OR MONTH(f.FECHA) IN (
                SELECT CAST(LEFT(value, 2) AS INT)
                FROM STRING_SPLIT(@Months, ',')
                WHERE ISNUMERIC(LEFT(value, 2)) = 1
                    AND CAST(LEFT(value, 2) AS INT) BETWEEN 1 AND 12
                    AND LEN(value) >= 9
                    AND CHARINDEX('-', value) = 3
            ))
        GROUP BY fp.DESCRIPCION
        ORDER BY SUM(fd.TOTAL) DESC;
    END TRY
    BEGIN CATCH
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_MESSAGE() AS ErrorMessage;
    END CATCH;
END;


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_DSH_GetProductDetailsPaginated')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_DSH_GetProductDetailsPaginated] AS RETURN')
END
GO
ALTER PROCEDURE BKO_DSH_GetProductDetailsPaginated
    @ID_EMPRESA INT,
    @FechaInicio DATE,
    @FechaFin DATE,
    @InvoiceId VARCHAR(50) = NULL,
    @ProductId INT = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @Months VARCHAR(200) = 'Blank'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Calculate the OFFSET based on PageNumber and PageSize
        DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

        -- Result Set 1: Paginated Data
        SELECT 
            fd.N_FACTURA as InvoiceId,
            fp.DESCRIPCION AS ProductName,
            fd.CANTIDAD as Candidate,
            fd.PRECIO as Price,
            fd.TOTAL as Total,
            (CC.NOMBRE + ' ' + CC.APELLIDO1 + ' ' + CC.APELLIDO2) as Client
        FROM FC_FACTURA f
        INNER JOIN FC_FACTURADETALLE fd 
            ON f.N_FACTURA = fd.N_FACTURA 
            AND f.ID_EMPRESA = @ID_EMPRESA
        INNER JOIN FC_PRODUCTOS fp 
            ON fd.PRODUCTO_ID = fp.ID
        INNER JOIN CLI_CLIENTE CC 
            ON CC.CODIGO = f.CLIENTE
        WHERE f.FECHA BETWEEN @FechaInicio AND @FechaFin
            AND (@InvoiceId IS NULL OR f.N_FACTURA = @InvoiceId)
            AND (@ProductId IS NULL OR fd.PRODUCTO_ID = @ProductId)
            AND (@Months = 'Blank' OR MONTH(f.FECHA) IN (
                SELECT CAST(LEFT(value, 2) AS INT)
                FROM STRING_SPLIT(@Months, ',')
                WHERE ISNUMERIC(LEFT(value, 2)) = 1
                    AND CAST(LEFT(value, 2) AS INT) BETWEEN 1 AND 12
                    AND LEN(value) >= 9
                    AND CHARINDEX('-', value) = 3
            ))
        ORDER BY fd.N_FACTURA desc
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY;

        -- Result Set 2: Total Number of Records
        SELECT 
            COUNT(*) AS TotalRecords
        FROM FC_FACTURA f
        INNER JOIN FC_FACTURADETALLE fd 
            ON f.N_FACTURA = fd.N_FACTURA 
            AND f.ID_EMPRESA = @ID_EMPRESA
        INNER JOIN FC_PRODUCTOS fp 
            ON fd.PRODUCTO_ID = fp.ID
        INNER JOIN CLI_CLIENTE CC 
            ON CC.CODIGO = f.CLIENTE
        WHERE f.FECHA BETWEEN @FechaInicio AND @FechaFin
            AND (@InvoiceId IS NULL OR f.N_FACTURA = @InvoiceId)
            AND (@ProductId IS NULL OR fd.PRODUCTO_ID = @ProductId)
            AND (@Months = 'Blank' OR MONTH(f.FECHA) IN (
                SELECT CAST(LEFT(value, 2) AS INT)
                FROM STRING_SPLIT(@Months, ',')
                WHERE ISNUMERIC(LEFT(value, 2)) = 1
                    AND CAST(LEFT(value, 2) AS INT) BETWEEN 1 AND 12
                    AND LEN(value) >= 9
                    AND CHARINDEX('-', value) = 3
            ));
    END TRY
    BEGIN CATCH
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_MESSAGE() AS ErrorMessage;
    END CATCH;
END;