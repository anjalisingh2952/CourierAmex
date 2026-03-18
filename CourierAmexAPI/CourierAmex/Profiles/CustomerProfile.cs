using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using CourierAmex.Web.Extensions;

namespace CourierAmex.Profiles
{
    public class CustomerProfile : AutoMapper.Profile
    {
        public CustomerProfile()
        {
            CreateMap<Customer, CustomerModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status))
                .ForMember(dst => dst.LastLoginDate, opt => opt.MapFrom(src => src.LastLoginDate.HasValue ? src.LastLoginDate.Value.ToUnixTime() : 0));

            CreateMap<CustomerModel, Customer>()
               .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status))
               .ForMember(dst => dst.LastLoginDate, opt => opt.Ignore());
        }
    }
}
