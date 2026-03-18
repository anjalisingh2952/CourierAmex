using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using CourierAmex.Web.Extensions;

namespace CourierAmex.Profiles
{
    public class ManifestProfile : AutoMapper.Profile
    {
        public ManifestProfile()
        {
            CreateMap<Manifest, ManifestModel>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (byte)src.Status))
                .ForMember(dst => dst.ManifestDate, opt => opt.MapFrom(src => src.ManifestDate.ToUnixTime()));

            CreateMap<ManifestModel, Manifest>()
                .ForMember(dst => dst.Status, opt => opt.MapFrom(src => (BaseEntityStatus)src.Status))
                .ForMember(dst => dst.ManifestDate, opt => opt.MapFrom(src => src.ManifestDate.FromUnixTimeV2()));

            CreateMap<AirGuide, AirGuideModel>()
                .ReverseMap();

            CreateMap<ScanLogModel, ScanLog>()
            .ForMember(dest => dest.Id, opt => opt.Ignore()); // Ignore Id if needed

            CreateMap<ScanLog, ScanLogModel>();

            CreateMap<PackageManifestInfo, PackageManifestInfoModel>();
            CreateMap<RouteSheet, RouteSheetModel>();

            CreateMap<RouteInsert, RouteInsertModel>();
            CreateMap<RouteSheetDetail, RouteSheetDetailModel>();
            CreateMap<RoutePackageReport, RoutePackageReportModel>();
            CreateMap<DeliveryTypes, DeliveryTypesModel>();
            CreateMap<RoadMapstReport, RoadMapstReportModel>();
            CreateMap<ParcelDeliveryReport, ParcelDeliveryReportModel>();

        }
    }
}
