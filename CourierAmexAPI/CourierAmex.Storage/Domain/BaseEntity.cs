using System.Text.Json.Serialization;

using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Domain
{
    public abstract class BaseEntity<T> : IBaseEntity
    {
        public required T Id { get; set; }

        object IBaseEntity.Id
        {
            get {
                if (Id == null) throw new ArgumentNullException();
                return Id;
            }
            set { }
        }

        [JsonIgnore]
        public BaseEntityStatus Status { get; set; }
        [JsonIgnore]
        public DateTime CreatedAt { get; set; }
        [JsonIgnore]
        public Guid CreatedBy { get; set; }
        [JsonIgnore]
        public DateTime ModifiedAt { get; set; }
        [JsonIgnore]
        public Guid ModifiedBy { get; set; }
        [JsonIgnore]
        public int TotalRows { get; set; }
    }
}
