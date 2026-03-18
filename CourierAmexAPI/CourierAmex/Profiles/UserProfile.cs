using CourierAmex.Storage.Domain;
using CourierAmex.Models;
using CourierAmex.Web.Extensions;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Profiles
{
    public class UserProfile : AutoMapper.Profile
    {
        public UserProfile()
        {
            CreateMap<Role, RoleModel>()
                .ForMember(dst => dst.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<RoleModel, Role>()
                .ForMember(dst => dst.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)))
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<User, UserModel>()
                .ForMember(dst => dst.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status))
                .ForMember(dst => dst.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth.HasValue ? src.DateOfBirth.Value.ToUnixTime() : 0))
                .ForMember(dst => dst.LastLoginDate, opt => opt.MapFrom(src => src.LastLoginDate.HasValue ? src.LastLoginDate.Value.ToUnixTime() : 0));

            CreateMap<UserModel, User>()
                .ForMember(dst => dst.Id, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.Id) ? Guid.Empty : Guid.Parse(src.Id)))
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status))
                .ForMember(dst => dst.DateOfBirth, opt => opt.MapFrom(src => src.DateOfBirth.HasValue && src.DateOfBirth.Value > 0 ? src.DateOfBirth.Value.FromUnixTimeV2() : DateTime.MinValue));
        }
    }
}
