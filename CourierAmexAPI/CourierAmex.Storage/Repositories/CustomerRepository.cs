using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using static Dapper.SqlMapper;
using System.Data;

namespace CourierAmex.Storage.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly IDalSession _session;

        public CustomerRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Customer>> GetAllAsync()
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Customer>("[dbo].[BKO_Customer_GetAllActive]", null, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Customer>> GetPagedAsync(int companyId, int pageSize, short pageIndex, string orderBy = "", string filterBy = "")
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Customer>("[dbo].[BKO_Customer_GetPaged]", new
            {
                inCompanyId = companyId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Customer?> GetByIdAsync(long id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<Customer>("[dbo].[BKO_Customer_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Customer?> GetByCodeAsync(string code)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<Customer>("[dbo].[BKO_Customer_GetByCode]", new
            {
                inId = code
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Customer?> CreateOrUpdateAsync(Customer entity, Guid userId)
        {
            try
            {
                long? id = entity.Id > 0 ? entity.Id : null;
                int? docTypeId = entity.DocumentTypeId > 0 ? entity.DocumentTypeId : null;
                int? countryId = entity.CountryId > 0 ? entity.CountryId : null;
                int? stateId = entity.StateId > 0 ? entity.StateId : null;
                int? zoneId = entity.ZoneId > 0 ? entity.ZoneId : null;
                int? areaId = entity.AreaId > 0 ? entity.AreaId : null;
                // int? change = entity.Change > 0 ? entity.Change : null;
                int? supplierId = entity.SupplierId > 0 ? entity.SupplierId : null;
                int? locationId = entity.LocationId > 0 ? entity.LocationId : null;
                int? customerPayTypeId = entity.CustomerPayTypeId > 0 ? entity.CustomerPayTypeId : null;
                int? clientCategoryId = entity.ClientCategoryId > 0 ? entity.ClientCategoryId : null;
                string fullName = entity.FullName?.Length > 0 ? entity.FullName : string.Concat(entity.Name, " ", entity.Lastname, " ", entity.Lastname2);

                var connection = await _session.GetReadOnlyConnectionAsync();
                var newId = await connection.QuerySingleOrDefaultAsync<long>("[dbo].[BKO_Customer_CreateOrUpdate]", new
                {
                    inId = id,
                    inCompanyId = entity.CompanyId,
                    inDocumentTypeId = docTypeId,
                    inDocumentId = entity.DocumentId,
                    inName = entity.Name,
                    inLastname = entity.Lastname,
                    inLastname2 = entity.Lastname2,
                    inFullName = fullName,
                    inCompanyName = entity.CompanyName,
                    inCode = entity.Code,
                    inCountryId = countryId,
                    inStateId = stateId,
                    inZoneId = zoneId,
                    inAreaId = areaId,
                    inShipByAir = entity.ShipByAir,
                    inShipBySea = entity.ShipBySea,
                    inTmp = entity.Tmp,
                    inChange = entity.Change,
                    inComplement = entity.Complement,
                    inBillable = entity.Billable,
                    inSynched = entity.Synched,
                    inContact = entity.Contact,
                    inUseBusShipment = entity.UseBusShipment,
                    inSupplierId = supplierId,
                    inLocationId = locationId,
                    inUseDelivery = entity.UseDelivery,
                    inBillCompany = entity.BillCompany,
                    inCustomerPayTypeId = customerPayTypeId,
                    inAddress = entity.Address,
                    inAddressLine1 = entity.AddressLine1,
                    inAddressLine2 = entity.AddressLine2,
                    inBillableEmail = entity.BillableEmail,
                    inEmail = entity.Email,
                    inPasswordHash = entity.PasswordHash,
                    inLastLoginDate = entity.LastLoginDate,
                    inToken = entity.Token,
                    inSecurityStamp = entity.SecurityStamp,
                    inPassword = entity.Password,
                    inRole = entity.Role,
                    inClientCategoryId = clientCategoryId,
                    inReferredBy = entity.ReferredBy,
                    inStatus = (byte)entity.Status,
                    inUserId = userId
                }, null, null, System.Data.CommandType.StoredProcedure);

                if (long.TryParse(newId.ToString(), out long idOutput) && entity.Status != BaseEntityStatus.Deleted)
                {
                    entity.Id = idOutput;
                }

                return entity;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public async Task<IEnumerable<CustomerCreditModel>> GetEnabledCreditsAsync(string? filter, int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<CustomerCreditModel>(
                "[dbo].[BKO_GET_CLIENT_CREDIT_SEARCH]",
                new { CustomerCode = filter ?? "", CompanyId = companyId },
                commandType: System.Data.CommandType.StoredProcedure);
        }


        public async Task<int> EnableCustomerCreditAsync(string customerCode, int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var rowsAffected = await connection.ExecuteAsync(
                "[dbo].[BKO_SET_CLIENT_CREDIT]",
                new { CustomerCode = customerCode, CompanyId = companyId },
                commandType: CommandType.StoredProcedure);

            return rowsAffected ;
        }



        public async Task<IEnumerable<CustomerCreditModel>> GetEnabledCustomerCreditsAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var parameters = new { CompanyId = companyId };

            var result = await connection.QueryAsync<CustomerCreditModel>(
                "[dbo].[BKO_GET_ALL_ENABLED_CUSTOMERS]",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result;
        }



        public async Task<int> DisableCustomerCreditAsync(string customerCode, int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var parameters = new { CustomerCode = customerCode, CompanyId = companyId };

            var rowsAffected = await connection.ExecuteAsync(
                "[dbo].[BKO_DELETE_CLI_CLIENT_CREDIT]",
                parameters,
                commandType: CommandType.StoredProcedure);

            return rowsAffected ;
        }



    }
}
