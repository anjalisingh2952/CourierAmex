using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
//using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class PackageService : IPackageService
    {
        private readonly IPackageRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public PackageService(IMapper mapper, IPackageRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<PackageModel>> GetByIdAsync(int id)
        {
            GenericResponse<PackageModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<PackageModel>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<PackageModel>> GetByPackageNumberAsync(int companyId = 0, int packageNumber = 0)
        {
            GenericResponse<PackageModel>? response = new();
            var entity = await _repository.GetByPackageNumberAsync(companyId, packageNumber);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<PackageModel>(entity);
            }
            else
            {
                response.Success = false;
                response.Message = "Package Number Does not belong to selected Company";
            }

            return response;
        }

        public async Task<PagedResponse<PackageModel>> GetPagedAsync(FilterByRequest request, int companyId = 0, int stateId = 0)
        {
            PagedResponse<PackageModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId, stateId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<PagedResponse<PackageCategoryModel>> GetPagedByManifestAsync(FilterByRequest request, int companyId = 0, int manifestId = 0)
        {
            PagedResponse<PackageCategoryModel> result = new();
            var sort = request.SortBy ?? "Number DESC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedByManifestAsync(request.PageSize, request.PageIndex, sort, criteria, companyId, manifestId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageCategoryModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<PagedResponse<PackageCategoryModel>> GetPagedPriceByManifestAsync(FilterByRequest request, int companyId = 0, int manifestId = 0)
        {
            PagedResponse<PackageCategoryModel> result = new();
            var sort = request.SortBy ?? "Number DESC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedPriceByManifestAsync(request.PageSize, request.PageIndex, sort, criteria, companyId, manifestId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageCategoryModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<PagedResponse<PackageCategoryModel>> GetByManifestAirGuideAsync(int companyId = 0, int manifestId = 0, string airGuide = "")
        {
            PagedResponse<PackageCategoryModel> result = new();

            var entities = await _repository.GetByManifestAirGuideAsync(companyId, manifestId, airGuide);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageCategoryModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }


        public async Task<GenericResponse<PackageCategoryModel>> CategoryUpdateAsync(BulkPackageCategory entity, Guid userId)
        {
            GenericResponse<PackageCategoryModel> result = new();

            var packageR = new Entities.PackageCategory()
            {
                Category = entity.Category,
                CompanyId = entity.CompanyId,
                CustomerCode = "",
                CustomerName = "",
                Description = "",
                Number = 0
            };

            foreach (var item in entity.Numbers)
            {
                var package = new Entities.PackageCategory()
                {
                    Category = entity.Category,
                    CompanyId = entity.CompanyId,
                    CustomerCode = "",
                    CustomerName = "",
                    Description = "",
                    Number = item
                };
                package = await _repository.CategoryUpdateAsync(package, userId);

            }
            //            var package = _mapper.Map<Entities.PackageCategory>(entity);
            //          if (null != package)
            //        {
            //             package = await _repository.CategoryUpdateAsync(package, userId);

            result.Success = true;
            result.Data = _mapper.Map<PackageCategoryModel>(packageR);
            //       }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }


        public async Task<PagedResponse<PackageEventModel>> GetEventsPagedAsync(FilterByRequest request, int companyId = 0)
        {
            PagedResponse<PackageEventModel> result = new();
            var sort = request.SortBy ?? "CreatedAt DESC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetEventsPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageEventModel>>(entities);
                //List<PackageEventModel> models = new List<PackageEventModel>();
                //foreach (var item in entities)
                //{
                //    models.Add(new PackageEventModel() {
                //        CreatedAt = new DateTimeOffset(item.CreatedAt.ToUniversalTime()).ToUnixTimeMilliseconds(),
                //        Description = item.Description,
                //        Number = item.Number,
                //        Section = item.Section,
                //        User = item.User
                //    });
                //}

                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }


        public async Task<GenericResponse<PackageModel>> CreateAsync(PackageModel entity, Guid userId)
        {
            GenericResponse<PackageModel> result = new();
            var package = _mapper.Map<Entities.Package>(entity);
            if (null != package)
            {
                package = await _repository.CreateOrUpdateAsync(package, userId);

                if (package?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PackageModel>(package);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<PackageModel>> UpdateAsync(PackageModel entity, Guid userId)
        {
            GenericResponse<PackageModel> result = new();
            var Package = await _repository.GetByIdAsync(entity.Id);
            if (null != Package)
            {
                Package = _mapper.Map(entity, Package);
                Package = await _repository.CreateOrUpdateAsync(Package, userId);
                if (Package?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PackageModel>(Package);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<bool>> DeleteAsync(int id, Guid userId)
        {
            GenericResponse<bool> result = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                var deleteId = await _repository.ValidateDeleteAsync(entity.Id);
                if (deleteId == 0)
                {
                    entity.Status = BaseEntityStatus.Deleted;
                    await _repository.CreateOrUpdateAsync(entity, userId);
                    result.Success = true;
                }
                else
                {
                    result.Success = false;
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<Models.ClassifyPackage>> ClassifyPackageAsync(Models.ClassifyPackage entity, Guid userId)
        {
            GenericResponse<Models.ClassifyPackage> result = new();
            var package = new Entities.ClassifyPackage()
            {
                Id = entity.Id,
                IssueTypeId = entity.IssueTypeId,
                ManifestId = entity.ManifestId,
                ShipTypeId = entity.ShipTypeId
            };
            if (null != package)
            {
                package = await _repository.ClassifyPackageAsync(package, userId);

                if (package?.Id.ToString().Length > 0)
                {
                    entity.Id = package.Id;
                    result.Success = true;
                    result.Data = entity;
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<PackageDetail>> GetPackageDetailByManifestId(int manifestId)
        {
            GenericResponse<PackageDetail>? response = new();
            var entity = await _repository.GetPackageDetailByManifestId(manifestId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<PackageDetail>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<PackageDetail>> GetPackageDetailByManifestIdAndAirGuideIdAsync(string airGuideId, int manifestId)
        {
            GenericResponse<PackageDetail>? response = new();
            var entity = await _repository.GetPackageDetailByManifestIdAndAirGuideIdAsync(airGuideId, manifestId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<PackageDetail>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<List<PackagedPackage>>> GetPackagedPackages(string airGuideId, int manifestId, int packed)
        {
            GenericResponse<List<PackagedPackage>> response = new();
            var entity = await _repository.GetPackagedPackages(airGuideId, manifestId, packed);
            if (entity != null)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<PackagedPackage>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<PackagedPackagedResponse>> GetPackedPackages(string category, string airGuideId, int manifestId, int packed, int? pallet)
        {
            GenericResponse<PackagedPackagedResponse> response = new();
            var entity = await _repository.GetPackedPackages(category, airGuideId, manifestId, packed, pallet);
            if (entity != null)
            {
                response.Success = true;
                response.Data = _mapper.Map<PackagedPackagedResponse>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<List<PackagedPackage>>> GetAirGuideManifest(int manifestId)
        {
            GenericResponse<List<PackagedPackage>> response = new();
            var entity = await _repository.GetAirGuideManifest(manifestId);
            if (entity != null)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<PackagedPackage>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<string>> PackagePriceUpdate(List<PackagePriceUpdateModel> packages)
        {
            GenericResponse<string> result = new();
            List<PackagePrice> listPackagePrice = packages.Select(x => new PackagePrice()
            {
                PackageNumber = x.PackageNumber,
                Description = x.Description,
                Price = x.Price
            }
            ).ToList();

            result.Success = true;
            result.Data = await _repository.PackagePriceUpdateBulkAsync(listPackagePrice);

            return result;
        }

        public async Task<GenericResponse<string>> PackagePriceUpdate(PackagePriceUpdateModel package)
        {
            GenericResponse<string> result = new();
            PackagePrice PriceData = new PackagePrice()
            {
                PackageNumber = package.PackageNumber,
                Description = package.Description,
                Price = package.Price,
                IsDocument = package.IsDocument,
                IsPermission = package.IsPermission
            };

            result.Success = true;
            result.Data = await _repository.PackagePriceUpdateAsync(PriceData);

            return result;
        }

        public async Task<GenericResponse<string>> GetNextConsecutivoAsync(string packagingType, int length)
        {
            GenericResponse<string> response = new();
            var entity = await _repository.GetNextConsecutivoAsync(packagingType, length);
            if (entity != null)
            {
                response.Success = true;
                response.Data = entity;
            }

            return response;
        }

        public async Task<GenericResponse<int>> PackPackage(int? packageNumber, string? bagNumber, int? palet, string? manifestNumber, int? packageSubType, string? user)
        {
            GenericResponse<int> response = new();
            var entity = await _repository.PackPackageAsync(packageNumber, bagNumber, palet, manifestNumber, packageSubType, user);
            if (entity != null)
            {
                response.Success = true;
                response.Data = entity;
            }

            return response;
        }

        public async Task<GenericResponse<int>> PackPackageGuide(int? packageNumber, string? bagNumber, int? palet, string? manifestNumber, int? packageSubType, string? user)
        {
            GenericResponse<int> response = new();
            var entity = await _repository.PackPackageGuideAsync(packageNumber, bagNumber, palet, manifestNumber, packageSubType, user);
            if (entity != null)
            {
                response.Success = true;
                response.Data = entity;
            }

            return response;
        }

        public async Task UnpackPackage(int? packageNumber)
        {
            await _repository.UnpackPackageAsync(packageNumber);
        }

        public async Task UnpackPackageConsolidated(int? packageNumber)
        {
            await _repository.UnpackPackageConsolidatedAsync(packageNumber);
        }
        public async Task<GenericResponse<List<ManifestPackage>>> GetManifestPackageAsync(string manifestNumber)
        {
            GenericResponse<List<ManifestPackage>> response = new();
            var entity = await _repository.GetManifestPackageAsync(manifestNumber);
            if (entity != null)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<ManifestPackage>>(entity); ;
            }

            return response;
        }

        public async Task RegisterBagPackaging(int manifestId, string bag, int taxType, decimal width, decimal height, decimal length, decimal actualVolumeWeight, decimal actualWeight, decimal systemVolumeWeight, decimal systemWeight, int packages, string packagingType, int sequence, string category, string user, int? isConsolidated, int? pallet)
        {
            _ = _repository.RegisterBagPackagingAsync(
                        manifestId,
                        bag,
                        taxType,
                        width,
                        height,
                        length,
                        actualVolumeWeight,
                        actualWeight,
                        systemVolumeWeight,
                        systemWeight,
                        packages,
                        packagingType,
                        sequence,
                        category,
                        user,
                        isConsolidated,
                        pallet
                    );

        }


        public async Task<GenericResponse<int>> UnassignPackageAsync(int packageId, int manifestId, int initialStateId, string modifiedBy, bool forceRemove)
        {
            var response = new GenericResponse<int>();
            try
            {

                response.Success = true;
                response.Data = await _repository.UnassignPackageAsync(packageId, manifestId, initialStateId, modifiedBy, forceRemove);
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }

            return response;
        }



        public async Task<GenericResponse<List<PackageModel>>?> SearchPackageAsync(int packageNumber, string courierNumber, string customerAccount)
        {
            var response = new GenericResponse<List<PackageModel>>();
            var entities = await _repository.SearchPackageAsync(packageNumber, courierNumber, customerAccount);

            if (entities != null && entities.Any())
            {
                response.Success = true;
                response.Data = _mapper.Map<List<PackageModel>>(entities);
            }
            else
            {
                response.Success = false;
                response.Message = "No packages found with the given filters.";
            }

            return response;
        }


        public async Task<GenericResponse<PackageModel>> GetPackageForCustomerServiceAsync(int id)
        {
            GenericResponse<PackageModel>? response = new();
            var entity = await _repository.GetPackageForCustomerServiceAsync(id);

            if (entity != null)
            {
                response.Success = true;
                response.Data = _mapper.Map<PackageModel>(entity);
            }

            return response;
        }


        public async Task<GenericResponse<List<PackageInvoiceStatus>>> GetPackagesByInvoiceStatusAsync(GetPackageByInvoiceStatusRequest request)
        {
            GenericResponse<List<PackageInvoiceStatus>> response = new();

            try
            {
                var entities = await _repository.GetPackagesByInvoiceStatusAsync(request);

                if (entities != null && entities.Any())
                {
                    response.Success = true;
                    response.Data = _mapper.Map<List<PackageInvoiceStatus>>(entities);
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }

            return response;
        }


        public async Task<GenericResponse<int>> UpdatePackageInvoiceStatusAsync(UpdatePackageInvoiceStatusRequest request)
        {
            GenericResponse<int> response = new();

            try
            {
                int result = await _repository.UpdatePackageInvoiceStatusAsync(request);
                response.Data = result;
            }
            catch (Exception ex)
            {

                response.Success = false;
                response.Message = ex.Message;
            }


            return response;
        }

        public async Task<GenericResponse<string>> UpdatePackageCommodityAndPrice(UpdatePackageCommodityPriceModel package)
{
    var result = new GenericResponse<string>();

    try
    {
        // Call the repository method to execute the stored procedure
        var response = await _repository.UpdatePackageCommodityAndPriceAsync(package);

        if (response == "success")
        {
            result.Success = true;
            result.Data = "Package commodity and price updated successfully.";
        }
        else
        {
            result.Success = false;
            result.Message = "Failed to update package commodity and price.";
        }
    }
    catch (Exception ex)
    {
        result.Success = false;
        result.Message = ex.Message;
    }

    return result;
}


        public async Task<GenericResponse<List<PendingBillingPackageModel>>> GetPendingBillingPackagesAsync(int companyId)
        {
            GenericResponse<List<PendingBillingPackageModel>> response = new();

            try
            {
                var result = await _repository.GetPendingBillingPackagesAsync(companyId);
                response.Data = result;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }

            return response;
        }


        public async Task<GenericResponse<List<Commodities>>> GetCommoditiesAsync(int companyId)
        {
            var response = new GenericResponse<List<Commodities>>();

            try
            {
                var result = await _repository.GetCommoditiesAsync(companyId);
                response.Data = result;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = ex.Message;
            }

            return response;
        }



    }
}
