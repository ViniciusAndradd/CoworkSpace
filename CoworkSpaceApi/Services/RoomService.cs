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
            room.OwnerId,
            room.Owner.Name,
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
                .Include(r => r.Owner)
                .Include(r => r.Images)
                .Include(r => r.RoomAmenities)
                    .ThenInclude(ra => ra.Amenity);

        public async Task<List<RoomResponse>> GetAllAsync() =>
            await QueryWithIncludes().Select(r => ToResponse(r)).ToListAsync();

        public async Task<List<RoomResponse>> GetByOwnerAsync(Guid ownerId) =>
            await QueryWithIncludes()
                .Where(r => r.OwnerId == ownerId)
                .Select(r => ToResponse(r))
                .ToListAsync();

        public async Task<RoomResponse?> GetByIdAsync(Guid id)
        {
            var room = await QueryWithIncludes().FirstOrDefaultAsync(r => r.Id == id);
            return room is null ? null : ToResponse(room);
        }

        public async Task<RoomResponse> CreateAsync(Guid ownerId, CreateRoomRequest request)
        {
            var room = new Room
            {
                Id = Guid.NewGuid(),
                OwnerId = ownerId,
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

        public async Task<(RoomResponse? room, string? error)> UpdateAsync(Guid id, Guid requesterId, bool isAdmin, UpdateRoomRequest request)
        {
            var room = await QueryWithIncludes().FirstOrDefaultAsync(r => r.Id == id);
            if (room is null) return (null, "Sala não encontrada.");
            if (!isAdmin && room.OwnerId != requesterId) return (null, "Sem permissão para editar esta sala.");

            room.Name = request.Name;
            room.Type = request.Type;
            room.Location = request.Location;
            room.Description = request.Description;
            room.Capacity = request.Capacity;
            room.PricePerDay = request.PricePerDay;
            room.Available = request.Available;

            room.RoomAmenities.Clear();
            foreach (var amenityId in request.AmenityIds)
                room.RoomAmenities.Add(new RoomAmenity { RoomId = room.Id, AmenityId = amenityId });

            await _context.SaveChangesAsync();
            return (ToResponse(await QueryWithIncludes().FirstAsync(r => r.Id == room.Id)), null);
        }

        public async Task<(bool success, string? error)> DeleteAsync(Guid id, Guid requesterId, bool isAdmin)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room is null) return (false, "Sala não encontrada.");
            if (!isAdmin && room.OwnerId != requesterId) return (false, "Sem permissão para excluir esta sala.");

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
            return (true, null);
        }

        public async Task<(string? url, string? error)> AddImageAsync(Guid roomId, Guid requesterId, bool isAdmin, IFormFile file, int order, IWebHostEnvironment env)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room is null) return (null, "Sala não encontrada.");
            if (!isAdmin && room.OwnerId != requesterId) return (null, "Sem permissão para adicionar imagem.");

            var uploadsFolder = Path.Combine(env.WebRootPath ?? "wwwroot", "uploads", "rooms", roomId.ToString());
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var url = $"/uploads/rooms/{roomId}/{fileName}";
            var image = new RoomImage { Id = Guid.NewGuid(), RoomId = roomId, Url = url, Order = order };
            _context.RoomImages.Add(image);
            await _context.SaveChangesAsync();

            return (url, null);
        }

        public async Task<(bool success, string? error)> DeleteImageAsync(Guid imageId, Guid requesterId, bool isAdmin)
        {
            var image = await _context.RoomImages.Include(i => i.Room).FirstOrDefaultAsync(i => i.Id == imageId);
            if (image is null) return (false, "Imagem não encontrada.");
            if (!isAdmin && image.Room.OwnerId != requesterId) return (false, "Sem permissão para remover esta imagem.");

            if (File.Exists(image.Url)) File.Delete(image.Url);
            _context.RoomImages.Remove(image);
            await _context.SaveChangesAsync();
            return (true, null);
        }
    }
}
