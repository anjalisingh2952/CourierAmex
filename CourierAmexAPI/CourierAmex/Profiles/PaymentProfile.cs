using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Profiles
{
    public class PaymentProfile : AutoMapper.Profile
    {
        public PaymentProfile() {

            CreateMap<SignaturePackageResponse, SignaturePackageResponseModel>();
            CreateMap<PointOfSale, PointOfSaleModel>();
            CreateMap<SubPaymentType, SubPaymentTypeModel>();
            CreateMap<PayType, PayTypeModel>();
            CreateMap<PointOfSaleDailySummary, PointOfSaleDailySummaryModel>();
            CreateMap<PointOfSaleDetail, PointOfSaleDetailModel>();

        }
    }
}
