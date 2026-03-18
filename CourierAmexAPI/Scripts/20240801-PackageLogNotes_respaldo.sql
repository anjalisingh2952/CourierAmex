USE [AMEXPRUEBASUAT_2]
GO

/****** Object:  StoredProcedure [dbo].[usp_GetBitacoraNota_Paged]    Script Date: 29/8/2024 16:45:30 ******/
DROP PROCEDURE [dbo].[usp_GetBitacoraNota_Paged]
GO

/****** Object:  StoredProcedure [dbo].[usp_GetBitacoraNota_Paged]    Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE or Alter PROCEDURE [dbo].[usp_GetBitacoraNota_Paged]
    @inCodigoCliente varchar(50) = '',
	@inNumeroPckg int = 0,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;

    -- Establecer los límites de la página
    DECLARE @thePageLowerBound INT = @inPageSize * (@inPageIndex - 1);
    DECLARE @thePageUpperBound INT = @thePageLowerBound + @inPageSize;


	DECLARE @sql NVARCHAR(MAX);
  --  DECLARE @params NVARCHAR(MAX) = N'@inCodigoCliente varchar(50), @inNumeroPckg int, 
		--@inPageSize SMALLINT, @inPageIndex SMALLINT, @inSortBy VARCHAR(64), @inFilterBy VARCHAR(64), @thePageLowerBound INT, @thePageUpperBound INT';

    DECLARE @orderBy NVARCHAR(MAX);

    -- Construir la cláusula ORDER BY
    SET @orderBy = N'';
    IF @inSortBy = 'CreatedAt ASC' SET @orderBy = N'[CreatedAt] ASC';
    IF @inSortBy = 'CreatedAt DESC' SET @orderBy = N'[CreatedAt] DESC';
    IF @inSortBy = 'Number ASC' SET @orderBy = N'[Number] ASC';
    IF @inSortBy = 'Number DESC' SET @orderBy = N'[Number] DESC';
    IF @inSortBy = 'User ASC' SET @orderBy = N'[User] ASC';
    IF @inSortBy = 'User DESC' SET @orderBy = N'[User] DESC';
    IF @inSortBy = 'Codigo ASC' SET @orderBy = N'[Codigo] ASC';
    IF @inSortBy = 'Codigo DESC' SET @orderBy = N'[Codigo] DESC';
	IF @inSortBy = 'logType DESC' SET @orderBy = N'[LogType] DESC';
	IF @inSortBy = 'logType ASC' SET @orderBy = N'[LogType] ASC';
	IF @inSortBy = 'customerName DESC' SET @orderBy = N'[CustomerName] DESC';
	IF @inSortBy = 'customerName ASC' SET @orderBy = N'[CustomerName] ASC';

	SET @sql = N'
    WITH CTE_BitacoraNotaInfo AS (
        SELECT 
            n.[ID] AS ''Id'',
            n.[IDNOTA] AS ''IdNota'',
            n.[NUMERO] AS ''Number'', 
            n.[CODIGO] AS ''Codigo'',
            n.[COURIER] AS ''Courier'',
            n.[MENSAJE] AS ''Message'',
            n.[IDUSUARIO] AS ''User'', 
            n.[TIPOBITACORA] AS ''LogType'',
            n.[FECHA] AS ''CreatedAt'',
			c.NOMBRECOMPLETO as CustomerName
        FROM dbo.[BITACORA_NOTA] n WITH(NOLOCK)
        INNER JOIN CLI_CLIENTE c WITH(NOLOCK) 
            ON n.[CODIGO] = c.[CODIGO]
        WHERE 1= 1'

    IF @inCodigoCliente <> ''
    BEGIN
        SET @sql = @sql + N' AND c.[CODIGO] ='''+ @inCodigoCliente+ '''';
    END

    IF @inNumeroPckg <> 0
    BEGIN
        SET @sql = @sql + N' AND n.[NUMERO] like '+ '''%' + CAST(@inNumeroPckg AS VARCHAR(50)) + '%''';
    END
	
	SET @sql = @sql + N'
    ),
    CTE_Rank AS (
        SELECT 
            [Id],
            [IdNota],
            [Number],
            [Codigo],
            [Courier],
            [Message],
            [User],
            [LogType],
            [CreatedAt],
			[CustomerName],
            RowIndex = ROW_NUMBER() OVER (
                ORDER BY ' + @orderBy + N'),
            COUNT(1) OVER() AS TotalRows
        FROM CTE_BitacoraNotaInfo
    )
    SELECT
        o.[Id],
        o.[IdNota],
        o.[Number],
        o.[Codigo],
        o.[Courier],
        o.[Message],
        o.[User],
        CASE o.[LogType]
			WHEN ''I'' THEN ''Ingreso''
			WHEN ''U'' THEN ''Modificación''
			WHEN ''D'' THEN ''Borrado''
			WHEN ''V'' THEN ''Mostrada''
		END AS LogType	,
        o.[CreatedAt],
		o.[CustomerName],
        o.TotalRows
    FROM (
        SELECT 
            *
        FROM CTE_Rank
        WHERE RowIndex > '  + CAST(@thePageLowerBound AS VARCHAR(50)) +' AND RowIndex <='+ CAST(@thePageUpperBound AS VARCHAR(50))  + '
    ) AS o ';

	
	--print @sql;

	EXEC sp_executesql @sql;

    SET NOCOUNT OFF;
END
GO


