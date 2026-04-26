using Microsoft.EntityFrameworkCore;
using CoworkSpaceApi.Data;
using CoworkSpaceApi.DTOs;
using CoworkSpaceApi.Models;

namespace CoworkSpaceApi.Services
{
    public class RoomService
    {
        private readonly AppDbContext _context;

        public RoomService(AppDbContext context)
        {
            _context = context;
        }

        private static RoomResponse ToResponse(Room room) => new(
            room.Id,
            room.Name,
            room.Type,
            room.Location,
            room.Description,
            room.Capacity,
            room.PricePerDay,
            room.Available,
            room.Images.OrderBy(i => i.Order).Select(i => i.Url).ToList(),
            room.RoomAmenities.Select(ra => new AmenityResponse(ra.Amenity.Id, ra.Amenity.Name, ra.Amenity.Icon)).ToList()
        );

        private IQueryable<Room> QueryWithIncludes() =>
            _context.Rooms
                .Include(r => r.Images)
                .Include(r => r.RoomAmenities)
                    .ThenInclude(ra => ra.Amenity);

        public async Task<List<RoomResponse>> GetAllAsync() =>
            await QueryWithIncludes().Select(r => ToResponse(r)).ToListAsync();

        public async Task<RoomResponse?> GetByIdAsync(Guid id)
        {
            var room = await QueryWithIncludes().FirstOrDefaultAsync(r => r.Id == id);
            return room is null ? null : ToResponse(room);
        }

        public async Task<RoomResponse> CreateAsync(CreateRoomRequest request)
        {
            var room = new Room
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Type = request.Type,
                Location = request.Location,
                Description = request.Description,
                Capacity = request.Capacity,
                PricePerDay = request.PricePerDay
            };

            foreach (var amenityId in request.AmenityIds)
                room.RoomAmenities.Add(new RoomAmenity { RoomId = room.Id, AmenityId = amenityId });

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return ToResponse(await QueryWithIncludes().FirstAsync(r => r.Id == room.Id));
        }

        public async Task<RoomResponse?> UpdateAsync(Guid id, UpdateRoomRequest request)
        {
            var room = await QueryWithIncludes().FirstOrDefaultAsync(r => r.Id == id);
            if (room is null) return null;

            room.Name = request.Name;
            room.Type = request.Type;
            room.Location = request.Location;
            room.Description = request.Description;
            room.Capacity = request.Capacity;
            room.PricePerDay = request.PricePerDay;
            room.Available = request.Available;

            // Atualiza comodidades
            room.RoomAmenities.Clear();
            foreach (var amenityId in request.AmenityIds)
                room.RoomAmenities.Add(new RoomAmenity { RoomId = room.Id, AmenityId = amenityId });

            await _context.SaveChangesAsync();
            return ToResponse(await QueryWithIncludes().FirstAsync(r => r.Id == room.Id));
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room is null) return false;

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task AddImageAsync(Guid roomId, string url, int order)
        {
            var image = new RoomImage { Id = Guid.NewGuid(), RoomId = roomId, Url = url, Order = order };
            _context.RoomImages.Add(image);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteImageAsync(Guid imageId)
        {
            var image = await _context.RoomImages.FindAsync(imageId);
            if (image is null) return false;

            // Deleta o arquivo físico
            if (File.Exists(image.Url))
                File.Delete(image.Url);

            _context.RoomImages.Remove(image);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
