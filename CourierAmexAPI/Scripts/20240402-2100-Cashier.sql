IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Cashier_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Cashier_GetPaged] AS RETURN')
END
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
          ) AS [RowNum], T.[NOMBRE] 'Name', E.[Empresa] 'CompanyName', T.CAJA_ID as 'Id', T.ESTADO as 'Status', COUNT(*) OVER() [TotalRows]
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
    @inId INT
AS
	SET NOCOUNT ON;

	SELECT [NOMBRE] 'Name', *
	FROM [dbo].[FC_CAJA]
	WHERE CAJA_ID = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_CustomerPayType_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_CustomerPayType_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_CustomerPayType_CreateOrUpdate]
  @inId INT,
  @inCompanyId INT,
  @inName NVARCHAR(50),
  @inStatus TINYINT,
  @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
	  BEGIN
      SELECT @inId = ISNULL(MAX([ID]), 0) + 1 FROM [dbo].[FC_TIPOPAGOCLIENTE];
      
      INSERT INTO [dbo].[FC_TIPOPAGOCLIENTE]([ID], [CompanyId], [DESCRIPCION], [Status], [CreatedBy], [ModifiedBy])
      VALUES(@inId, @inCompanyId, @inName, @inStatus, @inUserId, @inUserId);
    END
	ELSE
	  BEGIN
        UPDATE [dbo].[FC_TIPOPAGOCLIENTE]
        SET [CompanyId] = @inCompanyId,
            [DESCRIPCION] = @inName,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [ID] = @inId;
      END

	SELECT @inId;
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'GEN_CUSTPAYTYPES', 'General', 'Customer Pay Types'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_CUSTPAYTYPES'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM(
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'GEN_CUSTPAYTYPES'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'FC_SP_OBTIENEUSUARIOSCAJA')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[FC_SP_OBTIENEUSUARIOSCAJA] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[FC_SP_OBTIENEUSUARIOSCAJA]
	@ID_EMPRESA AS int,
	@CAJA_ID AS int
AS 
BEGIN

	SELECT A.ID_EMPRESA, A.CAJA_ID, A.USUARIO, B.NOMBRE
	FROM FC_CAJAUSUARIO A 
	INNER JOIN USU_USUARIO B
	ON A.USUARIO = B.USUARIO
	WHERE A.CAJA_ID = @CAJA_ID and
	A.ID_EMPRESA = @ID_EMPRESA

END

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_GetUserByPointOfSaleId')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_GetUserByPointOfSaleId] AS RETURN')
END
GO
ALTER PROC BKO_GetUserByPointOfSaleId
	@CompanyId AS int,
	@PointOfSaleId AS int
AS 
BEGIN

	SELECT A.ID_EMPRESA as CompanyId, A.CAJA_ID PointOfSaleId, A.USUARIO [User], B.NOMBRE [UserNumber]
	FROM FC_CAJAUSUARIO A 
	INNER JOIN USU_USUARIO B
	ON A.USUARIO = B.USUARIO
	WHERE A.CAJA_ID = @PointOfSaleId and
	A.ID_EMPRESA = @CompanyId

END


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_InsertUserToCashier')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_InsertUserToCashier] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_InsertUserToCashier]
    @CompanyId INT,
    @PointOfSaleId INT,
    @User VARCHAR(50),
    @Exiest BIT OUTPUT
AS
BEGIN
    IF EXISTS(SELECT 1 FROM BKO_User WHERE Username = @User)
    BEGIN
        SET @Exiest = 1;

        IF EXISTS (
            SELECT 1 FROM FC_CAJAUSUARIO 
            WHERE ID_EMPRESA = @CompanyId 
              AND CAJA_ID = @PointOfSaleId 
              AND USUARIO = @User
        )
        BEGIN
            DELETE FROM FC_CAJAUSUARIO
            WHERE ID_EMPRESA = @CompanyId 
              AND CAJA_ID = @PointOfSaleId 
              AND USUARIO = @User;
        END
        ELSE
        BEGIN
            INSERT INTO FC_CAJAUSUARIO (ID_EMPRESA, CAJA_ID, USUARIO)
            VALUES (@CompanyId, @PointOfSaleId, @User);
        END
    END
    ELSE
    BEGIN
        SET @Exiest = 0;
    END

    RETURN @Exiest;
END
