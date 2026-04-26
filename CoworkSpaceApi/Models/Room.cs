namespace CoworkSpaceApi.Models
{
    public class Room
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal PricePerDay { get; set; }
        public bool Available { get; set; } = true;

        public ICollection<RoomImage> Images { get; set; } = new List<RoomImage>();
        public ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
