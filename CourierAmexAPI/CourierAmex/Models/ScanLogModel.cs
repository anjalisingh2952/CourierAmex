namespace CourierAmex.Models
{
    public class ScanLogModel 
    {
        public int Id { get; set; }
        public string User { get; set; }
        public string LogType { get; set; }
        public string ScanType { get; set; }
        public int PackageNumber { get; set; }
        public string PreviousManifest { get; set; }
        public string NewManifest { get; set; }
        public string PreviousBag { get; set; }
        public string NewBag { get; set; }
    }
}
