using AutoMapper;
using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;
using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class ManifestService : IManifestService
    {
        private readonly IManifestRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public ManifestService(IMapper mapper, IManifestRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<ManifestModel>> GetByIdAsync(long id)
        {
            GenericResponse<ManifestModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<ManifestModel>(entity);
            }

            return response;
        }
        public async Task<PagedResponse<ManifestScanner>> GetManifestScannerAsync(FilterByRequest request, int companyId = 0)
        {
            PagedResponse<ManifestScanner>? response = new();
            var sort = request.SortBy ?? "ManifestDate DESC";
            var criteria = request.Criteria ?? "";

            var entity = await _repository.GetManifestScanner(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<ManifestScanner>>(entity);
                var entities = entity.FirstOrDefault();
                response.TotalRows = entities != null ? entities.TotalRows : 0;
            }

            return response;
        }

        public async Task<PagedResponse<ManifestScanner>> GetManifestScannerWithoutPaginationAsync(int companyId = 0)
        {
            PagedResponse<ManifestScanner>? response = new();

            var entity = await _repository.GetManifestScannerWithoutPagination(companyId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<ManifestScanner>>(entity);
                var entities = entity.FirstOrDefault();
                response.TotalRows = entities != null ? entities.TotalRows : 0;
            }

            return response;
        }

        public async Task<PagedResponse<PendingPackageInfo>> GetPendingPackagesAsync(FilterByRequest request, string mn)
        {
            PagedResponse<PendingPackageInfo>? response = new();
            var sort = request.SortBy ?? "ManifestDate DESC";
            var criteria = request.Criteria ?? "";

            var entity = await _repository.GetPendingPackages(request.PageSize, request.PageIndex, sort, criteria, mn);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<PendingPackageInfo>>(entity);
                var entities = entity.FirstOrDefault();
                response.TotalRows = entities != null ? entities.TotalRows : 0;
            }

            return response;
        }

        public async Task<GenericResponse<CountManifestScanner>> GetCountManifestScannerAsync(string mn)
        {
            GenericResponse<CountManifestScanner>? response = new();

            var entity = await _repository.GetCountManifestScanner(mn);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<CountManifestScanner>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<(int Resultado, bool Facturado)>> GetValidatePackageRoute(int? packageNumber, int? roadMapId)
        {
            GenericResponse<(int Resultado, bool Facturado)>? response = new();

            var entity = await _repository.GetValidatePackageRouteAsync(packageNumber, roadMapId);
            if (entity.Resultado != null)
            {
                response.Success = true;
                response.Data = _mapper.Map<(int Resultado, bool Facturado)>(entity);
            }

            return response;
        }

        public async Task<int> DeletePackageFromRouteMap(List<int>? packageId, int? roadMapId)
        {
            int response = -1;
            var entity = await _repository.DeletePackageFromRouteMapAsync(packageId, roadMapId);
            if (entity != null)
            {
                response = _mapper.Map<int>(entity);
            }
            return response;
        }

        public async Task<GenericResponse<List<DeliveryTypesModel>>> GetDeliveryTypes()
        {
            GenericResponse<List<DeliveryTypesModel>>? response = new();

            var entity = await _repository.GetDeliveryTypesAsync();
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<DeliveryTypesModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<List<RoadMapstReportModel>>> GetRoadMapsReport(int roadMapId, int companyId = 0)
        {
            GenericResponse<List<RoadMapstReportModel>>? response = new();

            var entity = await _repository.GetRoadMapsReportAsync(roadMapId, companyId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<RoadMapstReportModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<int>> InsertNotification(int packageNumber, string docType, int status)
        {
            GenericResponse<int>? response = new();

            var entity = await _repository.InsertNotificationAsync(packageNumber, docType,status);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<int>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<List<ParcelDeliveryReportModel>>> GetParcelDeliveryReport(int roadMapId, int companyId = 0)
        {
            GenericResponse<List<ParcelDeliveryReportModel>>? response = new();

            var entity = await _repository.GetParcelDeliveryReportAsync(roadMapId, companyId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<ParcelDeliveryReportModel>>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<ManifestModel>> GetPagedAsync(FilterByRequest request)
        {
            PagedResponse<ManifestModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var filter = new FilterByDomain()
            {
                CompanyId = request.CompanyId.Value,
                ShipTypeId = request.ShipTypeId.Value,
                Status = request.Status.Value,
                Criteria = criteria,
                SortBy = sort,
                PageSize = request.PageSize,
                PageIndex = request.PageIndex,
            };

            var entities = await _repository.GetPagedAsync(filter);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<ManifestModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<ManifestModel>> CreateAsync(ManifestModel entity, Guid userId)
        {
            GenericResponse<ManifestModel> result = new();
            var Manifest = _mapper.Map<Entities.Manifest>(entity);
            if (null != Manifest)
            {
                Manifest = await _repository.CreateOrUpdateAsync(Manifest, userId);

                if (Manifest?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<ManifestModel>(Manifest);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<ManifestModel>> UpdateAsync(ManifestModel entity, Guid userId)
        {
            GenericResponse<ManifestModel> result = new();
            var Manifest = await _repository.GetByIdAsync(entity.Id);
            if (null != Manifest)
            {
                Manifest = _mapper.Map(entity, Manifest);
                Manifest = await _repository.CreateOrUpdateAsync(Manifest, userId);
                if (Manifest?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<ManifestModel>(Manifest);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<ManifestModel>> OpenAsync(long id, Guid userId)
        {
            GenericResponse<ManifestModel> result = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity && entity.Closed == 1)
            {
                entity.Closed = 0; //OPEN
                await _repository.CreateOrUpdateAsync(entity, userId);

                result.Success = true;
                result.Data = _mapper.Map<ManifestModel>(entity);
            }
            else
            {
                result.Success = false;
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<bool>> DeleteAsync(long id, Guid userId)
        {
            GenericResponse<bool> result = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity && entity.Closed == 0)
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

        public async Task<GenericResponse<List<Manifest>>> GetManifestsByPackageTypeAsync(string companyId, int state, int manifestType, string type)
        {
            GenericResponse<List<Manifest>> result = new();

            var entity = await _repository.GetManifestsByPackageTypeAsync(companyId, state, manifestType, type);

            if (entity != null)
            {
                var manifest = _mapper.Map<List<Manifest>>(entity);
                result.Data = manifest;
                result.Success = true;
                result.Message = "Manifest retrieved successfully.";
            }
            else
            {
                result.Success = false;
                result.Message = "No manifest found for the specified criteria.";
            }
            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<ScannedPackageInfo>> GetScannedPackageAsync(string packageNumber, string manifestNumber)
        {
            GenericResponse<ScannedPackageInfo>? response = new();

            try
            {
                var entity = await _repository.GetScannedPackage(packageNumber);
                if (null != entity)
                {
                    if (entity.ManifestId == 0 || (entity.ManifestId > 0 && entity.ManifestNumber == manifestNumber))
                    {
                        response.Success = true;
                        response.Data = _mapper.Map<ScannedPackageInfo>(entity);
                    }
                    else
                    {
                        response.Success = true;
                        response.Message = "Package Does Not Exist";
                    }
                }
                else
                {
                    response.Success = true;
                    response.Message = "Package Does Not Exist";
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error Fetching Package Info";
                response.Error = ex.Message;
            }


            return response;
        }

        public async Task<GenericResponse<ScanLogModel>> CreateScanLogAsync(ScanLogModel entity, Guid userId)
        {
            GenericResponse<ScanLogModel> result = new();
            var ScanLog = _mapper.Map<Entities.ScanLog>(entity);
            if (null != ScanLog)
            {
                ScanLog = await _repository.CreateScanLogAsync(ScanLog, userId);

                if (ScanLog?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<ScanLogModel>(ScanLog);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<PackageManifestInfoModel> GetPackageManifestInfo(int CompanyId, int PackageNumber)
        {
            var result = await _repository.GetPackageManifestInfoAsync(CompanyId, PackageNumber);

            if (result != null)
            {
                return _mapper.Map<PackageManifestInfoModel>(result);
            }
            return new PackageManifestInfoModel();
        }


        public async Task<List<RoutePackageReportModel>> GetPackageByRouteReport(int routeSheetId)
        {
            var result = await _repository.GetPackageByRouteReportAsync(routeSheetId);

            if (result != null)
            {
                return _mapper.Map<List<RoutePackageReportModel>>(result);
            }
            return new List<RoutePackageReportModel>();
        }

        public async Task<(List<RouteSheetDetailModel> List, int Total)> GetRouteSheetDetail(
            int routeSheetId, int status, string companyId, int? page, int? index, string? filter)
        {
            var result = await _repository.GetRouteSheetDetailAsync(routeSheetId, status, companyId, page, index, filter);

            return (
                _mapper.Map<List<RouteSheetDetailModel>>(result.List),
                result.Total
            );
        }

        public async Task<List<RouteSheetModel>> GetFilterRouteSheet(string? manifestId, string? zoneCode, int? status, int? page, int? index, string? filter)
        {
            var result = await _repository.GetFilterRouteSheetAsync(manifestId, zoneCode, status,page,index,filter);
            if (result != null)
            {
                return _mapper.Map<List<RouteSheetModel>>(result);
            }
            return new List<RouteSheetModel>();
        }

        public async Task<int> InsertRoute(RouteInsertModel model)
        {
            RouteInsert routeInsert = new RouteInsert
            {
                Description = model.Description,
                UserId = model.UserId,
                Status = model.Status ?? 0,
                ZoneId = model.ZoneId ?? 0,
                Id = model.Id,
                DeliveryTypeId = model.DeliveryTypeId ?? 0,
                PointOfSaleId = model.PointOfSaleId ?? 0,
                CompanyId = model.CompanyId,
                PackageIds = model.PackageIds
            };
            var result = await _repository.InsertRouteAsync(routeInsert);
            if (result != null)
            {
                return _mapper.Map<int>(result);
            }
            return 0;
        }

        public async Task<GenericResponse<int>> PackageScanUpdateAsync(ScannedPackageInfo entity)
        {
            GenericResponse<int> result = new();
            try
            {
                result.Success = true;
                result.Data = await _repository.PackageScanUpdateAsync(entity);
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = ex.Message;
                result.Error = ex.InnerException?.Message;
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<int>> UpdateRoadMapStatus(List<int> roadMapId)
        {
            GenericResponse<int> result = new();
            try
            {
                result.Success = true;
                result.Data = await _repository.UpdateRoadMapStatusAsync(roadMapId);
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = ex.Message;
                result.Error = ex.InnerException?.Message;
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }


        public async Task<GenericResponse<int>> PackageReassignUpdateAsync(PackageReassign entity, Guid userId)
        {
            GenericResponse<int> result = new();
            try
            {
                int _result = await _repository.PackageReassignUpdateAsync(entity, userId);
                result.Success = true;
                result.Data = _result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = ex.Message;
                result.Error = ex.InnerException?.Message;
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<BagInfo>> GetBagInfoAsync(string bag)
        {
            GenericResponse<BagInfo>? response = new();

            var entity = await _repository.GetBagInfo(bag);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<BagInfo>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<int>> GetManifestIdByPackageNumberAsync(string _packagenumber)
        {
            GenericResponse<int> response = new();

            response.Success = true;
            response.Data = await _repository.GetManifestIdByPackageNumber(_packagenumber);

            return response;
        }

        public async Task<GenericResponse<AddManifestPackageResponse>> AddManifestPackageAsync(AddManifestPackageRequest entity)
        {
            GenericResponse<AddManifestPackageResponse> result = new();

            try
            {
                result.Success = true;
                result.Data = await _repository.AddManifestPackageAsync(entity);
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = ex.Message;
            }            

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        #region REPORTING

        public async Task<GenericResponse<ManifestReport_GeneralInfo>> GetManifestGenralInformationAsync(int companyId, string manifestNumber)
        {
            GenericResponse<ManifestReport_GeneralInfo>? response = new();

            var entity = await _repository.GetManifestGenralInformation(companyId, manifestNumber);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<ManifestReport_GeneralInfo>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<List<ManifestReport_BillingInfo>>> GetManifestBillingInformationAsync(int companyId, string manifestNumber)
        {
            GenericResponse<List<ManifestReport_BillingInfo>> response = new();

            var entity = await _repository.GetManifestBillingInformation(companyId, manifestNumber);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<ManifestReport_BillingInfo>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<List<ManifestPreAlert>>> GetManifestPreAlertAsync(int companyId, string manifestNumber)
        {
            GenericResponse<List<ManifestPreAlert>> response = new();

            var entity = await _repository.GetManifestPreAlert(companyId, manifestNumber);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<ManifestPreAlert>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<ManifestReport_ExcelData>> GetManifestReportExcelDataAsync(int companyId, string manifestNumber)
        {
            GenericResponse<ManifestReport_ExcelData> response = new();

            var entity = await _repository.GetManifestReportExcelData(companyId, manifestNumber);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<ManifestReport_ExcelData>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<ManifestReport_BagExcelData>> GetManifestReportByBagExcelDataAsync(int companyId, string manifestNumber)
        {
            GenericResponse<ManifestReport_BagExcelData> response = new();

            var entity = await _repository.GetManifestReportBagExcelData(companyId, manifestNumber);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<ManifestReport_BagExcelData>(entity);
            }

            return response;
        }



        public async Task<GenericResponse<List<CourierDeconsolidationModel>>> GetCourierDeconsolidationDataAsync(int companyId, int manifestId, decimal freightValue, string category)
        {
            GenericResponse<List<CourierDeconsolidationModel>> result = new();

            var entities = await _repository.GetCourierDeconsolidationDataAsync(companyId, manifestId, freightValue, category);
            if (entities != null)
            {
                result.Data = _mapper.Map<List<CourierDeconsolidationModel>>(entities);
                result.Success = true;
            }

            return result;
        }

        #endregion
        public async Task<GenericResponse<List<PackagingCourierReport>>> GetPackagingCourierReportAsync(int companyId, string manifestNumber)
        {
            GenericResponse<List<PackagingCourierReport>> response = new();

            var data = await _repository.GetPackagingCourierReport(companyId, manifestNumber);
            response.Success = true;
            response.Data = data.ToList();

            return response;
        }

        public async Task<GenericResponse<ResponsePackageConsolidateReport>> GetPackagingConsolidatedReportAsync(string manifestNumber, int companyId)
        {
            GenericResponse<ResponsePackageConsolidateReport> response = new();

            var data = await _repository.GetPackagingConsolidatedReportAsync(manifestNumber, companyId);

            response.Success = true;
            response.Data = new ResponsePackageConsolidateReport()
            {
                mainData = data.mainData,
                GeneralInfo = data.GeneralInfo,
            };
            return response;
        }



    }
}
