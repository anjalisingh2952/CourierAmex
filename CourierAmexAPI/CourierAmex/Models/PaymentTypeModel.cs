using CourierAmex.Storage.Domain;

namespace CourierAmex.Models
{
    public class PaymentTypeModel : BaseEntityModel<int>
    {
        public int? CompanyId { get; set; }
        public required string Name { get; set; }

    }
}
