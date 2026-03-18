using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories.Interfaces;
using Dapper;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CourierAmex.Storage.Repositories
{
    public class ManifestDetailedBillingRepository : IManifestDetailedBillingRepository
    {
        private readonly IDalSession _session;

        public ManifestDetailedBillingRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<AverageManifest>> GetManifestAverageByKilogram(int companyId, string manifestNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<AverageManifest>(
                "[dbo].[BKO_ManifestReport_AverageKG]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                },
                commandType: System.Data.CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<ManifestProvider>> GetManifestDetailBySupplier(int companyId, string manifestNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<ManifestProvider>(
                "[dbo].[BKO_ManifestReport_Supplier]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                },
                commandType: System.Data.CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<Manifestdetail>> GetManifestProductsDetail(int companyId, string manifestNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Manifestdetail>(
                "[dbo].[BKO_ManifestReport_ProductsDetail]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                },
                commandType: System.Data.CommandType.StoredProcedure
            );
        }
        public async Task<IEnumerable<ManifestProducts>> GetManifestProductsAsync(int companyId, string manifestNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<ManifestProducts>(
                "[dbo].[BKO_Manifest_ProductsDetail]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                },
                commandType: System.Data.CommandType.StoredProcedure
            );
        }
    }
}