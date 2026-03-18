using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Profiles
{
    public class InvoiceProfile : AutoMapper.Profile
    {
        public InvoiceProfile() {

            CreateMap<InvoiceDetails, InvoiceDetailsModel>()
               .ForMember(dst => dst.Status, opt => opt.Ignore());
            CreateMap<PaymentInfo, PaymentInfoModel>();
            CreateMap<CreditNoteInsertRequest, CreditNoteInsertRequestModel>();
            CreateMap<PendingInvoiceReport, PendingInvoiceReportModel>();
            CreateMap<TemplateAccount, TemplateAccountModel>();

            CreateMap<SalesReport, SalesReportModel>()
            .ForMember(dest => dest.InvoiceNumber, opt => opt.MapFrom(src => src.InvoiceNumber))
            .ForMember(dest => dest.IssueDate, opt => opt.MapFrom(src => src.IssueDate))
            .ForMember(dest => dest.InvoiceType, opt => opt.MapFrom(src => src.InvoiceType))
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.CustomerName))
            .ForMember(dest => dest.DetailLineDescription, opt => opt.MapFrom(src => src.DetailLineDescription))
            .ForMember(dest => dest.DetailLineQuantity, opt => opt.MapFrom(src => src.DetailLineQuantity))
            .ForMember(dest => dest.CurrencyCode, opt => opt.MapFrom(src => src.CurrencyCode))
            .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice))
            .ForMember(dest => dest.DiscountAmount, opt => opt.MapFrom(src => src.DiscountAmount))
            .ForMember(dest => dest.TaxRate, opt => opt.MapFrom(src => src.TaxRate))
            .ForMember(dest => dest.TaxAmount, opt => opt.MapFrom(src => src.TaxAmount))
            .ForMember(dest => dest.TotalLineAmount, opt => opt.MapFrom(src => src.TotalLineAmount))
            .ForMember(dest => dest.CurrencyExchangeRate, opt => opt.MapFrom(src => src.CurrencyExchangeRate))
            .ForMember(dest => dest.Response, opt => opt.MapFrom(src => src.Response))
            .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.PaymentMethod))
            .ForMember(dest => dest.SaleCondition, opt => opt.MapFrom(src => src.SaleCondition))
            .ForMember(dest => dest.OtherChargesDescription, opt => opt.MapFrom(src => src.OtherChargesDescription))
            .ForMember(dest => dest.OtherChargesAmount, opt => opt.MapFrom(src => src.OtherChargesAmount));
          
        }

    }
    
}
