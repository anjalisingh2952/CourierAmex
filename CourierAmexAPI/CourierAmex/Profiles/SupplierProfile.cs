using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Profiles
{
    public class SupplierProfile : AutoMapper.Profile
    {
        public SupplierProfile()
        {
            CreateMap<Location, LocationModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<LocationModel, Location>()
               .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<Supplier, SupplierModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<SupplierModel, Supplier>()
               .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

        }
    }
}
