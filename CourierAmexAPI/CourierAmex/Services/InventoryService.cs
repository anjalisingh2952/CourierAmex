using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Repositories.Interfaces;

namespace CourierAmex.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public InventoryService(IMapper mapper, IInventoryRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }


        public async Task<GenericResponse<List<StoreInventoryPackageModel>>> GetStoreInventoryPackagesAsync(int companyId, int storeId)
        {
            var response = new GenericResponse<List<StoreInventoryPackageModel>>();

            try
            {
                var storeInventoryPackages = await _repository.GetStoreInventoryPackagesAsync(companyId, storeId);


                if (storeInventoryPackages != null && storeInventoryPackages.Any())
                {
                    response.Success = true;


                    response.Data = _mapper.Map<List<StoreInventoryPackageModel>>(storeInventoryPackages.ToList());
                }
                else
                {
                    response.Success = false;
                    response.Message = "No inventory packages found.";
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"An error occurred: {ex.Message}";
            }

            return response;
        }


        public async Task<GenericResponse<int>> InsertInventoryPackageAsync(int storeId, int packageNumber, string userName, DateTime date)
        {
            var response = new GenericResponse<int>();

            try
            {

                response.Success = true;
                response.Message = "Package inserted succesfully.";
                response.Data = await _repository.InsertInventoryPackageAsync(storeId, packageNumber, userName, date);

            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
                response.Data = 0;
            }

            return response;
        }


        public async Task<GenericResponse<int>> DeleteInventoryPackageAsync(int storeId, int packageNumber, int deleteAll)
        {
            var response = new GenericResponse<int>();
            try
            {
                var result = await _repository.DeleteInventoryPackageAsync(storeId, packageNumber, deleteAll);

                response.Success = true;
                response.Data = result;
                response.Message = deleteAll == 1 ? "All packages deleted successfully." : "Package deleted successfully.";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Failed to delete package(s): {ex.Message}";
                response.Data = 0;
            }

            return response;
        }



        public async Task<GenericResponse<int>> ResendPackageNotificationAsync(int packageNumber, string documentType)
        {
            var response = new GenericResponse<int>();

            try
            {
                response.Success = true;
                response.Message = "Package notification resend request processed successfully.";
                response.Data = await _repository.ResendPackageNotificationAsync(packageNumber, documentType);
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
                response.Data = 0;
            }

            return response;
        }

        public async Task<GenericResponse<List<StoreInventoryReport>>> GetStoreInventoryAsync(int storeId, string companyId)
        {
            var response = new GenericResponse<List<StoreInventoryReport>>();

            try
            {
                var res = await _repository.GetStoreInventoryAsync(storeId, companyId);


                if (res != null && res.Any())
                {
                    response.Success = true;


                    response.Data = _mapper.Map<List<StoreInventoryReport>>(res.ToList());
                }
                else
                {
                    response.Success = false;
                    response.Message = "No inventory packages found.";
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"An error occurred: {ex.Message}";
            }

            return response;
        }



    }
}
