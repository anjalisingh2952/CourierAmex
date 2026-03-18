IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_PackageCategory_Update')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_PackageCategory_Update] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_PackageCategory_Update]
    @inCompanyId INT,
	@inNumber BIGINT,
	@inCategory  VARCHAR(1),
	@inUserId UNIQUEIDENTIFIER

AS
	
	UPDATE [dbo].[PAQ_PAQUETE]
	Set
		[CATEGORIA] = @inCategory,
		[ModifiedAt] = GETDATE(),
		[ModifiedBy] = @inUserId
    Where [CompanyId] = @inCompanyId
	And [NUMERO] = @inNumber
		
GO
