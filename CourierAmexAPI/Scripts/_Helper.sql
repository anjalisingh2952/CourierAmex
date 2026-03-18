--GENERATE PERMISSION ENUM FOR ANGULAR
SELECT CONCAT('''', REPLACE([Name], ' ', ''), '''', ' = ''', [ID], '''', ',')
FROM BKO_Permission
GO

