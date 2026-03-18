namespace CourierAmex.Storage.Domain
{
    public class User : BaseEntity<Guid>
    {
        public required string Name { get; set; }
        public required string Lastname { get; set; }
        public string? Email { get; set; }
        public string? Mobile { get; set; }
        public string? Phone { get; set; }
        public string? Office { get; set; }
        public short CountryId { get; set; }
        public short StateId { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? Zip { get; set; }
        public byte Gender { get; set; }
        public int CompanyId { get; set; }
        public byte OperationType { get; set; }
        public byte SessionTimeout { get; set; }
        public bool ChangePassword { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public Guid ResetKey { get; set; }
        public DateTime? ResetKeyExpireDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public string? LastIPAddress { get; set; }
        public IEnumerable<Role>? Roles { get; set; }

        public required string Username { get; set; }
        public string? PasswordHash { get; set; }
    }
}
