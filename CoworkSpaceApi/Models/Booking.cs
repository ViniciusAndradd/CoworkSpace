namespace CoworkSpaceApi.Models
{
    public class Booking
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid RoomId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int NumberOfPeople { get; set; }
        public string? Observation { get; set; }
        public string Status { get; set; } = "pending";
        public decimal TotalPrice { get; set; }

        public User User { get; set; } = null!;
        public Room Room { get; set; } = null!;
    }
}
