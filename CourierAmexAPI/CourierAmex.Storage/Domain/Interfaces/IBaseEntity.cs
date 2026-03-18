using System.Text.Json.Serialization;

using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Domain
{
    public interface IBaseEntity
    {
        public object Id { get; set; }
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
