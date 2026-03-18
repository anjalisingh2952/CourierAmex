using System.ComponentModel.Design;
using AutoMapper;
using ClosedXML.Excel;
using CourierAmex.Models;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories;
using CourierAmex.Storage.Repositories.Interfaces;
using Dapper;

namespace CourierAmex.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;


        public PaymentService(IMapper mapper, IPaymentRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<SignaturePackageResponseModel> GetSignaturePackage(int packageNumber)
        {
            try
            {
                var entities = await _repository.GetSignaturePackageAsync(packageNumber);

                var firstEntity = entities.FirstOrDefault();

                if (firstEntity != null)
                {
                    return _mapper.Map<SignaturePackageResponseModel>(firstEntity);
                }

            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return  new SignaturePackageResponseModel();
        }

        public async Task<List<PointOfSaleModel>> GetPointOfSale(int companyId, string user, int state)
        {
            try
            {
                var entities = await _repository.GetPointOfSaleAsync(companyId,user,state);

                if (entities != null)
                {
                    return _mapper.Map<List<PointOfSaleModel>>(entities);
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return new List<PointOfSaleModel>();
        }

        public async Task<List<PointOfSaleDailySummaryModel>> GetPointOfSaleDailySummary(int CompanyId, int OpeningCode)
        {
            try
            {
                var entities = await _repository.GetPointOfSaleDailySummaryAsync(CompanyId,OpeningCode);

                if (entities != null)
                {
                    return _mapper.Map<List<PointOfSaleDailySummaryModel>>(entities);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return new List<PointOfSaleDailySummaryModel>();
        }

        public async Task<List<PointOfSaleDetailModel>> GetPointOfDetailByOpeningCode(int CompanyId, int? OpeningCode, int? pointOfSaleId, DateTime? ChooseDate)
        {
            try
            {
                var entities = await _repository.GetPointOfDetailByOpeningCodeAsync(CompanyId,OpeningCode,pointOfSaleId,ChooseDate);

                if (entities != null)
                {
                    return _mapper.Map<List<PointOfSaleDetailModel>>(entities);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return new List<PointOfSaleDetailModel>();
        }

        public async Task<int> StartPointOfSale(int companyId, string user, int pointOfSaleId, int inDollars, int inLocal)
        {
            try
            {
                var entities = await _repository.StartPointOfSaleAsync(companyId, user, pointOfSaleId, inDollars, inLocal);

                if (entities != null)
                {
                    return _mapper.Map<int>(entities);
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return 0;
        }

        public async Task<int> CancelPayment(int companyId, int paymentId, string userId)
        {
            try
            {
                var entities = await _repository.CancelPaymentAsync(companyId, paymentId, userId);
                if (entities != null)
                {
                    return _mapper.Map<int>(entities);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return 0;
        }

        public async Task<int> CashInOut(int companyId, string user, int pointOfSaleId, int inDollars, int inLocal,int openingId)
        {
            try
            {
                var entities = await _repository.CashInOutAsync(companyId, user, pointOfSaleId, inDollars, inLocal,openingId);
                if (entities != null)
                {
                    return _mapper.Map<int>(entities);
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return 0;
        }


        public async Task<List<SubPaymentTypeModel>> GetSubPaymentTypeByPaymentId(int CompanyId, int PaymentId, int PointOfSaleId)
        {
            var entities = await _repository.GetSubPaymentTypeByPaymentIdAsync(CompanyId, PaymentId, PointOfSaleId);

            if (entities != null)
            {
                return _mapper.Map<List<SubPaymentTypeModel>>(entities);
            }

            return new List<SubPaymentTypeModel>();
        }

        public async Task<List<PayTypeModel>> GetPaymentType(int CompanyId)
        {
            var entities = await _repository.GetPaymentTypeAsync(CompanyId);

            if (entities != null)
            {
                return _mapper.Map<List<PayTypeModel>>(entities);
            }

            return new List<PayTypeModel>();
        }

        public async Task<int> ClosePointOfSale(int OpeningId)
        {
            var entities = await _repository.ClosePointOfSaleAsync(OpeningId);

            if (entities != null)
            {
                return _mapper.Map<int>(entities);
            }

            return 0;
        }

        public async Task<int> PaymentForInvoices(int customerId, string invoiceCSV, double localAmount, double dollarAmount, double paidAmount, double changeAmount, int currencyCode,
        string paymentType, int subPaymentTypeId, string reference, int pointOfSaleId, int companyId, bool partialPayment, bool creditPayment, string user)
        {
            var entities = await _repository.PaymentForInvoicesAsync(customerId, invoiceCSV,localAmount,dollarAmount,paidAmount,changeAmount,currencyCode,
        paymentType, subPaymentTypeId, reference, pointOfSaleId, companyId, partialPayment, creditPayment, user);

            if (entities != null)
            {
                return _mapper.Map<int>(entities);
            }

            return 0;
        }

        public async Task ProcessEmail(IServiceScope scope, string baseTemplate, EmailQueue email)
        {
            var year = DateTime.Now.Year;
            var session = scope.ServiceProvider.GetRequiredService<IDalSession>();
            var emailQueueService = scope.ServiceProvider.GetRequiredService<IEmailQueueService>();

            try
            {
                var settings = await emailQueueService.LoadSettings();
                if (settings == null) return;
                if (string.IsNullOrEmpty(email.ToAddress))
                    throw new ArgumentNullException(email.ToAddress);

                var emailText = baseTemplate;
                var emailBody = new EmailBody
                {
                    Subject = email.Subject,
                    Text = emailText,
                    IsHtml = email.IsHtml,
                    HasAttachment = email.HasAttachment,
                    Attachment = email.Attachment,
                    AttachmentType = (AttachmentType)email.AttachmentType
                };

                await emailQueueService.SendEmailAsync(email.ToAddress, emailBody);

                email.Status = (byte)EmailQueueStatus.Send;
                await emailQueueService.MarkEmailAsSendAsync(email);
            }
            catch (Exception ex)
            {
                email.Status = (byte)EmailQueueStatus.Error;
                email.Error = ex.Message;
                await emailQueueService.MarkEmailAsErrorAsync(email);
            }

            session.GetUnitOfWork().CommitChanges();
        }


        public async Task<Byte[]> GetPointOfSaleDailyExcelReport(int companyId, int? openingCode, int? pointOfSaleId, DateTime? chooseDate)
        {
            try
            {
                var reportData = await GetPointOfDetailByOpeningCode(companyId, openingCode, pointOfSaleId, chooseDate);

                if (reportData == null || !reportData.Any())
                {
                    return null;
                }

                var groupedData = reportData
                    .GroupBy(d => new { d.PaymentTypeDescription, d.SubPaymentDescription })
                    .Select(g => new
                    {
                        g.Key.PaymentTypeDescription,
                        g.Key.SubPaymentDescription,
                        SumLocal = g.Where(x => x.CurrencyCode == "188").Sum(x => x.PaidAmount),
                        SumDollars = g.Where(x => x.CurrencyCode != "188").Sum(x => x.PaidAmount)
                    })
                    .ToList();

                var aggregatedResult = new
                {
                    TotalDollerSum = reportData.Where(x => x.PaymentId == 0).Sum(x => x.TotalDoller),
                    TotalLocalSum = reportData.Where(x => x.PaymentId == 0).Sum(x => x.TotalLocal),
                    PaidLocal = reportData.Where(x => x.CurrencyCode == "188" && x.PaymentId != 0).Sum(x => x.PaidAmount),
                    PaidDollar = reportData.Where(x => x.CurrencyCode != "188" && x.PaymentId != 0).Sum(x => x.PaidAmount),
                    TotalChangeInLocal = reportData.Where(x => x.CurrencyCode == "188").Sum(x => x.ChangeInLocal),
                    TotalChangeInDollar = reportData.Where(x => x.CurrencyCode != "188").Sum(x => x.ChangeInDollar),
                    TotalLocalOnClosing = reportData.Where(x => x.PaymentId == 0).Sum(x => x.TotalLocal) -
                                          reportData.Where(x => x.CurrencyCode == "188").Sum(x => x.ChangeInLocal),
                    TotalDollarsOnClosing = reportData.Where(x => x.PaymentId == 0).Sum(x => x.TotalDoller) -
                                            reportData.Where(x => x.CurrencyCode != "188").Sum(x => x.ChangeInDollar)
                };

                reportData = reportData.Where(data => data.PaymentId != 0).ToList();

                string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "PointOfSaleDayliReportTemplate.xlsx");
                if (!File.Exists(filePath))
                {
                    return null;
                }

                using (var workbook = new XLWorkbook(filePath))
                {
                    var worksheet = workbook.Worksheet(1);

                    ReplacePlaceholder(worksheet, "{{ReportDate}}", DateTime.Now.ToString());
                    worksheet.Columns("A:O").AdjustToContents();

                    int startRow = 4;
                    startRow = AddHeader(worksheet, startRow);

                    foreach (var detail in reportData)
                    {
                        startRow = AddData(worksheet, startRow, detail);
                    }

                    startRow = AddCashHeader(worksheet, startRow + 2);
                    startRow = AddCashData(worksheet, startRow, aggregatedResult);

                    startRow = AddPayTypeHeader(worksheet, startRow + 2);

                    foreach (var detail in groupedData)
                    {
                        startRow = AddPayTypeData(worksheet, startRow, detail);
                    }

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        return stream.ToArray();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message} | StackTrace: {ex.StackTrace}");
                return null;
            }
        }

        private static int AddHeader(IXLWorksheet worksheet, int lastRow)
        {
            lastRow++;
            var headers = new string[]
            {
                "Client","Date","Payment Type","Payment Form","Payment ID","Invoice","Currency", "Paid Amount","User Name",
                 "Reference", "Total Dollar", "Total Local"
            };

            worksheet.Row(lastRow).Height = 20;
            for (int col = 1; col <= headers.Length; col++)
            {
                var cell = worksheet.Cell(lastRow, col);
                worksheet.Column(col + 1).Width = 20;
                cell.Value = headers[col - 1];
                cell.Style.Font.SetFontName("Tahoma");
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontSize = 12;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.BlueBell;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.DarkSlateGray;
            }
            return lastRow;
        }

        private static int AddCashHeader(IXLWorksheet worksheet, int lastRow)
        {
            lastRow++;
            var headers = new string[]
            {
                "Opening Local", "Opening Dollar", "Received Local", "Received Dollar","Change Local", "Change Dollar", "Closing Local", "Closing Dollar"
            };

            worksheet.Row(lastRow).Height = 20;
            for (int col = 1; col <= headers.Length; col++)
            {
                var cell = worksheet.Cell(lastRow, col + 3);
                worksheet.Column(col + 1).Width = 20;
                cell.Value = headers[col - 1];
                cell.Style.Font.SetFontName("Tahoma");
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontSize = 12;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.BlueBell;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.Gray;
            }
            return lastRow;
        }


        private static int AddData(IXLWorksheet worksheet, int lastRow, PointOfSaleDetailModel detail)
        {
            lastRow++;
            var values = new object[]
            {
                detail.Client,
                detail.Date.ToString("yyyy-MM-dd HH:mm:ss") != null ? detail.Date.ToString("yyyy-MM-dd HH:mm:ss") : "",
                detail.PaymentTypeDescription,
                detail.SubPaymentDescription,
                detail.PaymentId?.ToString() ?? "N/A",
                detail.InvoiceIds,
                detail.CurrencyCode == "188" ? "COLONES" : "DOLARES",
                detail.PaidAmount,
                detail.UserName,
                detail.Reference,
                detail.TotalDoller,
                detail.TotalLocal
            };

            for (int col = 1; col <= values.Length; col++)
            {
                var cell = worksheet.Cell(lastRow, col);
                var value = values[col - 1];

                if (value == null)
                {
                    cell.Value = string.Empty;
                }
                else if (value is DateTime dateTime)
                {
                    cell.Value = dateTime;
                    cell.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
                }
                else if (value is double || value is int || value is decimal)
                {
                    cell.Value = Convert.ToDouble(value);

                    if (col == 8 || col == 11 || col == 12)
                    {
                        cell.Style.NumberFormat.Format = "#,##0.00";
                    }
                }
                else
                {
                    cell.Value = value.ToString();
                }

                cell.Style.Font.SetFontName("Tahoma");
                cell.Style.Font.FontSize = 10;
                cell.Style.Alignment.WrapText = true;
                cell.Style.Font.FontColor = XLColor.DarkSlateGray;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.DarkSlateGray;
            }

            return lastRow;
        }

        private static int AddPayTypeHeader(IXLWorksheet worksheet, int lastRow)
        {
            lastRow++;
            var headers = new string[]
            {
                "Payment Type", "Payment Method", "Colones", "Dollars"
            };

            worksheet.Row(lastRow).Height = 20;
            for (int col = 1; col <= headers.Length; col++)
            {
                var cell = worksheet.Cell(lastRow, col + 7);
                worksheet.Column(col + 1).Width = 20;
                cell.Value = headers[col - 1];
                cell.Style.Font.SetFontName("Tahoma");
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontSize = 12;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.BlueBell;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.Gray;
            }
            return lastRow;
        }


        private static int AddPayTypeData(IXLWorksheet worksheet, int lastRow, dynamic detail)
        {
            lastRow++;
            var values = new object[]
            {
                detail.PaymentTypeDescription, detail.SubPaymentDescription, detail.SumLocal, detail.SumDollars
            };

            for (int col = 1; col <= values.Length; col++)
            {
                var cell = worksheet.Cell(lastRow, col + 7);
                var value = values[col - 1];

                if (value == null)
                {
                    cell.Value = string.Empty;
                }
                else if (value is DateTime dateTime)
                {
                    cell.Value = dateTime;
                    cell.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
                }
                else if (value is double || value is int || value is decimal)
                {
                    cell.Value = Convert.ToDouble(value);

                    if (col >= 3)
                    {
                        cell.Style.NumberFormat.Format = "#,##0.00";
                    }
                }
                else
                {
                    cell.Value = value.ToString();
                }

                cell.Style.Font.SetFontName("Tahoma");
                cell.Style.Font.FontSize = 10;
                cell.Style.Font.FontColor = XLColor.DarkSlateGray;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.DarkSlateGray;
            }
            return lastRow;
        }

        private static int AddCashData(IXLWorksheet worksheet, int lastRow, dynamic detail)
        {
            lastRow++;
            var values = new object[]
            {
                detail.TotalLocalSum,detail.TotalDollerSum,
                detail.PaidLocal, detail.PaidDollar, detail.TotalChangeInLocal,
                detail.TotalChangeInDollar, detail.TotalLocalOnClosing, detail.TotalDollarsOnClosing
            };

            for (int col = 1; col <= values.Length; col++)
            {
                var cell = worksheet.Cell(lastRow, col + 3);
                var value = values[col - 1];

                if (value == null)
                {
                    cell.Value = string.Empty;
                }
                else if (value is DateTime dateTime)
                {
                    cell.Value = dateTime;
                    cell.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
                }
                else if (value is double || value is int || value is decimal)
                {
                    cell.Value = Convert.ToDouble(value);

                    if (col >= 1)
                    {
                        cell.Style.NumberFormat.Format = "#,##0.00";
                    }
                }
                else
                {
                    cell.Value = value.ToString();
                }

                cell.Style.Font.SetFontName("Tahoma");
                cell.Style.Font.FontSize = 10;
                cell.Style.Font.FontColor = XLColor.DarkSlateGray;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.DarkSlateGray;
            }
            return lastRow;
        }


        private void ReplacePlaceholder(IXLWorksheet worksheet, string placeholder, string replacement)
        {
            foreach (var cell in worksheet.CellsUsed())
            {
                if (cell.Value.ToString().Contains(placeholder))
                {
                    cell.Value = cell.Value.ToString().Replace(placeholder, replacement);
                }
            }
        }
    }

}
