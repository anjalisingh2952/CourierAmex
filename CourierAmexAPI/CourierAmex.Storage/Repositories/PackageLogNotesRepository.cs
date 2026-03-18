using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using Dapper;

namespace CourierAmex.Storage.Repositories
{
    public class PackageLogNotesRepository : IPackageLogNotesRepository
    {

        private readonly IDalSession _session;
        public PackageLogNotesRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<PackageLogNotes>> GetByNumeroByClienteAsync(int? numero, string codigoCliente)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageLogNotes>("[dbo].[usp_GetBitacoraNota]", new
            {
                Numero = numero,
                CodigoCliente = codigoCliente
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PackageLogNotes>> GetAllActiveAsync(string codigoCliente)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageLogNotes>("[dbo].[BKO_PackageLogNotes_GetAll]", new
            {
                inCompanyId = codigoCliente
            }, null, null, System.Data.CommandType.StoredProcedure);
        }


        public async Task<IEnumerable<PackageLogNotes>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", string codigoCliente = "", int numeroPckg = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageLogNotes>("[dbo].[BKO_PackageLogNotes_GetPaged]", new
            {
                inCodigoCliente = codigoCliente,
                inNumeroPckg = numeroPckg,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<PackageLogNotes?> GetByIdAsync(int id)
        {
            //[dbo].[usp_GetBitacoraNota]
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<PackageLogNotes>("[dbo].[usp_GetBitacoraNota]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }
        public async Task<PackageLogNotes?> CreateOrUpdateAsync(PackageLogNotes entity, Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            //TODO:No se ha creado el SP en la BD
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_PackageLogNotes_CreateOrUpdate]", new
            {
                inId = entity.Id,
                inIdNota = entity.IdNota,
                inNumero = entity.Number,
                inCodigo = entity.Codigo,
                inCourier = entity.Courier,
                inMensaje = entity.Message,
                inIdUsuario = entity.User,
                inTipoBitacora = entity.LogType,
                inFecha = entity.CreatedAt
            }, null, null, System.Data.CommandType.StoredProcedure);
            if (int.TryParse(newId.ToString(), out int idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }
            return entity;
        }
    }
}
