using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface IManifestDetailedBillingService
    {
        
        Task<GenericResponse<List<AverageManifest>>> GetManifestAverageByKilogramAsync(int companyId, string manifestNumber);
        Task<GenericResponse<List<ManifestProvider>>> GetManifestDetailBySupplierAsync(int companyId, string manifestNumber);
        Task<GenericResponse<List<Manifestdetail>>> GetManifestProductsDetailAsync(int companyId, string manifestNumber);
        Task<GenericResponse<List<ManifestProducts>>> GetManifestProductsAsync(int companyId, string manifestNumber);
    }
}
