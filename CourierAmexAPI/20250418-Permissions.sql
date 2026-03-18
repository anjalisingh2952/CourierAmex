--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Generate Invoice----------------------------------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'INV_GENERATE_INVOICE', 'Invoice', 'Generate Invoice'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='INV_GENERATE_INVOICE'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'INV_GENERATE_INVOICE'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Customer Service-----------------
--------------------------------------------------------------------------

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'CUST_COSTOMER_SERVICE', 'Customers', 'Customer Service'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='CUST_COSTOMER_SERVICE'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'CUST_COSTOMER_SERVICE'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Package Scanning-----------------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'MNFT_PACKAGE_SCANNING', 'Manifest', 'Package Scanning'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='MNFT_PACKAGE_SCANNING'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'MNFT_PACKAGE_SCANNING'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Summary--------------------------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_SUMMARY', 'Reports', 'Summary'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_SUMMARY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_SUMMARY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO

--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Manifest Report Observations-----
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_MNF_OBSERVATIONS', 'Reports', 'Manifest Report Observations'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_MNF_OBSERVATIONS'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_MNF_OBSERVATIONS'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO



--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Detailed Billing-----------------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_DETAILED_BILLING', 'Reports', 'Detailed Billing'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_DETAILED_BILLING'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_DETAILED_BILLING'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Courier Deconsolidation----------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_COUR_DECONSOLIDATION', 'Reports', 'Courier Deconsolidation'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_COUR_DECONSOLIDATION'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_COUR_DECONSOLIDATION'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
--------------------------PERMISSIONS-Pending Manifest/Pre Study----------
--------------------------------------------------------------------------


INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_PND_MNF_PRE_STUDY', 'Reports', 'Pending Manifest/Pre Study'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_PND_MNF_PRE_STUDY'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_PND_MNF_PRE_STUDY'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


--------------------------------------------------------------------------
-----------------------------PERMISSIONS-Credit Pending-------------------
--------------------------------------------------------------------------

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'RPT_CREDIT_PENDING', 'Reports', 'Credit Pending'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='RPT_CREDIT_PENDING'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'RPT_CREDIT_PENDING'
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_RolePermission]
	WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
);
GO


