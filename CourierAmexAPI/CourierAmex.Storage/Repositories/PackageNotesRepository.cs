using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CourierAmex.Storage.Repositories
{
    public class PackageNotesRepository : IPackageNotesRepository
    {
        private readonly IDalSession _session;
        public PackageNotesRepository(IDalSession session)
        {
            _session = session;
        }
        public async Task<PackageNotes?> CreateOrUpdateAsync(PackageNotes entity, Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_PackageNotes_CreateUpdate]", new
            {
                inCompanyId = entity.CompanyId,
                inId = entity.Id,
                inCodigo = entity.Codigo,
                inCourier = entity.Courier,
                inMensaje = entity.Message,
                inFechaVence = entity.DueDate,
                inStatus = (byte)entity.Status,
                inSincronizado = false,
                inUserId = userId
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (int.TryParse(newId.ToString(), out int idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }

            return entity;
        }

        public Task<IEnumerable<PackageNotes>> GetAllActiveAsync(string codigoCliente)
        {
            throw new NotImplementedException();
        }

        public async Task<PackageNotes?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<PackageNotes>("[dbo].[BKO_PackageNotes_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public Task<IEnumerable<PackageNotes>> GetByNumeroByClienteAsync(int? numero, string codigoCliente)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<PackageNotes>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", string codigoCliente = "", string numeroCourier = "", int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageNotes>("[dbo].[BKO_PackageNotes_GetPaged]", new
            {
                inCompanyId = companyId,
                inCodigoCliente = codigoCliente,
                inNumeroCourier = numeroCourier,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }
    }
}
