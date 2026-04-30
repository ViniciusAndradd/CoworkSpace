using Microsoft.EntityFrameworkCore;
using CoworkSpaceApi.Data;
using CoworkSpaceApi.DTOs;
using CoworkSpaceApi.Models;

namespace CoworkSpaceApi.Services;

public class BookingService
{
    private readonly AppDbContext _context;

    public BookingService(AppDbContext context)
    {
        _context = context;
    }

    private static BookingResponse ToResponse(Booking b) => new(
        b.Id, b.UserId, b.User.Name, b.RoomId, b.Room.Name,
        b.StartDate, b.EndDate, b.NumberOfPeople,
        b.Observation, b.Status, b.TotalPrice
    );

    private IQueryable<Booking> QueryWithIncludes() =>
        _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room);

    // Admin — todas as reservas
    public async Task<List<BookingResponse>> GetAllAsync() =>
        await QueryWithIncludes().Select(b => ToResponse(b)).ToListAsync();

    // Usuário — suas próprias reservas
    public async Task<List<BookingResponse>> GetByUserAsync(Guid userId) =>
        await QueryWithIncludes()
            .Where(b => b.UserId == userId)
            .Select(b => ToResponse(b))
            .ToListAsync();

    // Anunciante — reservas das salas que ele anunciou
    public async Task<List<BookingResponse>> GetByRoomOwnerAsync(Guid ownerId) =>
        await QueryWithIncludes()
            .Where(b => b.Room.OwnerId == ownerId)
            .Select(b => ToResponse(b))
            .ToListAsync();

    public async Task<BookingResponse?> GetByIdAsync(Guid id)
    {
        var booking = await QueryWithIncludes().FirstOrDefaultAsync(b => b.Id == id);
        return booking is null ? null : ToResponse(booking);
    }

    public async Task<(BookingResponse? booking, string? error)> CreateAsync(Guid userId, CreateBookingRequest request)
    {
        var room = await _context.Rooms.FindAsync(request.RoomId);
        if (room is null) return (null, "Sala não encontrada.");
        if (!room.Available) return (null, "Sala não está disponível.");

        var startDate = DateTime.SpecifyKind(request.StartDate.Date, DateTimeKind.Utc);
        var endDate = DateTime.SpecifyKind(request.EndDate.Date, DateTimeKind.Utc);

        var days = (endDate - startDate).Days;
        if (days <= 0) return (null, "Data de término deve ser maior que a de início.");

        var conflict = await _context.Bookings.AnyAsync(b =>
            b.RoomId == request.RoomId &&
            b.Status != "cancelled" &&
            b.StartDate < endDate &&
            b.EndDate > startDate);

        if (conflict) return (null, "Sala já reservada neste período.");

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            RoomId = request.RoomId,
            StartDate = startDate,
            EndDate = endDate,
            NumberOfPeople = request.NumberOfPeople,
            Observation = string.IsNullOrWhiteSpace(request.Observation) ? null : request.Observation,
            TotalPrice = days * room.PricePerDay
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return (ToResponse(await QueryWithIncludes().FirstAsync(b => b.Id == booking.Id)), null);
    }

    // Atualizar status — permitido ao dono da sala ou admin
    public async Task<(BookingResponse? booking, string? error)> UpdateStatusAsync(Guid bookingId, Guid requesterId, bool isAdmin, string status)
    {
        var booking = await QueryWithIncludes().FirstOrDefaultAsync(b => b.Id == bookingId);
        if (booking is null) return (null, "Reserva não encontrada.");
        if (!isAdmin && booking.Room.OwnerId != requesterId)
            return (null, "Sem permissão para alterar esta reserva.");

        booking.Status = status;
        await _context.SaveChangesAsync();
        return (ToResponse(booking), null);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking is null) return false;

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();
        return true;
    }
}