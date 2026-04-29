using CoworkSpaceApi.DTOs;
using CoworkSpaceApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CoworkSpaceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomController:ControllerBase
    {
        private readonly RoomService _roomService;
        private readonly IWebHostEnvironment _env;

        public RoomController(RoomService roomService, IWebHostEnvironment env)
        {
            _roomService = roomService;
            _env = env;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin() => User.IsInRole("admin");

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _roomService.GetAllAsync());

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyRooms() =>
            Ok(await _roomService.GetByOwnerAsync(GetUserId()));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var room = await _roomService.GetByIdAsync(id);
            return room is null ? NotFound() : Ok(room);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(CreateRoomRequest request)
        {
            var room = await _roomService.CreateAsync(GetUserId(), request);
            return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, UpdateRoomRequest request)
        {
            var (room, error) = await _roomService.UpdateAsync(id, GetUserId(), IsAdmin(), request);
            if (error is not null) return error == "Sala não encontrada." ? NotFound() : Forbid();
            return Ok(room);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var (success, error) = await _roomService.DeleteAsync(id, GetUserId(), IsAdmin());
            if (error is not null) return error == "Sala não encontrada." ? NotFound() : Forbid();
            return NoContent();
        }

        [HttpPost("{id}/images")]
        [Authorize]
        public async Task<IActionResult> UploadImage(Guid id, IFormFile file, [FromQuery] int order = 0)
        {
            if (file.Length == 0) return BadRequest(new { message = "Arquivo inválido." });
            var (url, error) = await _roomService.AddImageAsync(id, GetUserId(), IsAdmin(), file, order, _env);
            if (error is not null) return error == "Sala não encontrada." ? NotFound() : Forbid();
            return Ok(new { url });
        }

        [HttpDelete("images/{imageId}")]
        [Authorize]
        public async Task<IActionResult> DeleteImage(Guid imageId)
        {
            var (success, error) = await _roomService.DeleteImageAsync(imageId, GetUserId(), IsAdmin());
            if (error is not null) return error == "Imagem não encontrada." ? NotFound() : Forbid();
            return NoContent();
        }
    }
}
