using System.Text.Json;
using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
	public class RoleRepository : IRoleRepository
	{
		private readonly IDalSession _session;

		public RoleRepository(IDalSession session)
		{
			_session = session;
		}

		public async Task<IEnumerable<Role>> GetAllActiveAsync(int companyId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Role>("[dbo].[BKO_Role_GetAllActive]", new {
				inCompanyId = companyId
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<Role>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Role>("[dbo].[BKO_Role_GetPaged]", new
			{
				inPageSize = pageSize,
				inPageIndex = pageIndex,
				inSortBy = orderBy,
				inFilterBy = filterBy,
				inCompanyId = companyId
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<Role?> GetByIdAsync(Guid id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_Role_GetById]", new
			{
				inId = id
			}, null, null, System.Data.CommandType.StoredProcedure);

			var role = await multi.ReadSingleOrDefaultAsync<Role>();
			if (role != null)
				role.RolePermissions = (await multi.ReadAsync<Permission>()).ToList();

			return role;
		}

		public async Task<Role?> CreateOrUpdateAsync(Role entity, Guid userId)
		{
			string rolePermissions = JsonSerializer.Serialize(entity.RolePermissions);

			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<Guid>("[dbo].[BKO_Role_CreateOrUpdate]", new
			{
				inId = entity.Id,
				inCompanyId = entity.CompanyId,
				inName = entity.Name,
				inStatus = (byte)entity.Status,
				inRolePermissions = rolePermissions,
				inUserId = userId
			}, null, null, System.Data.CommandType.StoredProcedure);

			if (Guid.TryParse(newId.ToString(), out Guid guidOutput) && entity.Status != BaseEntityStatus.Deleted)
			{
				entity.Id = guidOutput;
			}

			return entity;
		}
	}
}
