using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace CourierAmex.Models
{
    public class FilterByRequest
    {
        [FromQuery(Name = "ps")]
        [JsonPropertyName("ps")]
        public required int PageSize { get; set; } // PageSize
        [FromQuery(Name = "pi")]
        [JsonPropertyName("pi")]
        public required short PageIndex { get; set; } // PageIndex
        [FromQuery(Name = "s")]
        [JsonPropertyName("s")]
        public string? SortBy { get; set; } // SortBy
        [FromQuery(Name = "c")]
        [JsonPropertyName("c")]
        public string? Criteria { get; set; } // Criteria
        [FromQuery(Name = "f")]
        [JsonPropertyName("f")]
        public string? FilterBy { get; set; } // FilterBy
        [FromQuery(Name = "st")]
        [JsonPropertyName("st")]
        public short? Status { get; set; } // Filter By Status
        [JsonPropertyName("cid")]
        [FromQuery(Name = "cid")]
        public int? CompanyId { get; set; } // Filter By Company Id
        [JsonPropertyName("sti")]
        [FromQuery(Name = "sti")]
        public short? ShipTypeId { get; set; } // Filter By Ship Type Id
    }

    public class FilterByRequestWithoutPagination
    {
        [FromQuery(Name = "s")]
        [JsonPropertyName("s")]
        public string? SortBy { get; set; } // SortBy
        [FromQuery(Name = "c")]
        [JsonPropertyName("c")]
        public string? Criteria { get; set; } // Criteria
        [JsonPropertyName("cid")]
        [FromQuery(Name = "cid")]
        public int? CompanyId { get; set; } // Filter By Company Id
    }

    public class FilterByDateRange
    {
        [JsonPropertyName("sd")]
        public long? StartDate { get; set; } // Start Date
        [JsonPropertyName("ed")]
        public long? EndDate { get; set; } // End Date
    }
}
