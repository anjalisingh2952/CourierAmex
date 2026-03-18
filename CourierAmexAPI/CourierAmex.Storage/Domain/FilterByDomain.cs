namespace CourierAmex.Storage.Domain
{
    public class FilterByDomain
    {
        public int PageSize { get; set; } // PageSize
        public short PageIndex { get; set; } // PageIndex
        public string? SortBy { get; set; } // SortBy
        public string? Criteria { get; set; } // Criteria
        public string? FilterBy { get; set; } // FilterBy
        public short Status { get; set; } // Filter By Status
        public int CompanyId { get; set; } // Filter By Company Id
        public short ShipTypeId { get; set; } // Filter By Ship Type Id
    }
}
