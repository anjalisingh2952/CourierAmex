using CourierAmex.Storage.Domain;
using CourierAmex.Models;


namespace CourierAmex.Profiles
{
    public class InventoryProfile : AutoMapper.Profile
    {
        public InventoryProfile()
        {

            CreateMap<StoreInventoryPackage, StoreInventoryPackageModel>()
                    .ForMember(dest => dest.StoreName, opt => opt.MapFrom(src => src.StoreName))
                    .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                    .ForMember(dest => dest.PackageNumber, opt => opt.MapFrom(src => src.PackageNumber))
                    .ForMember(dest => dest.CustomerAccount, opt => opt.MapFrom(src => src.CustomerAccount))
                    .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.CustomerName))
                    .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Date));



           CreateMap<StoreInventory, StoreInventoryReport>()
           .ForMember(dest => dest.Customer, opt => opt.MapFrom(src => src.Customer))
           .ForMember(dest => dest.Store, opt => opt.MapFrom(src => src.Store))
           .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
           .ForMember(dest => dest.Package, opt => opt.MapFrom(src => src.Package))
           .ForMember(dest => dest.PackageStatus, opt => opt.MapFrom(src => src.PackageStatus))
           .ForMember(dest => dest.Invoice, opt => opt.MapFrom(src => src.Invoice))
           .ForMember(dest => dest.InvoiceStatus, opt => opt.MapFrom(src => src.InvoiceStatus))
           .ForMember(dest => dest.PaymentType, opt => opt.MapFrom(src => src.PaymentType))
           .ForMember(dest => dest.Zone, opt => opt.MapFrom(src => src.Zone))
           .ForMember(dest => dest.Stop, opt => opt.MapFrom(src => src.Stop))
           .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate))
           .ForMember(dest => dest.Transport, opt => opt.MapFrom(src => src.Transport))
           .ForMember(dest => dest.TransportType, opt => opt.MapFrom(src => src.TransportType))
           .ForMember(dest => dest.DeliveryType, opt => opt.MapFrom(src => src.DeliveryType))
           .ForMember(dest => dest.Difference, opt => opt.MapFrom(src => src.Difference))
           .ForMember(dest => dest.Route, opt => opt.MapFrom(src => src.Route));


        }



    }
}
