USE [AMEXPRUEBASUAT_2]
GO

/****** Object:  StoredProcedure [dbo].[usp_GetBitacoraNota_Paged]    Script Date: 29/8/2024 16:45:30 ******/
DROP PROCEDURE [dbo].[BKO_PackageLogNotes_GetPaged]
GO

/****** Object:  StoredProcedure [dbo].[usp_GetBitacoraNota_Paged]    Script Date: 29/8/2024 16:45:30 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

--Bitacora NOTA
--borra sp usp_GetBitacoraNota_Paged
CREATE OR ALTER PROCEDURE [dbo].[BKO_PackageLogNotes_GetPaged]
    @inCodigoCliente VARCHAR(50) = '',
    @inNumeroPckg INT = 0,
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;
	WITH CTE_LogNotes as 
	(
		SELECT
		  ROW_NUMBER() OVER (ORDER BY
		  CASE WHEN @inSortBy = 'Message ASC' THEN [MENSAJE] END ASC,
		  CASE WHEN @inSortBy = 'Message DESC' THEN [MENSAJE] END DESC,
		  CASE WHEN @inSortBy = 'Number ASC' THEN [NUMERO] END ASC,
		  CASE WHEN @inSortBy = 'Number DESC' THEN [NUMERO] END DESC,
		  CASE WHEN @inSortBy = 'Codigo ASC' THEN n.[CODIGO] END ASC,
		  CASE WHEN @inSortBy = 'Codigo DESC' THEN n.[CODIGO] END DESC,
		  CASE WHEN @inSortBy = 'Courier ASC' THEN [COURIER] END ASC,
		  CASE WHEN @inSortBy = 'Courier DESC' THEN [COURIER] END DESC,
		  CASE WHEN @inSortBy = 'User ASC' THEN [IDUSUARIO] END ASC,
		  CASE WHEN @inSortBy = 'User DESC' THEN [IDUSUARIO] END DESC,
		  CASE WHEN @inSortBy = 'LogType ASC' THEN [TIPOBITACORA] END ASC,
		  CASE WHEN @inSortBy = 'LogType DESC' THEN [TIPOBITACORA] END DESC,
		  CASE WHEN @inSortBy = 'CreatedAt ASC' THEN [FECHA] END ASC,
		  CASE WHEN @inSortBy = 'CreatedAt DESC' THEN [FECHA] END DESC
	) AS [RowNum],
		n.[ID] AS Id,
        n.[IDNOTA] AS IdNota,
        n.[NUMERO] AS Number, 
        n.[CODIGO] AS Codigo,
        n.[COURIER] AS Courier,
        n.[MENSAJE] AS Message,
        n.[IDUSUARIO] AS [User], 
        CASE n.[TIPOBITACORA]
			WHEN 'I' THEN 'Ingreso'
			WHEN 'U' THEN 'Modificación'
			WHEN 'D' THEN 'Borrado'
			WHEN 'V' THEN 'Mostrada'
		END AS LogType,
        n.[FECHA] AS CreatedAt,
        c.NOMBRECOMPLETO AS CustomerName
    FROM dbo.[BITACORA_NOTA] n WITH(NOLOCK)
    INNER JOIN CLI_CLIENTE c WITH(NOLOCK) 
        ON n.[CODIGO] = c.[CODIGO]
    WHERE 1= 1 
	AND (MENSAJE LIKE '%' + @inFilterBy + '%')
	AND (@inCodigoCliente = '' OR c.[CODIGO] = @inCodigoCliente)
    AND (@inNumeroPckg = 0 OR n.[NUMERO] LIKE '%' + CAST(@inNumeroPckg AS VARCHAR(50)) + '%')
	)

    SELECT *
      FROM CTE_LogNotes
	 WHERE [RowNum] > @inPageSize * (@inPageIndex -1)
	  AND [RowNum] <= @inPageSize * @inPageIndex
	ORDER BY 
		CASE WHEN @inSortBy = 'Message ASC' THEN [MESSAGE] END ASC,
		CASE WHEN @inSortBy = 'Message DESC' THEN [MESSAGE] END DESC,
		CASE WHEN @inSortBy = 'Number ASC' THEN [NUMBER] END ASC,
		CASE WHEN @inSortBy = 'Number DESC' THEN [NUMBER] END DESC,
		CASE WHEN @inSortBy = 'Codigo ASC' THEN [CODIGO] END ASC,
		CASE WHEN @inSortBy = 'Codigo DESC' THEN [CODIGO] END DESC,
		CASE WHEN @inSortBy = 'Courier ASC' THEN [COURIER] END ASC,
		CASE WHEN @inSortBy = 'Courier DESC' THEN [COURIER] END DESC,
		CASE WHEN @inSortBy = 'User ASC' THEN [USER] END ASC,
		CASE WHEN @inSortBy = 'User DESC' THEN [USER] END DESC,
		CASE WHEN @inSortBy = 'LogType ASC' THEN [LOGTYPE] END ASC,
		CASE WHEN @inSortBy = 'LogType DESC' THEN [LOGTYPE] END DESC,
		CASE WHEN @inSortBy = 'CreatedAt ASC' THEN [CREATEDAT] END ASC,
		CASE WHEN @inSortBy = 'CreatedAt DESC' THEN [CREATEDAT] END DESC;


    SET NOCOUNT OFF;
END
GO


