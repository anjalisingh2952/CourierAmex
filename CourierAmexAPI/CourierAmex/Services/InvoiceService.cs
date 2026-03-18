using AutoMapper;
using CourierAmex.Models;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Repositories.Interfaces;
using CourierAmex.Storage;
using CourierAmex.Storage.Domain;
using Org.BouncyCastle.Asn1.Ocsp;
using DocumentFormat.OpenXml.Wordprocessing;

namespace CourierAmex.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public InvoiceService(IMapper mapper, IInvoiceRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<(IEnumerable<Invoice> invoices, int totalRows)>> GetDocumentByCustomerAsync(string clientId, string fromDate, string toDate, string filters, int? pageNumber = null, int? pageSize = null)
        {
            GenericResponse<(IEnumerable<Invoice> invoices, int totalRows)>? response = new();
            var entity = await _repository.GetDocumentByCustomerAsync(clientId, fromDate, toDate, filters,pageNumber,pageSize);
            if (entity.invoices != null)
            {
                response.Success = true;
                response.Data = _mapper.Map<(IEnumerable<Invoice> invoices, int totalRows)>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<IEnumerable<InvoiceModel>>> InvoicesPendingByCustomer(string clientId)
        {
            GenericResponse<IEnumerable<InvoiceModel>>? response = new();
            var entity = await _repository.InvoicesPendingByCustomer(clientId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<InvoiceModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<IEnumerable<InvoiceDetailsModel>>> GetPackagesByInvoice(int invoiceNumber)
        {
            GenericResponse<IEnumerable<InvoiceDetailsModel>>? response = new();
            var entity = await _repository.GetPackagesByInvoice(invoiceNumber);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<InvoiceDetailsModel>>(entity);
            }

            return response;
        }


        public async Task<FullInvoiceResult> GetInvoiceInfoByIdAsync(int invoiceId)
        {
            var entities = await _repository.GetInvoiceInfoByIdAsync(invoiceId);
            if (null != entities)
            {
                return _mapper.Map<FullInvoiceResult>(entities);
            }

            return new FullInvoiceResult();
        }

        public async Task<FullInvoiceResult> GetPaymentInfoById(int paymentId, int invoiceNumber)
        {
            var entities = await _repository.GetPaymentInfoByIdAsync(paymentId, invoiceNumber);
            if (null != entities)
            {
                return _mapper.Map<FullInvoiceResult>(entities);
            }

            return new FullInvoiceResult();
        }


        public async Task<GenericResponse<IEnumerable<InvoiceModel>>> GetInvoiceInfoDetailByIdAsync(int invoiceId)
        {
            GenericResponse<IEnumerable<InvoiceModel>>? response = new();
            var entity = await _repository.GetInvoiceInfoDetailByIdAsync(invoiceId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<InvoiceModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<PaymentInfoModel>> GetPaymentDetails(int companyId, int paymentId)
        {
            GenericResponse<PaymentInfoModel>? response = new();
            var entity = await _repository.GetPaymentDetailsAsync(companyId, paymentId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<PaymentInfoModel>(entity);
            }

            return response;
        }

        public async Task<List<PaymentInfoModel>> GetPaymentDetailsForLable(int companyId, int paymentId)
        {
            List<PaymentInfoModel>? response = new();
            var entity = await _repository.GetPaymentDetailsForLableAsync(companyId, paymentId);
            if (null != entity)
            {
                response = _mapper.Map<List<PaymentInfoModel>>(entity);
            }

            return response;
        }

        public async Task<List<PaymentInfoModel>> GetPaymentInfoByInvoiceId(int companyId, int InvoiceNumber)
        {
            List<PaymentInfoModel>? response = new();
            var entity = await _repository.GetPaymentInfoByInvoiceIdAsync(companyId, InvoiceNumber);
            if (null != entity)
            {
                response = _mapper.Map<List<PaymentInfoModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<Boolean>> IsElectronicInvoiceProcessed(int companyId, int invoiceNumber)
        {
            GenericResponse<Boolean>? response = new();


            var entity = await _repository.IsElectronicInvoiceProcessedAsync(companyId, invoiceNumber);
            if (null != entity)
            {
                response.Data = entity;
                response.Success = true;
                return response;
            }

            return response;
        }

        public async Task<GenericResponse<string>> GenerateAccountingEntry(int companyId, string periodDate, string entryDate, string entryDescription, string statusIndicator, string sourceSystemCode, string systemIndicator, string inclusionDate, int inclusionUser)
        {
            GenericResponse<string>? response = new();

            var entity = await _repository.GenerateAccountingEntryAsync(companyId, periodDate, entryDate, entryDescription, statusIndicator, sourceSystemCode, systemIndicator, inclusionDate, inclusionUser);
            if (null != entity)
            {
                response.Data = entity;
                response.Success = true;
                return response;
            }

            return response;
        }

        public async Task<GenericResponse<int>> GenerateAccountingEntryInvoice(int companyId, string entryCode, int invoiceNumber)
        {
            GenericResponse<int>? response = new();

            var entity = await _repository.GenerateAccountingEntryInvoiceAsync(companyId, entryCode, invoiceNumber);
            if (null != entity)
            {
                response.Data = entity;
                response.Success = true;
                return response;
            }

            return response;
        }

        public async Task<GenericResponse<IEnumerable<TemplateAccountModel>>> SelectTemplateAccount(int companyId, string moduleCode, int templateCode)
        {
            GenericResponse<IEnumerable<TemplateAccountModel>> response = new();

            var entity = await _repository.SelectTemplateAccountAsync(companyId, moduleCode, templateCode);
            if (null != entity)
            {
                response.Data = _mapper.Map<IEnumerable<TemplateAccountModel>>(entity); ;
                response.Success = true;

                return response;


            }

            return response;
        }

        public async Task<GenericResponse<int>> ValidateAccountingEntry(int companyId, string entryCode)
        {
            var response = new GenericResponse<int>();

            try
            {
                var storeInventoryPackages = await _repository.ValidateAccountingEntryAsync(companyId, entryCode);


                if (storeInventoryPackages.Any())
                {
                    response.Success = true;
                    response.Data = _mapper.Map<int>(storeInventoryPackages.First());
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

        public async Task<GenericResponse<int>> ApplyAccountingEntry(int companyId, string entryCode)
        {
            var response = new GenericResponse<int>();

            try
            {
                var acc = await _repository.ApplyAccountingEntryAsync(companyId, entryCode);


                if (acc.Any())
                {
                    response.Success = true;
                    response.Data = _mapper.Map<int>(acc);
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

        public async Task<GenericResponse<int>> InsertAccountingDetail(AccountingDetail accountingDetail)
        {
            GenericResponse<int> response = new();

            var entity = await _repository.InsertAccountingDetailAsync(accountingDetail);
            if (null != entity)
            {
                response.Data = _mapper.Map<int>(entity); ;
                response.Success = true;

                return response;
            }

            return response;
        }

        public async Task<GenericResponse<int>> InsertCreditNote(CreditNoteInsertRequestModel request)
        {
            var response = new GenericResponse<int>();

            try
            {
                var param = new CreditNoteInsertRequest
                {
                    ReconciliationId = request.ReconciliationId,
                    CompanyId = request.CompanyId,
                    ClientOrSupplierType = request.ClientOrSupplierType,
                    ClientOrSupplierCode = request.ClientOrSupplierCode,
                    CurrencyCode = request.CurrencyCode,
                    ExchangeRate = request.ExchangeRate,
                    Amount = request.Amount,
                    Observation = request.Observation,
                    Status = request.Status,
                    SystemDate = request.SystemDate,
                    TransactionDate = request.TransactionDate,
                    Category = request.Category,
                    ModifiedByUserId = request.ModifiedByUserId,
                    InvoiceNumber = request.InvoiceNumber,
                    CreditNoteAction = request.CreditNoteAction,
                    InvoiceAmountInDollars = request.InvoiceAmountInDollars,
                    InvoiceAmountInColones = request.InvoiceAmountInColones,
                    AccountingEntryCode = request.AccountingEntryCode,
                    ApplyElectronicInvoice = request.ApplyElectronicInvoice
                };

                var result = await _repository.InsertCreditNoteAsync(param);

                response.Data = result;
                response.Success = true;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error inserting credit note: " + ex.Message;
            }

            return response;
        }


        public async Task<GenericResponse<int>> CancelInvoice(int companyId, int invoiceId, string userId)
        {
            var response = new GenericResponse<int>();

            try
            {
                var result = await _repository.CancelInvoiceAsync(companyId, invoiceId, userId);
                response.Data = result;
                response.Success = true;
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = "Error inserting credit note: " + ex.Message;
            }

            return response;
        }

        public async Task<GenericResponse<List<PendingInvoiceReportModel>>> GetPendingInvoicesReportAsync(
        int companyId, DateTime startDate, DateTime endDate, int paymentType, int zoneId)
        {
            var response = new GenericResponse<List<PendingInvoiceReportModel>>();

            try
            {
                // Fetch the data from the repository
                var res = await _repository.GetPendingInvoicesReportAsync(companyId, startDate, endDate, paymentType, zoneId);

                if (res != null && res.Any())
                {
                    response.Success = true;
                    // Map to the DTO model (PendingInvoiceReportModel)
                    response.Data = _mapper.Map<List<PendingInvoiceReportModel>>(res.ToList());
                }
                else
                {
                    response.Success = false;
                    response.Message = "No pending invoices found for the given criteria.";
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"An error occurred while generating the report. Exception: {ex.Message}";
            }


            return response;
        }


        public async Task<GenericResponse<List<SalesReportModel>>> GetSalesReportAsync(
        int companyId, DateTime startDate, DateTime endDate, string customerCode)
        {
            var response = new GenericResponse<List<SalesReportModel>>();

            try
            {
                // Fetch the data from the repository
                var res = await _repository.GetSalesReportAsync(companyId, startDate, endDate, customerCode);

                if (res != null && res.Any())
                {
                    response.Success = true;
                    // Map to the DTO model (SalesReportModel) using AutoMapper
                    response.Data = _mapper.Map<List<SalesReportModel>>(res.ToList());
                }
                else
                {
                    response.Success = false;
                    response.Message = "No sales report data found for the given criteria.";
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"An error occurred while generating the sales report. Exception: {ex.Message}";
            }

            return response;
        }


        public async Task<GenericResponse<bool>> InsertCustomsTaxLoadAsync(List<CustomsTaxLoad> taxLoadList)
        {
            var response = new GenericResponse<bool>();

            try
            {
                await _repository.InsertCustomsTaxLoadAsync(taxLoadList);

                response.Success = true;
                response.Data = true;
                response.Message = "Insert successful";
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Insert failed: {ex.Message}";
            }

            return response;
        }


        public async Task<GenericResponse<int?>> GetCustomsTaxByPackageNumberAsync(string packageNumber)
        {
            var response = new GenericResponse<int?>();

            try
            {
                var data = await _repository.GetCustomsTaxByPackageNumberAsync(packageNumber);
                if (data == null || data == 0)
                {
                    response.Success = false;
                    response.Message = "No data found for the specified package number.";
                }
                else
                {
                    response.Success = true;
                    response.Data = data;
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error: {ex.Message}";
            }

            return response;
        }

        public async Task<GenericResponse<int?>> GetCustomsTaxByBagAsync(string bag)
        {
            var response = new GenericResponse<int?>();

            try
            {
                var data = await _repository.GetCustomsTaxByBagAsync(bag);
                if (data == null || data == 0)
                {
                    response.Success = false;
                    response.Message = "No data found for the provided bag";
                }
                else
                {
                    response.Success = true;
                    response.Data = data;
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"Error: {ex.Message}";
            }

            return response;
        }


        public async Task<GenericResponse<List<AeropostMassUploadReport>>> GetAeropostMassUploadReportAsync(int companyId, DateTime startDate, DateTime endDate, int providerId)
        {
            var response = new GenericResponse<List<AeropostMassUploadReport>>();

            // Fetch report data
            var reportData = await _repository.GetAeropostMassUploadReportAsync(companyId, startDate, endDate, providerId);

            if (reportData == null || !reportData.Any())
            {
                response.Success = false;
                response.Message = "No data found for the selected date range.";
                response.Data = new List<AeropostMassUploadReport>();
            }
            else
            {
                response.Success = true;
                // Map the data to AeropostMassUploadReportModel
                response.Data = _mapper.Map<List<AeropostMassUploadReport>>(reportData.ToList());
            }

            return response;
        }

        public async Task<GenericResponse<List<CustomsTaxesReportModel>>> GetCustomsTaxesReportAsync(
         string customerCode, DateTime fromDate, DateTime toDate, string? manifestNumber, string? bag)

        {
            var response = new GenericResponse<List<CustomsTaxesReportModel>>();

            try
            {
                var data = await _repository.GetCustomsTaxesReportAsync(customerCode, fromDate, toDate, manifestNumber, bag);

                if (data != null && data.Any())
                {
                    response.Success = true;
                    response.Data = data.ToList();
                }
                else
                {
                    response.Success = false;
                    response.Message = "No customs taxes data found for the given filters.";
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"An error occurred while fetching the report: {ex.Message}";
            }

            return response;
        }

    }






}
