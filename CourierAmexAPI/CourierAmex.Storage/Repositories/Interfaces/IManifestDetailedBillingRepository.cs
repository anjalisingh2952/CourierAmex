using CourierAmex.Storage.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CourierAmex.Storage.Repositories
{
    public interface IManifestDetailedBillingRepository
    {
        Task<IEnumerable<AverageManifest>> GetManifestAverageByKilogram(int companyId, string manifestNumber);
        Task<IEnumerable<ManifestProvider>> GetManifestDetailBySupplier(int companyId, string manifestNumber);
        Task<IEnumerable<Manifestdetail>> GetManifestProductsDetail(int companyId, string manifestNumber);
        Task<IEnumerable<ManifestProducts>> GetManifestProductsAsync(int companyId, string manifestNumber);
    }
}
