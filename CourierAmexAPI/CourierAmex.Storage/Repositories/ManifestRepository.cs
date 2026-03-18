using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using System.ComponentModel.Design;
using Newtonsoft.Json.Linq;
using System.Data;
using System;
using System.Reflection;

namespace CourierAmex.Storage.Repositories
{
    public class ManifestRepository : IManifestRepository
    {
        private readonly IDalSession _session;

        public ManifestRepository(IDalSession session)
        {
            _session = session;
        }


        #region Public Methods
        public async Task<IEnumerable<Manifest>> ValidateNumberAsync(long id, string number)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Manifest>("[dbo].[BKO_Manifest_ValidateNumber]", new
            {
                inId = id,
                inNumber = number
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Manifest>> GetPagedAsync(FilterByDomain request)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Manifest>("[dbo].[BKO_Manifest_GetPaged]", new
            {
                inCompanyId = request.CompanyId,
                inPageSize = request.PageSize,
                inPageIndex = request.PageIndex,
                inSortBy = request.SortBy,
                inFilterBy = request.Criteria,
                inClosed = request.Status,
                inShipTypeId = request.ShipTypeId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Manifest?> GetByIdAsync(long id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_Manifest_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);

            var entity = await multi.ReadSingleOrDefaultAsync<Manifest>();
            return entity;
        }

        public async Task<IEnumerable<ManifestScanner>> GetManifestScanner(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<ManifestScanner>("[dbo].[BKO_GetManifiestsScanner]", new
            {
                CompanyId = companyId,
                PageSize = pageSize,
                PageIndex = pageIndex,
                SortBy = orderBy,
                FilterBy = filterBy,
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<IEnumerable<ManifestScanner>> GetManifestScannerWithoutPagination(int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<ManifestScanner>("[dbo].[BKO_GetManifiestsScannerAllData]", new
            {
                CompanyId = companyId,
                SortBy = "",
                FilterBy = "",
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<IEnumerable<RoadMapstReport>> GetRoadMapsReportAsync(int roadMapId, int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<RoadMapstReport>("[dbo].[BKO_GetRoadMapsReport]", new
            {
                RoadMapId = roadMapId,
                CompanyId = companyId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<int> InsertNotificationAsync(int packageNumber, string docType, int status)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.ExecuteAsync("[dbo].[BKO_InsertNotification]", new
            {
                NUMERO = packageNumber,
                TIPODOCUMENTO = docType,
                ESTADO = status
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ParcelDeliveryReport>> GetParcelDeliveryReportAsync(int roadMapId, int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<ParcelDeliveryReport>("[dbo].[BKO_ParcelDeliveryReport]", new
            {
                RoadMapId = roadMapId,
                CompanyId = companyId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PendingPackageInfo>> GetPendingPackages(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", string mn = "")
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PendingPackageInfo>("[dbo].[BKO_GetPendingPackages]", new
            {
                ManifestNumber = mn,
                PageSize = pageSize,
                PageIndex = pageIndex,
                SortBy = orderBy,
                FilterBy = filterBy,
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<CountManifestScanner?> GetCountManifestScanner(string mn)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<CountManifestScanner>("[dbo].[BKO_GetCountManifestScanner]", new
            {
                manifestNumber = mn
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<IEnumerable<RouteSheet>> GetFilterRouteSheetAsync(string? manifestId, string? zoneCode, int? status, int? page, int? index, string? filter)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<RouteSheet>("[dbo].[BKO_FilterRouteSheet]", new
            {
                MANIFEST_NUMBER = manifestId,
                ZONE_CODES = zoneCode,
                STATUS = status,
                PageSize = page,
                PageIndex = index,
                Filter = filter
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<int> DeletePackageFromRouteMapAsync(List<int>? packageId, int? roadMapId)
        {
            if (packageId == null || packageId.Count == 0) return 0;

            int totalAffectedRows = 0;

            using var connection = await _session.GetReadOnlyConnectionAsync();

            foreach (var paq in packageId)
            {
                var affectedRows = await connection.ExecuteAsync("[dbo].[BKO_DeletePackageFromRouteMap]", new
                {
                    HOJARUTA_ID = roadMapId,
                    PAQ_ID = paq
                }, commandType: System.Data.CommandType.StoredProcedure);

                totalAffectedRows += affectedRows;
            }
            return totalAffectedRows;
        }

        public async Task<(int Resultado, bool Facturado)> GetValidatePackageRouteAsync(int? packageNumber, int? roadMapId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new DynamicParameters();
            parameters.Add("@PAQUETE_ID", packageNumber, DbType.Int32);
            parameters.Add("@HOJARUTA_ID", roadMapId, DbType.Int32);
            parameters.Add("@RESULTADO", dbType: DbType.Int32, direction: ParameterDirection.Output);
            parameters.Add("@FACTURADO", dbType: DbType.Boolean, direction: ParameterDirection.Output);

            await connection.ExecuteAsync("[dbo].[BKO_ValidatePackageRoute]", parameters, commandType: CommandType.StoredProcedure);

            int resultado = parameters.Get<int?>("@RESULTADO") ?? 0;
            bool facturado = parameters.Get<bool?>("@FACTURADO") ?? false;

            return (resultado, facturado);
        }


        public async Task<Manifest?> CreateOrUpdateAsync(Manifest entity, Guid userId)
        {
            long? id = entity.Id > 0 ? entity.Id : null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<long>("[dbo].[BKO_Manifest_CreateOrUpdate]", new
            {
                inId = id,
                inCompanyId = entity.CompanyId,
                inAddress = entity.Address,
                inManifestDate = entity.ManifestDate,
                inManifestNumber = entity.ManifestNumber,
                inReady = entity.Ready,
                inInvoiced = entity.Invoiced,
                inClosed = entity.Closed,
                inSynchronized = entity.Synchronized,
                inName = entity.Name,
                inType = entity.Type,
                inShipType = entity.ShipType,
                inShippingWay = entity.ShippingWay,
                inInvoiceStatus = entity.InvoiceStatus,
                inAutomaticBilling = entity.AutomaticBilling,
                inStatus = (byte)entity.Status,
                inUserId = userId
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (long.TryParse(newId.ToString(), out long idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }

            return entity;
        }

        public async Task<long> ValidateDeleteAsync(long id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<long>("[dbo].[BKO_Manifest_ValidateDelete]", new
            {
                inId = id,
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (long.TryParse(newId.ToString(), out long idOutput))
            {
                id = idOutput;
            }

            return id;
        }

        public async Task<IEnumerable<Manifest>> GetManifestsByPackageTypeAsync(string companyId, int state, int manifestType, string type)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var manifest = await connection.QueryAsync<Manifest>(
                "[dbo].[BKO_GetManifests]",
                new
                {
                    COMPANYID = companyId,
                    STATE = state,
                    MANIFESTTYPE = manifestType,
                    TYPE = type
                }, null, null, System.Data.CommandType.StoredProcedure
            );

            return manifest;
        }

        public async Task<ScannedPackageInfo?> GetScannedPackage(string packageNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<ScannedPackageInfo>("[dbo].[BKO_GetPackageInfo]", new
            {
                packageNumber = packageNumber
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<ScanLog?> CreateScanLogAsync(ScanLog entity, Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<long>("[dbo].[BKO_InsertScanLog]", new
            {
                USER = userId.ToString(),
                LOGTYPE = entity.LogType,
                SCANTYPE = entity.ScanType,
                PACKAGENUMBER = entity.PackageNumber,
                PREVIOUSMANIFEST = entity.PreviousManifest,
                NEWMANIFEST = entity.NewManifest,
                PREVIOUSBAG = entity.PreviousBag,
                NEWBAG = entity.NewBag
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (long.TryParse(newId.ToString(), out long idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }

            return entity;
        }

        public async Task<int> PackageScanUpdateAsync(ScannedPackageInfo entity)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_PackageScan_Update]", new
            {
                PACKAGE_NUMBER = entity.PackageNumber,
                PACKAGE_STATUS = entity.EstId,
                DETAIL_ID = entity.ManifestDetailId,
                TYPE = entity.Type
            }, null, null, System.Data.CommandType.StoredProcedure);

            return result;
        }

        public async Task<int> UpdateRoadMapStatusAsync(List<int> roadMapIds)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            int totalAffected = 0;

            foreach (var id in roadMapIds)
            {
                var result = await connection.ExecuteAsync(
                    "[dbo].[BKO_UpdateRoadMapStatus]",
                    new { HOJARUTA_ID = id },
                    commandType: System.Data.CommandType.StoredProcedure);

                totalAffected += result;
            }

            return totalAffected;
        }

        public async Task<int> PackageReassignUpdateAsync(PackageReassign entity, Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {
                var result = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_UpdateReassignPackage]", new
                {
                    PACKAGENUMBER = entity.PackageNumber,
                    MANIFESTID = entity.ManifestId,
                    BAGNUMBER = entity.BagNumber,
                    MODIFIEDBY = userId
                }, null, null, System.Data.CommandType.StoredProcedure);

                return result;
            }
            catch (Exception)
            {
                return 0;
            }



        }

        public async Task<BagInfo?> GetBagInfo(string bag)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<BagInfo>("[dbo].[BKO_GetBagInfo]", new
            {
                bag = bag
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<PackageManifestInfo> GetPackageManifestInfoAsync(int CompanyId, int PackageNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<PackageManifestInfo>("[dbo].[BKO_GetPackageManifestInfo]", new
            {
                CompanyId = CompanyId,
                PackageNumber = PackageNumber
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<List<DeliveryTypes>> GetDeliveryTypesAsync()
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<DeliveryTypes>(
                "[dbo].[BKO_GetDeliveryType]",
                commandType: System.Data.CommandType.StoredProcedure
            );
            return result.ToList();
        }


        public async Task<(IEnumerable<RouteSheetDetail> List, int Total)> GetRouteSheetDetailAsync(int routeSheetId, int status, string companyId, int? page, int? index, string? filter)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new
            {
                HOJARUTA_ID = routeSheetId == 0 ? (int?)null : routeSheetId,
                ESTADO = status,
                COMPANY_ID = companyId,
                PageIndex = index,
                PageSize = page,
                Filter = filter
            };

            using var multi = await connection.QueryMultipleAsync(
                "[dbo].[BKO_GetRouteSheet]",
                parameters,
                commandType: System.Data.CommandType.StoredProcedure
            );

            var list = await multi.ReadAsync<RouteSheetDetail>();
            var total = await multi.ReadFirstOrDefaultAsync<int>();

            return (list, total);
        }


        public async Task<IEnumerable<RoutePackageReport>> GetPackageByRouteReportAsync(int routeSheetId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<RoutePackageReport>("[dbo].[Bko_GetPackageByRouteReport]", new
            {
                HOJARUTA_ID = routeSheetId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<int> InsertRouteAsync(RouteInsert model)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new DynamicParameters();
            parameters.Add("@DESCRIPCION", model.Description);
            parameters.Add("@IDUSUARIO", model.UserId);
            parameters.Add("@ESTADO", model.Status);
            parameters.Add("@ZONA_ID", model.ZoneId);
            parameters.Add("@ID", dbType: DbType.Int32, direction: ParameterDirection.Output);
            parameters.Add("@ID_TIPOENTREGA", model.DeliveryTypeId);
            parameters.Add("@ID_CAJA", model.PointOfSaleId);
            parameters.Add("@PAIS", model.CompanyId);

            await connection.ExecuteAsync(
                "[dbo].[BKO_InsertRouteHeader]",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            int routeHeaderId = parameters.Get<int>("@ID");

            foreach (var packageId in model.PackageIds)
            {
                await connection.ExecuteAsync(
                    "[dbo].[BKO_InsertRouteSheetDetail]",
                    new { HOJARUTA_ID = routeHeaderId, PAQ_ID = packageId },
                    commandType: CommandType.StoredProcedure
                );
            }

            return routeHeaderId;
        }


        public async Task<int> GetManifestIdByPackageNumber(string _packagenumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_GetManifestIdByPackageNumber]", new
            {
                PACKAGENUMBER = Convert.ToInt64(_packagenumber)
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<AddManifestPackageResponse?> AddManifestPackageAsync(AddManifestPackageRequest entity)
        {
            var response = new AddManifestPackageResponse() { Response = 0 };
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QueryFirstAsync<Int32>("[dbo].[BKO_INSERT_MANIFESTPACKAGE]", new
            {
                MANIFEST_ID = entity.ManifestId,
                PACKAGE_NUMBER = entity.PackageNumber,
                MANIFEST_NUMBER = entity.ManifestNumber,
                CREATED_BY = entity.CreatedBy,
                TYPE = entity.Type,
                MANIFESTED_STATUS_ID = entity.ManifestStatusId,
                TRACKING_NUMBER = entity.TrackingNumber,
                TRACKING_ADDRESS = entity.TrackingAddress,
                MANIFEST_SHIPMENT_TYPE = entity.ManifestShipmentType,
                GATEWAY = entity.Gateway
            }, null, null, System.Data.CommandType.StoredProcedure);

            response = new AddManifestPackageResponse() { Response = newId };

            return response;
        }

        #endregion


        #region REPORTING

        public async Task<ManifestReport_GeneralInfo?> GetManifestGenralInformation(int companyId, string manifestNumber)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var manifest = await connection.QuerySingleOrDefaultAsync<ManifestReport_GeneralInfo>(
                "[dbo].[BKO_GetManifiestInfo]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                }, null, null, System.Data.CommandType.StoredProcedure
            );

            return manifest;
        }

        public async Task<IEnumerable<ManifestReport_BillingInfo>> GetManifestBillingInformation(int companyId, string manifestNumber)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var manifest = await connection.QueryAsync<ManifestReport_BillingInfo>(
                "[dbo].[BKO_GetManifestBilling]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                }, null, null, System.Data.CommandType.StoredProcedure
            );

            return manifest;
        }

        public async Task<IEnumerable<ManifestPreAlert>> GetManifestPreAlert(int companyId, string manifestNumber)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var manifest = await connection.QueryAsync<ManifestPreAlert>(
                "[dbo].[BKO_GetManifestPreAlert]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                }, null, null, System.Data.CommandType.StoredProcedure
            );

            return manifest;
        }

        public async Task<ManifestReport_ExcelData> GetManifestReportExcelData(int companyId, string manifestNumber)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var billingInfo = await connection.QueryAsync<ManifestReport_BillingInfo>(
                "[dbo].[BKO_GetManifestBilling]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                }, null, null, System.Data.CommandType.StoredProcedure
            );

            var generalInfo = await connection.QuerySingleOrDefaultAsync<ManifestReport_GeneralInfo>(
                "[dbo].[BKO_GetManifiestInfo]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                }, null, null, System.Data.CommandType.StoredProcedure
            );

            return new ManifestReport_ExcelData() { BillingData = billingInfo.ToList(), GeneralInfo = generalInfo };
        }

        public async Task<ManifestReport_BagExcelData> GetManifestReportBagExcelData(int companyId, string manifestNumber)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var bagBilling = await connection.QueryAsync<ManifestReport_BagInfo>(
                "[dbo].[BKO_GetManifestReportByBag]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                },
                commandType: CommandType.StoredProcedure
            );

            var generalInfo = await connection.QuerySingleOrDefaultAsync<ManifestReport_GeneralInfo>(
                "[dbo].[BKO_GetManifiestInfo]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                },
                commandType: CommandType.StoredProcedure
            );

            return new ManifestReport_BagExcelData
            {
                BagBillingData = bagBilling.ToList(),
                GeneralInfo = generalInfo
            };
        }






        public async Task<IEnumerable<CourierDeconsolidationModel>> GetCourierDeconsolidationDataAsync(int companyId, int manifestId, decimal freightValue, string category)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<CourierDeconsolidationModel>(
                "[dbo].[BKO_REPORT_DECONSOLIDATION_COURIER]",
                new
                {
                    MANIFESTID = manifestId,
                    FREIGHTVALUE = freightValue,
                    CATEGORYID = category,
                    COMPANYID = companyId
                },
                commandType: System.Data.CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<PackagingCourierReport>> GetPackagingCourierReport(int companyId, string manifestNumber)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var data = await connection.QueryAsync<PackagingCourierReport>(
                "[dbo].[BKO_Report_Packaging_Courier]",
                new
                {
                    COMPANYID = companyId,
                    NUMERO = manifestNumber
                },
                commandType: CommandType.StoredProcedure
            );

            return data;
        }


        public async Task<ResponsePackageConsolidateReport> GetPackagingConsolidatedReportAsync(string manifestNumber, int companyId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<PackagingConsolidatedReport>(
                "[dbo].[BKO_Report_Packaging_Consolidated]",
                new
                {
                    NUMERO = manifestNumber,
                    CompanyId = companyId
                },
                commandType: CommandType.StoredProcedure
                );

            var generalInfo = await connection.QuerySingleOrDefaultAsync<ManifestReport_GeneralInfo>(
                "[dbo].[BKO_GetManifiestInfo]",
                new
                {
                    COMPANYID = companyId,
                    MANIFESTNUMBER = manifestNumber
                },
                commandType: CommandType.StoredProcedure
            );

            return new ResponsePackageConsolidateReport
            {
                mainData = result.ToList(),
                GeneralInfo = generalInfo
            };
        }







        #endregion
    }
}
