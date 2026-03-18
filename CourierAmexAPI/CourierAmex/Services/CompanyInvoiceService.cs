using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class CompanyInvoiceService : ICompanyInvoiceService
    {
        private readonly ICompanyInvoiceRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public CompanyInvoiceService(IMapper mapper, ICompanyInvoiceRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }
        public async Task<GenericResponse<List<ManifestModel>>> GetManifestAsync(int companyid)
        {
            GenericResponse<List<ManifestModel>> result = new();

            var entities = await _repository.GetManifestAsync(companyid);
            if (null != entities)
            {
                result.Data = _mapper.Map<List<ManifestModel>>(entities);
                result.Success = true;

            }

            return result;
        }
        public async Task<GenericResponse<CompanyInvoiceData>> GetInvoiceDataByCustomerAsync(string clientid, string packagenumber)
        {
            GenericResponse<CompanyInvoiceData>? response = new();
            var entity = await _repository. GetInvoiceDataByCustomerAsync(clientid, packagenumber);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<CompanyInvoiceData>(entity);
            }

            return response;
        }
        public async Task<GenericResponse<CompanyInvoiceData>> GetInvoiceDataByManifestAsync(int manifestid, string packagenumber)
        {
            GenericResponse<CompanyInvoiceData>? response = new();
            var entity = await _repository.GetInvoiceDataByManifestAsync(manifestid, packagenumber);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<CompanyInvoiceData>(entity);
            }

            return response;
        }
        public async Task<GenericResponse<int>> VerifyPackageNumberAndManifestIdAsync(int manifestid, string packagenumber)
        {
            GenericResponse<int>? response = new();
            var entity = await _repository.VerifyPackageNumberAndManifestIdAsync(manifestid, packagenumber);

            response.Success = true;
            response.Data = entity;


            return response;
        }
        public async Task<GenericResponse<int?>> CreateInvoiceHeaderAsync(ComapnyInvoiceHeader entity)
        {
            GenericResponse<int?> result = new();
            if (null != entity)
            {

                result.Success = true;
                result.Data = await _repository.CreateInvoiceHeader(entity);

            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }
        public async Task<GenericResponse<int?>> CreateInvoiceDetailAsync(CompanyInvoiceDetail entity)
        {
            GenericResponse<int?> result = new();
            if (null != entity)
            {

                result.Success = true;
                result.Data = await _repository.CreateInvoiceDetail(entity);

            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }
        public async Task<GenericResponse<int?>> GetNewInvoiceNumberAsync()
        {
            GenericResponse<int?> result = new();


            result.Success = true;
            result.Data = await _repository.GetNewInvoiceNumber();



            return result;
        }
        public async Task<GenericResponse<List<InvoiceArticle>>> GetInvoiceArticlesJamaicaAsync(string zone, float weight, float Value, float volume, int shippingType, int package)
        {
            GenericResponse<List<InvoiceArticle>> result = new();

            var entities = await _repository.GetInvoiceArticlesJamaicaAsync(zone, weight, Value, volume, shippingType, package);
            if (null != entities)
            {
                result.Data = _mapper.Map<List<InvoiceArticle>>(entities);
                result.Success = true;

            }

            return result;
        }
        public async Task<GenericResponse<List<InvoiceArticle>>> GetInvoiceArticlesAsync(string customer, int type, float weight, float volume, int shippingType, string packages)
        {
            GenericResponse<List<InvoiceArticle>> result = new();

            var entities = await _repository.GetInvoiceArticlesAsync(customer, type, weight, volume, shippingType, packages);
            if (null != entities)
            {
                result.Data = _mapper.Map<List<InvoiceArticle>>(entities);
                result.Success = true;

            }

            return result;
        }
        public async Task<GenericResponse<int?>> UpdateInvoiceStatus(string packagenumbers)
        {
            GenericResponse<int?> result = new();


            result.Success = true;
            result.Data = await _repository.UpdateInvoiceStatus(packagenumbers);



            return result;
        }
        public async Task<GenericResponse<ElectronicInvoice>> GetElectronicInvoiceInformationAsync(string customerCode)
        {
            GenericResponse<ElectronicInvoice> result = new();

            try
            {
                result.Data = await _repository.GetElectronicInvoiceInformationAsync(customerCode);
                result.Success = true;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Error = ex.Message;
            }

            return result;
        }
        public async Task<GenericResponse<int?>> SaveElectronicInvoiceInformationAsync(InsertElectronicInvoice entity)
        {
            GenericResponse<int?> result = new();
            if (null != entity)
            {

                result.Success = true;
                result.Data = await _repository.SaveElectronicInvoiceInformationAsync(entity);

            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }
        public async Task<GenericResponse<int?>> SaveMiamiInvoiceAsync(InsertMiamiInvoice entity)
        {
            GenericResponse<int?> result = new();
            if (null != entity)
            {

                result.Success = true;
                result.Data = await _repository.SaveMiamiInvoiceAsync(entity);

            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }
        public async Task<GenericResponse<int?>> ManifestInvoiceAsync(ManifestInvoice entity)
        {
            GenericResponse<int?> result = new();
            if (null != entity)
            {

                result.Success = true;
                result.Data = await _repository.ManifestInvoiceAsync(entity);

            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }
        public async Task<GenericResponse<CompanyExchangeRate>> GetCompanyExchangeRateAsync(int CompanyId, int InvoiceNumber)
        {
            GenericResponse<CompanyExchangeRate> result = new();

            try
            {
                var exchangeRate = await _repository.GetCompanyExchangeRateAsync(CompanyId, InvoiceNumber);
                result.Data = await _repository.GetCompanyExchangeRateAsync(CompanyId,InvoiceNumber);
                result.Success = true;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Error = ex.Message;
            }

            return result;
        }

        public async Task<GenericResponse<List<SalesSummaryReport>>?> GetSalesSummaryAsync(string startDate, string endDate, string customerCode)
        {
            GenericResponse<List<SalesSummaryReport>> result = new();

            var entities = await _repository.GetSalesSummaryAsync(startDate, endDate, customerCode);
            if (null != entities)
            {
                result.Data = _mapper.Map<List<SalesSummaryReport>>(entities);
                result.Success = true;

            }

            return result;
        }

        #region REPORT
        public async Task<GenericResponse<List<InvoiceCreditPending>>> Get_OutstandingCreditCustomerInvoicesAsync(int companyid, DateTime startDate, DateTime endDate, string zoneIds)
        {
            GenericResponse<List<InvoiceCreditPending>> result = new();

            var entities = await _repository.Get_Report_OutstandingCreditCustomerInvoices(companyid, startDate, endDate, zoneIds);
            if (null != entities)
            {
                result.Data = _mapper.Map<List<InvoiceCreditPending>>(entities);
                result.Success = true;

            }

            return result;
        }

        #endregion
    }
}
