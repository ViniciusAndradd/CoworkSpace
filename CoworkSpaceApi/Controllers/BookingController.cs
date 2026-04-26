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

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAll() =>
            Ok(await _bookingService.GetAllAsync());

        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Ok(await _bookingService.GetByUserAsync(userId));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var booking = await _bookingService.GetByIdAsync(id);
            return booking is null ? NotFound() : Ok(booking);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateBookingRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var (booking, error) = await _bookingService.CreateAsync(userId, request);

            if (error is not null) return BadRequest(new { message = error });
            return CreatedAtAction(nameof(GetById), new { id = booking!.Id }, booking);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateStatus(Guid id, UpdateBookingStatusRequest request)
        {
            var booking = await _bookingService.UpdateStatusAsync(id, request.Status);
            return booking is null ? NotFound() : Ok(booking);
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
