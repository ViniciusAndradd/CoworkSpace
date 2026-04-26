namespace CoworkSpaceApi.Models
{
    public class RoomAmenity
    {
        public Guid RoomId { get; set; }
        public Guid AmenityId { get; set; }

        public Room Room { get; set; } = null!;
        public Amenity Amenity { get; set; } = null!;
    }
}
