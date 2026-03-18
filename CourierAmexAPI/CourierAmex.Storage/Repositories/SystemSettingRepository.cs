using System.Text.Json;

using Dapper;

using CourierAmex.Storage.Domain;
using static Dapper.SqlMapper;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.ComponentModel.Design;

namespace CourierAmex.Storage.Repositories
{
    public class SystemSettingRepository : ISystemSettingRepository
    {
        private readonly IDalSession _session;

        public SystemSettingRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<SystemSetting>> GetAllAsync()
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<SystemSetting>("[dbo].[BKO_SystemSetting_GetAll]", null, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task BulkUpdateAsync(IEnumerable<SystemSetting> entity, Guid userId)
        {
            string sJSONResponse = JsonSerializer.Serialize(entity);

            var connection = await _session.GetReadOnlyConnectionAsync();
            await connection.ExecuteScalarAsync("[dbo].[BKO_SystemSetting_BulkUpdate]", new
            {
                inData = sJSONResponse,
                inUserId = userId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }
        
       
    }
}
