using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Profiles
{
    public class CompanyProfile : AutoMapper.Profile
    {
        public CompanyProfile()
        {
            CreateMap<Product, ProductModel>()
                .ForMember(dst => dst.Status, opt => opt.Ignore());

            CreateMap<ProductModel, Product>()
                .ForMember(dst => dst.Status, opt => opt.Ignore());

            CreateMap<ClientCategory, ClientCategoryModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<ClientCategoryModel, ClientCategory>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<Company, CompanyModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<CompanyModel, Company>()
               .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<PackageStatus, PackageStatusModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<PackageStatusModel, PackageStatus>()
               .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<Commodity, CommodityModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<CommodityModel, Commodity>()
               .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<PaymentTypeModel, PaymentType>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<PaymentType, PaymentTypeModel> ()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));


            //        CreateMap<Cashier, CashierModel>()
            //.ForMember(dst => dst.CreatedAt, opt => opt.MapFrom(src => new DateTimeOffset(src.CreatedAt.ToUniversalTime()).ToUnixTimeMilliseconds()));

            CreateMap<Cashier, CashierModel>()
                .ReverseMap();

            CreateMap<Currency, CurrencyModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<CurrencyModel, Currency>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<Bank, BankModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<BankModel, Bank>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<Brand, BrandModel>()
                .ReverseMap();

            CreateMap<DocumentPayType, DocumentPayTypeModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<DocumentPayTypeModel, DocumentPayType>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));


        }
    }
}
