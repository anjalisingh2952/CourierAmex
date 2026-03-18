using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Profiles
{
    public class CommonProfile : AutoMapper.Profile
    {
        public CommonProfile()
        {
            CreateMap<Country, CountryModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<CountryModel, Country>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<State, StateModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<StateModel, State>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<Zone, ZoneModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<ZoneModel, Zone>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<Area, AreaModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<AreaModel, Area>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<CustomerPayType, CustomerPayTypeModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<CustomerPayTypeModel, CustomerPayType>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<DocumentType, DocumentTypeModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<DocumentTypeModel, DocumentType>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<ShippingWayType, ShippingWayTypeModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<ShippingWayTypeModel, ShippingWayType>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<Permission, PermissionModel>().ReverseMap();

            CreateMap<Entities.SystemSetting, SystemSettingModel>().ReverseMap();

            CreateMap<Invoice, InvoiceModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<PaymentInfo, PaymentInfoModel>().ReverseMap();

            CreateMap<MasterGuideModel, MasterGuide>().ReverseMap();
            CreateMap<ChildGuideModel, ChildGuide>().ReverseMap();
            CreateMap<GuideDetailModel, GuideDetail>().ReverseMap();
        }

    }
}
