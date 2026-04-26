namespace CoworkSpaceApi.Models
{
    public class RoomImage
    {
        public Guid Id { get; set; }
        public Guid RoomId { get; set; }
        public string Url { get; set; } = string.Empty;
        public int Order { get; set; }

        public Room Room { get; set; } = null!;
    }
}
