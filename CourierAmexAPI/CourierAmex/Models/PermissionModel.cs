namespace CourierAmex.Models
{
  public class PermissionModel
  {
    public required string Id { get; set; }
    public required string Parent { get; set; }
    public required string Name { get; set; }
    public bool View { get; set; }
    public bool Add { get; set; }
    public bool Update { get; set; }
    public bool Delete { get; set; }
  }
}
