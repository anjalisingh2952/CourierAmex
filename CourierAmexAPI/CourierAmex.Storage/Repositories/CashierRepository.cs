using Dapper;

using CourierAmex.Storage.Domain;
using System.Data;

namespace CourierAmex.Storage.Repositories
{
    public class CashierRepository : ICashierRepository
    {
        private readonly IDalSession _session;

        public CashierRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Cashier>> GetAllAsync()
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Cashier>("[dbo].[BKO_Company_GetAllActive]", null, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Cashier>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Cashier>("[dbo].[BKO_Cashier_GetPaged]", new
            {
                inCompanyId = companyId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<UserByPointOfSale>> GetUserByPointOfSaleAsync(int companyId,int pointOfSaleId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<UserByPointOfSale>("[dbo].[BKO_GetUserByPointOfSaleId]", new
            {
                CompanyId = companyId,
                PointOfSaleId = pointOfSaleId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Cashier?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<Cashier>("[dbo].[BKO_Cashier_GetById]", new
            {
                inId = id
            }, null, null, CommandType.StoredProcedure);
        }


        public async Task<bool?> InsertUserToCashierAsync(int companyId,int pointOfSaleId, string UserName)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new DynamicParameters(new
            {
                CompanyId = companyId,
                PointOfSaleId = pointOfSaleId,
                User = UserName
            });

            parameters.Add("Exiest", dbType: DbType.Boolean, direction: ParameterDirection.Output);

            await connection.ExecuteAsync(
                "[dbo].[BKO_InsertUserToCashier]",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return parameters.Get<bool?>("Exiest");
        }


        public async Task<Cashier?> CreateOrUpdateAsync(Cashier entity, Guid userId)
        {
            int? id = entity.Id > 0 ? entity.Id : null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Cashier_CreateOrUpdate]", new
            {
                inId = id,
                inName = entity.Name,
                inPrinterName = entity.PrinterName,
                inStatus = (byte)entity.Status,
                inCompanyId = entity.CompanyId,
                inIpNumber = entity.IpAddress,
                inPortNumber = entity.PortNumber
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (int.TryParse(newId.ToString(), out int idOutput))
            {
                entity.Id = idOutput;
            }

            return entity;
        }
    }
}