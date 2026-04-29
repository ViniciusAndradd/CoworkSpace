using CoworkSpaceApi.DTOs;
using CoworkSpaceApi.Models;
using CoworkSpaceApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CoworkSpaceApi.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController:ControllerBase
    {
        private readonly BookingService _bookingService;

        public BookingController(BookingService bookingService)
        {
            _bookingService = bookingService;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin() => User.IsInRole("admin");

        // Admin — todas as reservas
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAll() =>
            Ok(await _bookingService.GetAllAsync());

        // Usuário — suas reservas como inquilino
        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings() =>
            Ok(await _bookingService.GetByUserAsync(GetUserId()));

        // Anunciante — reservas das suas salas
        [HttpGet("my-rooms")]
        public async Task<IActionResult> GetMyRoomsBookings() =>
            Ok(await _bookingService.GetByRoomOwnerAsync(GetUserId()));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var booking = await _bookingService.GetByIdAsync(id);
            return booking is null ? NotFound() : Ok(booking);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateBookingRequest request)
        {
            var (booking, error) = await _bookingService.CreateAsync(GetUserId(), request);
            if (error is not null) return BadRequest(new { message = error });
            return CreatedAtAction(nameof(GetById), new { id = booking!.Id }, booking);
        }

        // Dono da sala ou admin podem alterar status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, UpdateBookingStatusRequest request)
        {
            var (booking, error) = await _bookingService.UpdateStatusAsync(id, GetUserId(), IsAdmin(), request.Status);
            if (error == "Reserva não encontrada.") return NotFound();
            if (error is not null) return Forbid();
            return Ok(booking);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _bookingService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
