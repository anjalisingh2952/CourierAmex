using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using static Dapper.SqlMapper;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Data;
using System.Reflection;
using System.Reflection.PortableExecutable;
using System.Numerics;

namespace CourierAmex.Storage.Repositories
{
    public class PackageItemRepository : IPackageItemRepository
    {
        private readonly IDalSession _session;

        public PackageItemRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<PackageItem?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_PackageItem_GetById]", new
            {
                Id = id
            }, null, null, System.Data.CommandType.StoredProcedure);

            var entity = await multi.ReadSingleOrDefaultAsync<PackageItem>();
            return entity;
        }

        public async Task<IEnumerable<PackageItem>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int P_number = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageItem>("[dbo].[BKO_PackageItem_GetPaged]", new
            {
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy,
                P_number = P_number
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<PackageItem?> CreateOrUpdateAsync(PackageItem entity)
        {
            int? id = entity.Id > 0 ? entity.Id : null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_PackageItem_CreateOrUpdate]", new
            {
                Id = id,
                Number = entity.Number,
                BrandId = entity.BrandId,
                ModelId = entity.ModelId,
                Series = entity.Series,
                Description = entity.Description,
                Composition = entity.Composition,
                Quantity = entity.Quantity,
                UnitCost = entity.UnitCost,
                Source = entity.Source,
                State = entity.State,
                Style = entity.Style,
                Color = entity.Color,
                Size = entity.Size,
                Batch = entity.Batch,
                Invoice = entity.Invoice,
                Characteristics = entity.Characteristics,
                Origin = entity.Origin,
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (int.TryParse(newId.ToString(), out int idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }

            return entity;
        }

        public Task<int> ValidateDeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<PackageItemModel_PreviousReport_PreStudy>> GetPaged_PackageItems_PreStudy_Async(int pageSize, short pageIndex, string sort, string criteria, string manifestNumber, string packageNumbers, int companyid)
        {

            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageItemModel_PreviousReport_PreStudy>("[dbo].[BKO_GetPackageItems_PreStudy]", new
            {
                MANIFESTNUMBER = manifestNumber,
                PACKAGENUMBERS = packageNumbers,
                COMPANYID = companyid,
                PAGENUMBER = pageIndex,
                PAGESIZE = pageSize
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<int?> UpdateBillingDetails(PackageItemModel_PreviousReport_PreStudy entity, Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_UpdatePackageItemBillingDetails]", new
            {
                ID = entity.Id,
                DESCRIPTION = entity.Description,
                QUANTITY = entity.Quantity,
                PRICE = entity.UnitCost,
                CHARACTERISTICS = entity.Characteristics,

            }, null, null, System.Data.CommandType.StoredProcedure);

            return newId;
        }







    }
}
