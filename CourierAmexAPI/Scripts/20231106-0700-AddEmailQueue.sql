SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_User]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[BKO_User](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](64) NOT NULL,
	[Lastname] [nvarchar](64) NOT NULL,
	[Email] [nvarchar](256) NULL,
	[Mobile] [nvarchar](24) NULL, 
	[Phone] [nvarchar](24) NULL,
	[Office] [nvarchar](24) NULL,
	[CountryId] [INT] NULL,
	[StateId] [INT] NULL,
	[AddressLine1] [nvarchar](164) NULL,
	[AddressLine2] [nvarchar](164) NULL,
	[City] [nvarchar](164) NULL,
	[Zip] [nvarchar](16) NULL,
	[Gender] [tinyint] NOT NULL DEFAULT(0), --0 NOTUSED 1-Unkown 2-Male 3-Female 4-Not Applicable
	[DateOfBirth] [datetime] NULL,
	[Username] [nvarchar](64) NOT NULL,
	[PasswordHash] [nvarchar](256) NOT NULL,
	[OperationType] [tinyint] NOT NULL DEFAULT(1),
	[CompanyId] [int] NULL,
	[SessionTimeout] [tinyint] NOT NULL DEFAULT(30),
	[ResetKey] [uniqueidentifier] NULL,
	[ResetKeyExpireDate] [datetime] NULL,
	[LastLoginDate] [datetime] NULL,
	[LastIPAddress] [nvarchar](24) NULL,
	[ChangePassword] [BIT] DEFAULT(0) NOT NULL,
	[Status] [tinyint] NOT NULL DEFAULT(0), --0 NOTUSED 1-Draft 2-Active 3-Inactive 4-Deleted
	[CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
	[CreatedBy] [uniqueidentifier] NULL,
	[ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE(),
	[ModifiedBy] [uniqueidentifier] NULL,
    CONSTRAINT [FK_BKO_User_PAI_PAIS] FOREIGN KEY ([CountryId]) REFERENCES [dbo].[PAI_PAIS]([ID]),
    CONSTRAINT [FK_BKO_User_CIUDAD] FOREIGN KEY ([StateId]) REFERENCES [dbo].[CIUDAD]([ID]),
	CONSTRAINT [FK_BKO_User_CreatedBy] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[BKO_User]([Id]),
	CONSTRAINT [FK_BKO_User_ModifiedBy] FOREIGN KEY ([ModifiedBy]) REFERENCES [dbo].[BKO_User]([Id]),
 	CONSTRAINT [PK_BKO_User_Id] PRIMARY KEY CLUSTERED ([Id] ASC)
	WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO
-- INSERT DEFAULT USER - Password: bh&*&ce3
INSERT INTO [dbo].[BKO_User]([Id], [Name], [Lastname], [Email], [Username], [Status], [PasswordHash])
SELECT NEWID(), 'Courier', 'Amex', 'info@courieramex.com', 'admin', 2, 'AQAAAAEAAAPoAAAAEAO+UTlLHs2HP9/+CBlGUGFPmoMTm0eVdr/DeTkjOF4KsscwV0oNsdqf+k3Ptxje5g=='
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_User]
	WHERE [Email]='info@courieramex.com'
);
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_EmailQueue]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[BKO_EmailQueue] (
	[Id] [uniqueidentifier] NOT NULL,
	[ToAddress] [nvarchar](256) NOT NULL,
	[Subject] [nvarchar](256) NOT NULL,
	[EmailTitle] [nvarchar](64) NOT NULL,
	[EmailBody] [text] NOT NULL,
	[IsHtml] [bit] NOT NULL DEFAULT(1),
	[HasAttachment] [bit] NOT NULL DEFAULT(0),
	[Attachment] [nvarchar](MAX) NULL,
	[AttachmentType] TINYINT NULL,
	[CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
	[SendDate] DATETIME NULL,
	[Error] [nvarchar](256) NULL,
	[Status] [tinyint] NOT NULL DEFAULT(0), --0-Pending 1-Sent 2-Error
 	CONSTRAINT [PK_BKO_EmailQueue_Id] PRIMARY KEY CLUSTERED ([Id] ASC)
	WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_EmailQueue_GetByStatus')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_EmailQueue_GetByStatus] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_EmailQueue_GetByStatus]
	@inStatus TINYINT
AS
	SET NOCOUNT ON;

	SELECT *
	FROM [dbo].[BKO_EmailQueue]
	WHERE [Status] = @inStatus;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_EmailQueue_Create')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_EmailQueue_Create] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_EmailQueue_Create]
	@inToAddress VARCHAR(256),
	@inSubject VARCHAR(256),
	@inEmailTitle VARCHAR(64),
	@inEmailBody TEXT,
	@inIsHtml BIT,
	@inHasAttachment BIT,
	@inAttachment NVARCHAR(MAX),
	@inAttachmentType TINYINT,
	@inStatus TINYINT
AS
	INSERT INTO [dbo].[BKO_EmailQueue]([Id], [ToAddress], [Subject], [EmailTitle], [EmailBody], [IsHtml], [HasAttachment], [Attachment], [AttachmentType], [Status])
	VALUES (NEWID(), @inToAddress, @inSubject, @inEmailTitle, @inEmailBody, @inIsHtml, @inHasAttachment, @inAttachment, @inAttachmentType, @inStatus);
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_EmailQueue_Update')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_EmailQueue_Update] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_EmailQueue_Update]
	@inId UNIQUEIDENTIFIER,
	@inError VARCHAR(MAX),
	@inStatus tinyint
AS
	UPDATE [dbo].[BKO_EmailQueue]
	SET [SendDate] = GETDATE(),
		[Error] = @inError,
		[Status] = @inStatus
	WHERE [Id] = @inId
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Status' AND Object_ID = Object_ID(N'dbo.PAI_PAIS'))
BEGIN
	ALTER TABLE dbo.PAI_PAIS ADD [Status] [tinyint] NOT NULL DEFAULT(0);
END;
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'dbo.PAI_PAIS'))
BEGIN
	ALTER TABLE dbo.PAI_PAIS ADD [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE();
END;
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns  WHERE Name = N'CreatedBy' AND Object_ID = Object_ID(N'dbo.PAI_PAIS'))
BEGIN
	ALTER TABLE [PAI_PAIS] ADD [CreatedBy] [uniqueidentifier] NULL;
END;
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns  WHERE Name = N'ModifiedAt' AND Object_ID = Object_ID(N'dbo.PAI_PAIS'))
BEGIN
	ALTER TABLE [PAI_PAIS] ADD [ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE();
END;
GO

IF NOT EXISTS(SELECT 1 FROM sys.columns  WHERE Name = N'ModifiedBy' AND Object_ID = Object_ID(N'dbo.PAI_PAIS'))
BEGIN
	ALTER TABLE [PAI_PAIS] ADD [ModifiedBy] [uniqueidentifier] NULL;
END;
GO

--IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE Name = N'FK_PAI_PAIS_CreatedBy' AND object_id = Object_ID(N'dbo.PAI_PAIS') AND type = 'F') 
--BEGIN
--	ALTER TABLE [dbo].[PAI_PAIS]
--	ADD CONSTRAINT [FK_PAI_PAIS_CreatedBy] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[BKO_User]([Id]);
--END
--GO

--IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE Name = N'FK_PAI_PAIS_ModifiedBy' AND object_id = Object_ID(N'dbo.PAI_PAIS') AND type = 'F') 
--BEGIN
--	ALTER TABLE [dbo].[PAI_PAIS]
--	ADD CONSTRAINT [FK_PAI_PAIS_ModifiedBy] FOREIGN KEY ([ModifiedBy]) REFERENCES [dbo].[BKO_User]([Id]);
--END;
--GO

UPDATE [dbo].[PAI_PAIS] SET [Status] = 2;

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_Permission]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[BKO_Permission] (
	[Id] [nvarchar](24) NOT NULL,
	[Parent] [nvarchar](64) NOT NULL,
	[Name] [nvarchar](64) NOT NULL,
	CONSTRAINT [PK_BKO_Permission] PRIMARY KEY CLUSTERED ([Id] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

INSERT INTO [dbo].[BKO_Permission]([Id], [Parent], [Name])
SELECT 'GEN_CONTROLCODES', 'General', 'Control Codes'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_CONTROLCODES'
);
SELECT 'GEN_COUNTRIES', 'General', 'Countries'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_COUNTRIES'
);
SELECT 'GEN_STATES', 'General', 'States'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='GEN_STATES'
);
SELECT 'USR_ROLES', 'Users', 'Roles'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='USR_ROLES'
);
SELECT 'USR_USERS', 'Users', 'Users'
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_Permission]
	WHERE [Id]='USR_USERS'
);
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_Role]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[BKO_Role](
	[Id] [uniqueidentifier] NOT NULL DEFAULT NEWID(),
	[CompanyId] INT NOT NULL,
	[Name] [varchar](64) NOT NULL,
	[Status] [tinyint] NOT NULL DEFAULT(0), --0-NOTUSED 1-Draft 2-Active 3-Inactive 4-Deleted
	[CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
  [CreatedBy] [uniqueidentifier] NOT NULL,
	[ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE(),
  [ModifiedBy] [uniqueidentifier] NOT NULL,
  CONSTRAINT [FK_BKO_Role_CompanyId] FOREIGN KEY ([CompanyId]) REFERENCES [dbo].[EMP_EMPRESA]([ID]),
	CONSTRAINT [FK_BKO_Role_CreatedBy] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[BKO_User]([Id]),
  CONSTRAINT [FK_BKO_Role_ModifiedBy] FOREIGN KEY ([ModifiedBy]) REFERENCES [dbo].[BKO_User]([Id]),
  CONSTRAINT [PK_BKO_Role_Id] PRIMARY KEY CLUSTERED ([Id] ASC)
	WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

INSERT INTO [dbo].[BKO_Role]([Id], [Name], [Status], [CreatedBy], [ModifiedBy])
SELECT NEWID(), 'System', 2, [Id], [Id]
FROM [dbo].[BKO_User]
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_User]
	WHERE [Name]='System'
);
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_RolePermission]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[BKO_RolePermission](
	[RoleId] [uniqueidentifier] NOT NULL,
	[PermissionId] [NVARCHAR](24) NOT NULL,
	[View] [bit] NOT NULL DEFAULT(0),
	[Add] [bit] NOT NULL DEFAULT(0),
	[Update] [bit] NOT NULL DEFAULT(0),
	[Delete] [bit] NOT NULL DEFAULT(0),
	CONSTRAINT [FK_BKO_RolePermission_BKO_Role] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[BKO_Role]([Id]),
	CONSTRAINT [FK_BKO_RolePermission_BKO_Permission] FOREIGN KEY ([PermissionId]) REFERENCES [dbo].[BKO_Permission]([Id]),
	CONSTRAINT [PK_BKO_RolePermission_Id] PRIMARY KEY CLUSTERED ([RoleId], [PermissionId] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
SELECT RoleId, PermissionId, 1, 1, 1, 1
FROM (
	SELECT R.[Id] as RoleId, Pe.[Id] as PermissionId
	FROM [dbo].[BKO_Role] R, [dbo].[BKO_Permission] Pe
) as t
WHERE NOT EXISTS (
	SELECT 1 FROM [dbo].[BKO_RolePermission]
	WHERE RoleId=t.RoleId AND PermissionId=t.PermissionId
);
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_UserRole]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[BKO_UserRole](
	[UserId] [uniqueidentifier] NOT NULL,
	[RoleId] [uniqueidentifier] NOT NULL
	CONSTRAINT [FK_BKO_UserRole_BKO_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[BKO_User]([Id]),
	CONSTRAINT [FK_BKO_UserRole_BKO_Role] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[BKO_Role]([Id]),
	CONSTRAINT [PK_BKO_UserRole_Id] PRIMARY KEY CLUSTERED ([UserId], [RoleId] ASC)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

INSERT INTO [dbo].[BKO_UserRole]([UserId], [RoleId])
SELECT UserId, RoleId
FROM (
	SELECT U.[Id] as UserId, R.[Id] as RoleId
	FROM [dbo].[BKO_User] U, [dbo].[BKO_Role] R
) as t
WHERE NOT EXISTS (
	SELECT 1
	FROM [dbo].[BKO_UserRole]
	WHERE [UserId]=t.UserId AND [RoleId]=t.RoleId
);
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BKO_SystemSetting]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[BKO_SystemSetting](
	[Id] [nvarchar](24) NOT NULL,
	[Description] [nvarchar](256) NULL,
	[Value] [nvarchar](1000) NULL,
	[Type] [SMALLINT] NOT NULL DEFAULT(0), --0-TEXT 1-NUMBER 2-BOOLEAN 3-PASSWORD
	[DisplayOrder] [SMALLINT] NOT NULL DEFAULT(0),
	[CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
	[CreatedBy] [uniqueidentifier] NULL,
	[ModifiedAt] [datetime] NOT NULL DEFAULT GETDATE(),
	[ModifiedBy] [uniqueidentifier] NULL,
	CONSTRAINT [FK_BKO_SystemSetting_CreatedBy] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[BKO_User]([Id]),
	CONSTRAINT [FK_BKO_SystemSetting_ModifiedBy] FOREIGN KEY ([ModifiedBy]) REFERENCES [dbo].[BKO_User]([Id]),
 	CONSTRAINT [PK_BKO_SystemSetting_Id] PRIMARY KEY CLUSTERED ([Id] ASC)
	WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
END
GO

DECLARE @UserId uniqueidentifier
SELECT @UserId = [Id] FROM [dbo].[BKO_User];

INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'General_AppName', 'App Name', '', 0, 0, GETDATE(), @UserId, GETDATE(), @UserId
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'General_WebUrl', 'Web Site Url', '', 0, 1, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='General_WebUrl');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_Enable', 'Enable Send Emails', 'false', 2, 2, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_Enable');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_SmtpServer', 'SMTP Server', '', 0, 3, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_SmtpServer');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_SmtpServerPort', 'SMTP Server Port', NULL, 1, 4, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_SmtpServerPort');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_EnableSsl', 'Enable SSL', 'false', 2, 5, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_EnableSsl');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_EmailDisplayName', 'Sender Email Display Name', '', 0, 6, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_EmailDisplayName');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_SmtpUserName', 'SMTP User Name', '', 0, 7, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_SmtpUserName');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_SmtpPassword', 'SMTP User Password', '', 3, 8, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_SmtpPassword');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_SendersName', 'Sender Name', '', 0, 9, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_SendersName');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_IsProduction', 'Is Email Service for Production', 'false', 2, 10, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_IsProduction');
INSERT INTO [dbo].[BKO_SystemSetting]([Id], [Description], [Value], [Type], [DisplayOrder], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy])
SELECT 'Email_TestEmailAddress', 'Test Account for Receive Emails', '', 0, 11, GETDATE(), @UserId, GETDATE(), @UserId
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[BKO_SystemSetting] WHERE Id='Email_TestEmailAddress');
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF OBJECT_ID (N'dbo.udf_GetDateAbsoluteStart') IS NOT NULL
    DROP FUNCTION [dbo].[udf_GetDateAbsoluteStart]
GO
CREATE FUNCTION [dbo].[udf_GetDateAbsoluteStart]
(
    @inDate DATETIME
)
RETURNS DATETIME
AS
BEGIN;
	RETURN CAST(CAST(@inDate AS DATE) AS DATETIME);
END;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
IF OBJECT_ID (N'dbo.udf_GetDateAbsoluteEnd') IS NOT NULL
    DROP FUNCTION [dbo].[udf_GetDateAbsoluteEnd]
GO
CREATE FUNCTION [dbo].[udf_GetDateAbsoluteEnd]
(
    @inDate DATETIME
)
RETURNS DATETIME
AS
BEGIN;
	RETURN DATEADD(MILLISECOND, -2, DATEADD(DAY, 1, [dbo].[udf_GetDateAbsoluteStart](GETDATE())));
END;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Country_GetAll')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Country_GetAll] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Country_GetAll]
AS
	SET NOCOUNT ON;

	SELECT [ID] 'Id', [Nombre] 'Name', [OBSERVACIONES] 'Notes', [INICIAL] 'Shortname', [NUMERO] 'Code', [DIRECCION] 'Address'
	FROM [dbo].[PAI_PAIS]
	WHERE [Status] = 2;

	SET NOCOUNT OFF;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Country_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_Country_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Country_GetById]
	@inId INT
AS
	SET NOCOUNT ON;

	SELECT [Nombre] 'Name', [OBSERVACIONES] 'Notes', [INICIAL] 'Shortname', [NUMERO] 'Code', [DIRECCION] 'Address', *
	FROM [dbo].[PAI_PAIS]
	WHERE [Id] = @inId

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Country_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Country_GetPaged] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Country_GetPaged]
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'Name ASC' THEN [Nombre] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN [Nombre] END DESC,
            CASE WHEN @inSortBy = 'Shortname ASC' THEN [INICIAL] END ASC,
            CASE WHEN @inSortBy = 'Shortname DESC' THEN [INICIAL] END DESC,
            CASE WHEN @inSortBy = 'Code ASC' THEN [NUMERO] END ASC,
            CASE WHEN @inSortBy = 'Code DESC' THEN [NUMERO] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
        ) AS [RowNum], [ID] 'Id', [Nombre] 'Name', [OBSERVACIONES] 'Notes', [INICIAL] 'Shortname', [NUMERO] 'Code', [DIRECCION] 'Address', 
            [Status],
            COUNT(*) OVER() [TotalRows]
        FROM [dbo].[PAI_PAIS] WITH(NOLOCK)
        WHERE ([Nombre] LIKE '%' + @inFilterBy + '%'
            OR [OBSERVACIONES] LIKE '%' + @inFilterBy + '%'
            OR [INICIAL] LIKE '%' + @inFilterBy + '%'
            OR [NUMERO] LIKE '%' + @inFilterBy + '%')
            AND [Status] != 4  -- DON'T RETURN DELETED
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
        CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
        CASE WHEN @inSortBy = 'Shortname ASC' THEN [Shortname] END ASC,
        CASE WHEN @inSortBy = 'Shortname DESC' THEN [Shortname] END DESC,
        CASE WHEN @inSortBy = 'Code ASC' THEN [Code] END ASC,
        CASE WHEN @inSortBy = 'Code DESC' THEN [Code] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO


IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Country_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Country_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Country_CreateOrUpdate]
    @inId INT,
    @inName NVARCHAR(100),
    @inShortName NVARCHAR(6),
    @inCode INT,
    @inNotes NVARCHAR(2000),
    @inAddress NVARCHAR(2000),
    @inStatus TINYINT,
    @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, 0) = 0) 
      BEGIN
        INSERT INTO [dbo].[PAI_PAIS]([NOMBRE], [INICIAL], [NUMERO], [OBSERVACIONES], [DIRECCION], [Status], [CreatedBy], [ModifiedBy])
        VALUES (@inName, @inShortName, @inCode, @inNotes, @inAddress, @inStatus, @inUserId, @inUserId);

        SELECT @inID = SCOPE_IDENTITY()
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[PAI_PAIS]
        SET [NOMBRE] = @inName, 
            [INICIAL] = @inShortName, 
            [NUMERO] = @inCode,
            [OBSERVACIONES] = @inNotes,
            [DIRECCION] = @inAddress,
            [Status] = @inStatus,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [Id] = @inId;
		END

	SELECT @inId;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Permission_GetAll')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Permission_GetAll] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Permission_GetAll]
AS
	SET NOCOUNT ON;

	SELECT *
	FROM [dbo].[BKO_Permission];

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_SystemSetting_GetAll')
  BEGIN
	  EXEC('CREATE PROCEDURE [dbo].[BKO_SystemSetting_GetAll] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_SystemSetting_GetAll]
AS
	SET NOCOUNT ON;

	SELECT *
	FROM [dbo].[BKO_SystemSetting]
    ORDER BY [DisplayOrder] ASC;

	SET NOCOUNT OFF;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_SystemSetting_BulkUpdate')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_SystemSetting_BulkUpdate] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_SystemSetting_BulkUpdate]
	@inData VARCHAR(MAX),
	@inUserId UNIQUEIDENTIFIER
AS
	SET NOCOUNT ON;

	WITH Json_data AS
	(
		SELECT [Id], [Value]
		FROM OPENJSON(@inData)
		WITH ([Id] NVARCHAR(24), [Value] NVARCHAR(MAX))
	)
	UPDATE S 
	SET S.[Value] = JD.[Value],
		S.[ModifiedAt] = GETDATE(),
		S.[ModifiedBy] = @inUserId
	FROM [dbo].[BKO_SystemSetting] S
	  INNER JOIN Json_data AS JD ON JD.[Id] = S.[Id]

	SET NOCOUNT OFF;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_ValidateLogin')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_User_ValidateLogin] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_User_ValidateLogin]
	@inEmail NVARCHAR(256)
AS
	SET NOCOUNT ON;

	SELECT *
	FROM [dbo].[BKO_User]
	WHERE [Email] = @inEmail OR [Username] = @inEmail
		AND [Status] = 2; --ONLY ACTIVE USERS

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_UpdateLoginDate')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_User_UpdateLoginDate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_User_UpdateLoginDate]
	@inId UNIQUEIDENTIFIER,
	@inIPAddress VARCHAR(256)
AS
	SET NOCOUNT ON;

	UPDATE [dbo].[BKO_User]
	SET [ResetKey] = NULL,
		[ResetKeyExpireDate] = NULL,
		[LastLoginDate] = GETDATE(),
		[LastIPAddress] = @inIPAddress
	WHERE [Id] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_UpdateResetKey')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_User_UpdateResetKey] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_User_UpdateResetKey]
	@inId UNIQUEIDENTIFIER,
	@inResetKey UNIQUEIDENTIFIER,
	@inResetKeyExpireDate DATETIME
AS
	SET NOCOUNT ON;

	UPDATE [dbo].[BKO_User]
	SET [ResetKey] = @inResetKey,
		[ResetKeyExpireDate] = @inResetKeyExpireDate
	WHERE [Id] = @inId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_GetByResetKey')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_User_GetByResetKey] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_User_GetByResetKey]
	@inResetKey UNIQUEIDENTIFIER
AS
	SET NOCOUNT ON;

	SELECT *
	FROM [dbo].[BKO_User]
	WHERE [ResetKey] = @inResetKey
		AND [Status] = 2; --ONLY ACTIVE USER

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Role_GetAllActive')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Role_GetAllActive] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_Role_GetAllActive]
    @inCompanyId INT
AS
	SET NOCOUNT ON;

	SELECT *
    FROM [dbo].[BKO_Role]
    WHERE [Status] = 2
      AND [Name] != 'System'
      AND [CompanyId] = @inCompanyId;

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Role_GetById')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Role_GetById] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Role_GetById]
    @inId VARCHAR(64)
AS
	SET NOCOUNT ON;

	SELECT *
	FROM [dbo].[BKO_Role]
	WHERE [Id] = CAST(@inId AS UNIQUEIDENTIFIER);

	SELECT P.*, RP.[View], RP.[Add], RP.[Update], RP.[Delete]
	FROM [dbo].[BKO_Permission] P
	LEFT OUTER JOIN [dbo].[BKO_RolePermission] RP ON (P.[Id] = RP.[PermissionId] AND RP.[RoleId] = CAST(@inId AS UNIQUEIDENTIFIER));

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Role_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Role_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Role_GetPaged]
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64),
    @inCompanyId INT
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'CompanyName ASC' THEN E.[EMPRESA] END ASC,
            CASE WHEN @inSortBy = 'CompanyName DESC' THEN E.[EMPRESA] END DESC,
            CASE WHEN @inSortBy = 'Name ASC' THEN R.[Name] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN R.[Name] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN R.[Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN R.[Status] END DESC
        ) AS [RowNum], R.*, E.[EMPRESA] 'CompanyName', COUNT(*) OVER() [TotalRows]
        FROM [dbo].[BKO_Role] R WITH(NOLOCK)
          LEFT OUTER JOIN [dbo].[EMP_EMPRESA] E ON (R.[CompanyId] = E.[ID])
        WHERE R.[Name] LIKE '%' + @inFilterBy + '%'
            AND R.[Name] != 'System' -- DON'T RETURN SYSTEM PROFILE
            AND R.[Status] != 4 -- DON'T RETURN DELETED PROFILES
            AND (@inCompanyId = 0 OR R.[CompanyId] = @inCompanyId)
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'CompanyName ASC' THEN [CompanyName] END ASC,
        CASE WHEN @inSortBy = 'CompanyName DESC' THEN [CompanyName] END DESC,
        CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
        CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_Role_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_Role_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_Role_CreateOrUpdate]
    @inId UNIQUEIDENTIFIER,
    @inCompanyId INT,
    @inName VARCHAR(64),
    @inStatus TINYINT,
    @inRolePermissions NVARCHAR(MAX),
    @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, CAST(0x0 AS uniqueidentifier)) = CAST(0x0 AS uniqueidentifier)) 
		BEGIN
			SET @inId = NEWID();

			INSERT INTO [dbo].[BKO_Role]([Id], [CompanyId], [Name], [Status], [CreatedBy], [ModifiedBy])
			VALUES (@inId, @inCompanyId, @inName, @inStatus, @inUserId, @inUserId);
		END
	ELSE
	  BEGIN
			UPDATE [dbo].[BKO_Role]
			SET [Name] = @inName, 
				[CompanyId] = @inCompanyId,
				[Status] = @inStatus,
				[ModifiedAt] = GETDATE(),
				[ModifiedBy] = @inUserId
			WHERE [Id] = @inId;
		END

    DELETE FROM [dbo].[BKO_RolePermission]
    WHERE [RoleId] = @inId;

    INSERT INTO [dbo].[BKO_RolePermission]([RoleId], [PermissionId], [View], [Add], [Update], [Delete])
    SELECT @inId, [Id], [View], [Add], [Update], [Delete]
    FROM OPENJSON(@inRolePermissions)
    WITH ([Id] NVARCHAR(24), [View] bit, [Add] bit, [Update] bit, [Delete] bit);

	SELECT @inId;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_GetPermissionsById')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_User_GetPermissionsById] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_User_GetPermissionsById]
    @inId UNIQUEIDENTIFIER
AS
	SET NOCOUNT ON;

    WITH CTE_USERROLES AS
    (
        SELECT [RoleId]
        FROM [dbo].[BKO_UserRole]
        WHERE [UserId] = @inId
    ),
    CTE_PERMISSIONS AS
    (
        SELECT P.[Id], RP.[View], RP.[Add], RP.[Update], RP.[Delete]
        FROM [dbo].[BKO_RolePermission] RP WITH(NOLOCK)
            INNER JOIN [dbo].[BKO_Permission] P WITH(NOLOCK) ON (RP.[PermissionId] = P.[Id])
        WHERE RP.[RoleId] IN (
            SELECT [RoleId]
            FROM CTE_USERROLES
        )
    )
    SELECT DISTINCT [Id], [View], [Add], [Update], [Delete]
    FROM CTE_PERMISSIONS

SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_GetById')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_User_GetById] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_User_GetById]
	@inId UNIQUEIDENTIFIER
AS
	SET NOCOUNT ON;

	SELECT *
	FROM [dbo].[BKO_User] WITH(NOLOCK)
	WHERE [Id] = @inId;

	SELECT R.*, CASE WHEN UR.RoleId IS NULL THEN 0 ELSE 1 END 'IsSelected'
	FROM [dbo].[BKO_Role] R WITH(NOLOCK)
      LEFT OUTER JOIN [dbo].[BKO_UserRole] UR WITH(NOLOCK) ON (R.[Id] = UR.[RoleId] AND UR.[UserId] = @inId)
    WHERE R.[Status] = 2 AND R.[Name] != 'System';

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_UpdatePassword')
  BEGIN
	EXEC('CREATE PROCEDURE [dbo].[BKO_User_UpdatePassword] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_User_UpdatePassword]
	@inId UNIQUEIDENTIFIER,
	@inPassword VARCHAR(256)
AS
	UPDATE [dbo].[BKO_User]
	SET [PasswordHash] = @inPassword,
		[ResetKey] = NULL,
		[ResetKeyExpireDate] = NULL
	WHERE [Id] = @inId;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_GetPaged')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_User_GetPaged] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_User_GetPaged]
    @inPageSize SMALLINT,
    @inPageIndex SMALLINT,
    @inSortBy VARCHAR(64),
    @inFilterBy VARCHAR(64)
AS
	SET NOCOUNT ON;
    
    WITH CTE_Data AS
    (
        SELECT ROW_NUMBER() OVER(ORDER BY 
            CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
            CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
            CASE WHEN @inSortBy = 'Lastname ASC' THEN [Lastname] END ASC,
            CASE WHEN @inSortBy = 'Lastname DESC' THEN [Lastname] END DESC,
            CASE WHEN @inSortBy = 'Email ASC' THEN [Email] END ASC,
            CASE WHEN @inSortBy = 'Email DESC' THEN [Email] END DESC,
            CASE WHEN @inSortBy = 'Username ASC' THEN [Username] END ASC,
            CASE WHEN @inSortBy = 'Username DESC' THEN [Username] END DESC,
            CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
            CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
        ) AS [RowNum], U.*, COUNT(*) OVER() [TotalRows]
        FROM [dbo].[BKO_User] U WITH(NOLOCK)
        WHERE (U.[Name] LIKE '%' + @inFilterBy + '%'
            OR U.[Lastname] LIKE '%' + @inFilterBy + '%'
            OR U.[Email] LIKE '%' + @inFilterBy + '%'
			OR U.[Username] LIKE '%' + @inFilterBy + '%')
            AND U.[Username] != 'admin' -- DON'T RETURN SYSTEM USER
            AND U.[Status] != 4 -- DON'T RETURN DELETED USERS
    )
    SELECT D.*
    FROM CTE_Data D
    ORDER BY 
        CASE WHEN @inSortBy = 'Name ASC' THEN [Name] END ASC,
        CASE WHEN @inSortBy = 'Name DESC' THEN [Name] END DESC,
        CASE WHEN @inSortBy = 'Lastname ASC' THEN [Lastname] END ASC,
        CASE WHEN @inSortBy = 'Lastname DESC' THEN [Lastname] END DESC,
        CASE WHEN @inSortBy = 'Email ASC' THEN [Email] END ASC,
        CASE WHEN @inSortBy = 'Email DESC' THEN [Email] END DESC,
        CASE WHEN @inSortBy = 'Username ASC' THEN [Username] END ASC,
        CASE WHEN @inSortBy = 'Username DESC' THEN [Username] END DESC,
        CASE WHEN @inSortBy = 'Status ASC' THEN [Status] END ASC,
        CASE WHEN @inSortBy = 'Status DESC' THEN [Status] END DESC
    OFFSET @inPageSize * (@inPageIndex - 1) ROWS FETCH NEXT @inPageSize ROWS ONLY

	SET NOCOUNT OFF; 
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_CreateOrUpdate')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_User_CreateOrUpdate] AS RETURN')
END
GO
ALTER PROCEDURE [dbo].[BKO_User_CreateOrUpdate]
    @inId UNIQUEIDENTIFIER,
	@inName NVARCHAR(64),
    @inLastname NVARCHAR(64),
    @inEmail NVARCHAR(256),
    @inMobile NVARCHAR(24),
    @inPhone NVARCHAR(24),
    @inOffice NVARCHAR(24),
    @inCountryId SMALLINT,
    @inStateId SMALLINT,
    @inAddressLine1 NVARCHAR(164),
    @inAddressLine2 NVARCHAR(164),
    @inCity NVARCHAR(164),
    @inZip NVARCHAR(16),
    @inGender TINYINT,
    @inDateOfBirth DATETIME,
    @inStatus TINYINT,
	@inUsername NVARCHAR(64),
    @inPasswordHash NVARCHAR(256),
	@inCompanyId INT,
	@inOperationType TINYINT,
	@inSessionTimeout TINYINT,
    @inChangePassword BIT,
    @inRoles NVARCHAR(MAX),
    @inUserId UNIQUEIDENTIFIER
AS
	IF (ISNULL(@inId, CAST(0x0 AS uniqueidentifier)) = CAST(0x0 AS uniqueidentifier)) 
	  BEGIN
        SET @inId = NEWID();

        INSERT INTO [dbo].[BKO_User]([Id], [Name], [Lastname], [Email], [Mobile], [Phone], [Office], [CountryId], [StateId], [AddressLine1], [AddressLine2], [City], [Zip], [Gender], [DateOfBirth], [Username], [PasswordHash], [CompanyId], [OperationType], [SessionTimeout], [ChangePassword], [Status], [CreatedBy], [ModifiedBy])
        VALUES(@inId, @inName, @inLastname, @inEmail, @inMobile, @inPhone, @inOffice, @inCountryId, @inStateId, @inAddressLine1, @inAddressLine2, @inCity, @inZip, @inGender, @inDateOfBirth, @inUsername, @inPasswordHash, @inCompanyId, @inOperationType, @inSessionTimeout, @inChangePassword, @inStatus, @inUserId, @inUserId);
      END
	ELSE
	  BEGIN
        UPDATE [dbo].[BKO_User]
        SET [Name] = @inName, 
            [Lastname] = @inLastname,
            [Email] = @inEmail, 
            [Mobile] = @inMobile, 
            [Phone] = @inPhone, 
            [Office] = @inOffice, 
            [CountryId] = @inCountryId, 
            [StateId] = @inStateId, 
            [AddressLine1] = @inAddressLine1,
            [AddressLine2] = @inAddressLine2,
            [City] = @inCity,
            [Zip] = @inZip, 
            [Gender] = @inGender, 
            [DateOfBirth] = @inDateOfBirth,
            [Status] = @inStatus,
			[Username] = @inUsername,
            [PasswordHash] = @inPasswordHash,
			[CompanyId] = @inCompanyId,
			[OperationType] = @inOperationType,
			[SessionTimeout] = @inSessionTimeout,
            [ChangePassword] = @inChangePassword,
            [ModifiedAt] = GETDATE(),
            [ModifiedBy] = @inUserId
        WHERE [Id] = @inId;
      END

    EXEC [dbo].[BKO_UserRole_AssignToUser] @inId, @inRoles

	SELECT @inId;
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_User_ValidateUsername')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_User_ValidateUsername] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_User_ValidateUsername]
    @inUserId UNIQUEIDENTIFIER,
    @inUsername NVARCHAR(64)
AS
  BEGIN
    SELECT [Id]
    FROM [dbo].[BKO_User] WITH(NOLOCK)
    WHERE [Username] = @inUsername
        AND [Id] != @inUserId
        AND [Status] != 4; --NOT DELETED ONES
  END
GO

IF NOT EXISTS (SELECT NAME FROM sys.objects WHERE TYPE = 'P' AND NAME = 'BKO_UserRole_AssignToUser')
  BEGIN
    EXEC('CREATE PROCEDURE [dbo].[BKO_UserRole_AssignToUser] AS RETURN')
  END
GO
ALTER PROCEDURE [dbo].[BKO_UserRole_AssignToUser]
    @inUserId UNIQUEIDENTIFIER,
    @inRoles NVARCHAR(MAX)
AS
  BEGIN
    DELETE FROM [dbo].[BKO_UserRole]
    WHERE [UserId] = @inUserId;

    INSERT INTO [dbo].[BKO_UserRole] ([UserId], [RoleId])
    SELECT @inUserId, [Id]
    FROM OPENJSON(@inRoles)
    WITH ([Id] UNIQUEIDENTIFIER);
  END
GO