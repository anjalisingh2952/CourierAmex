using System.Text.Json;
using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
	public class UserRepository : IUserRepository
	{
		private readonly IDalSession _session;

		public UserRepository(IDalSession session)
		{
			_session = session;
		}

		public async Task<IEnumerable<Permission>> GetPermissionsAsync(Guid id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Permission>("[dbo].[BKO_User_GetPermissionsById]", new
			{
				inId = id
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<User>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "")
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<User>("[dbo].[BKO_User_GetPaged]", new
			{
				inPageSize = pageSize,
				inPageIndex = pageIndex,
				inSortBy = orderBy,
				inFilterBy = filterBy
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<User?> GetByIdAsync(Guid id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_User_GetById]", new
			{
				inId = id
			}, null, null, System.Data.CommandType.StoredProcedure);

			var user = await multi.ReadSingleOrDefaultAsync<User>();
			if (user != null)
				user.Roles = (await multi.ReadAsync<Role>()).ToList();

			return user;
		}

		public async Task<User?> GetByResetKeyAsync(string resetKey)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryFirstOrDefaultAsync<User>("[dbo].[BKO_User_GetByResetKey]", new
			{
				inResetKey = resetKey
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<User?> LoginAsync(string email)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryFirstOrDefaultAsync<User>("[dbo].[BKO_User_ValidateLogin]", new
			{
				inEmail = email
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<User?> CreateOrUpdateAsync(User entity, Guid userId)
		{
			if (entity == null) throw new ArgumentNullException(nameof(entity));

			DateTime? dob = entity.DateOfBirth.HasValue && entity.DateOfBirth.Value > DateTime.MinValue ? entity.DateOfBirth.Value : null;
			short? countryId = entity.CountryId > 0 ? entity.CountryId : null;
			short? stateId = entity.StateId > 0 ? entity.StateId : null;
			short? sessionTimeout = entity.SessionTimeout > 0 ? entity.SessionTimeout : null;
			int? companyId = entity.CompanyId > 0 ? entity.CompanyId : null;
			Guid id = entity.Id;
			string roles = JsonSerializer.Serialize(entity?.Roles?.Select(x => new { x.Id }));

			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<Guid>("[dbo].[BKO_User_CreateOrUpdate]", new
			{
				inId = entity?.Id,
				inName = entity?.Name,
				inLastname = entity?.Lastname,
				inEmail = entity?.Email ?? "",
				inMobile = !string.IsNullOrEmpty(entity?.Mobile) ? entity.Mobile : "",
				inPhone = !string.IsNullOrEmpty(entity?.Phone) ? entity.Phone : "",
				inOffice = !string.IsNullOrEmpty(entity?.Office) ? entity.Office : "",
				inCountryId = countryId,
				inStateId = stateId,
				inCity = !string.IsNullOrEmpty(entity?.City) ? entity.City : "",
				inAddressLine1 = !string.IsNullOrEmpty(entity?.AddressLine1) ? entity.AddressLine1 : "",
				inAddressLine2 = !string.IsNullOrEmpty(entity?.AddressLine2) ? entity.AddressLine2 : "",
				inZip = entity?.Zip,
				inGender = entity?.Gender,
				inDateOfBirth = dob,
				inStatus = entity?.Status,
				inUsername = entity?.Username,
				inPasswordHash = entity?.PasswordHash != null && entity.PasswordHash.Length > 0 ? entity.PasswordHash : "NA",
				inCompanyId = companyId,
				inOperationType = entity?.OperationType ?? 0,
				inSessionTimeout = sessionTimeout,
				inChangePassword = entity?.ChangePassword ?? false,
				inRoles = roles,
				inUserId = userId
			}, null, null, System.Data.CommandType.StoredProcedure);

			if (Guid.TryParse(newId.ToString(), out Guid guidOutput) && entity?.Status != BaseEntityStatus.Deleted)
			{
				entity.Id = guidOutput;
			}

			return entity;
		}

		public async Task UpdateLoginDateAsync(User request)
		{
			var uom = _session.GetUnitOfWork();
			var connection = await uom.GetConnectionAsync();

			await connection.ExecuteAsync("[dbo].[BKO_User_UpdateLoginDate]", new
			{
				inId = request.Id,
				inIPAddress = request.LastIPAddress
			}, uom.GetTransaction(), null, System.Data.CommandType.StoredProcedure);
		}

		public async Task UpdateResetKeyAsync(User request)
		{
			var uom = _session.GetUnitOfWork();
			var connection = await uom.GetConnectionAsync();

			await connection.ExecuteAsync("[dbo].[BKO_User_UpdateResetKey]", new
			{
				inId = request.Id,
				inResetKey = request.ResetKey,
				inResetKeyExpireDate = request.ResetKeyExpireDate
			}, uom.GetTransaction(), null, System.Data.CommandType.StoredProcedure);
		}

		public async Task UpdatePasswordAsync(User request)
		{
			var uom = _session.GetUnitOfWork();
			var connection = await uom.GetConnectionAsync();

			await connection.ExecuteAsync("[dbo].[BKO_User_UpdatePassword]", new
			{
				inId = request.Id,
				inPassword = request.PasswordHash
			}, uom.GetTransaction(), null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<User>> ValidateUsernameAsync(Guid id, string username)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<User>("[dbo].[BKO_User_ValidateUsername]", new
			{
				inUserId = id,
				inUsername = username
			}, null, null, System.Data.CommandType.StoredProcedure);
		}
	}
}
