using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Profiles
{
    public class PackageProfile : AutoMapper.Profile
    {
        public PackageProfile()
        {
            CreateMap<Package, PackageModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<PackageModel, Package>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<PackageEvent, PackageEventModel>()
                .ForMember(dst => dst.CreatedAt, opt => opt.MapFrom(src => new DateTimeOffset(src.CreatedAt.ToUniversalTime()).ToUnixTimeMilliseconds()));

            CreateMap<Package, PackageCategoryModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<PackageCategoryModel, PackageCategory>();

            CreateMap<PackageCategory, PackageCategoryModel>();

            CreateMap<PackageLogNotesModel, PackageLogNotes>()
               .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<PackageLogNotes, PackageLogNotesModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<PackageNotesModel, PackageNotes>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status));

            CreateMap<PackageNotes, PackageNotesModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status));

            CreateMap<PackageItem, PackageItemModel>().ReverseMap();
        }
    }
}
