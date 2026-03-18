using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using Dapper;


namespace CourierAmex.Storage.Repositories
{
    public class PaymentTypeRepository : IPaymentTypeRepository
    {
        private readonly IDalSession _session;
        public PaymentTypeRepository(IDalSession session)
        {
            _session = session;
        }
        public async Task<IEnumerable<PaymentType>> GetAllActiveAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PaymentType>("[dbo].[BKO_PaymentType_GetAll]", new
            {
                inCompanyId = companyId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PaymentType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PaymentType>("[dbo].[BKO_PaymentType_GetPaged]", new
            {
                inCompanyId = companyId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }


        public async Task<PaymentType?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<PaymentType>("[dbo].[BKO_PaymentType_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<PaymentType?> CreateOrUpdateAsync(PaymentType entity, Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_PaymentType_CreateOrUpdate]", new
            {
                inId = entity.Id,
                inCompanyId = entity.CompanyId,
                inName = entity.Name,
                inStatus = (byte)entity.Status,
                inUserId = userId
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (int.TryParse(newId.ToString(), out int idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }

            return entity;
        }
        
    }
}
