INSERT INTO [dbo].[BKO_Permission]([Id],[Parent],[Name])
SELECT 'GEN_CASHIERS', 'General', 'Areas'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_CASHIERS'
);
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT [RoleId], [PermissionId], 1, 1, 1, 1
FROM(
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
	WHERE R.[Name] = 'System' AND PE.[Id] = 'GEN_CASHIERS'
) as t
WHERE [RoleId]=t.RoleId AND [PermissionId]=t.PermissionId
GO