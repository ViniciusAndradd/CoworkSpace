using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CoworkSpaceApi.DTOs;
using CoworkSpaceApi.Services;

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

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _roomService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var room = await _roomService.GetByIdAsync(id);
            return room is null ? NotFound() : Ok(room);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create(CreateRoomRequest request)
        {
            var room = await _roomService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(Guid id, UpdateRoomRequest request)
        {
            var room = await _roomService.UpdateAsync(id, request);
            return room is null ? NotFound() : Ok(room);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _roomService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }

        [HttpPost("{id}/images")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UploadImage(Guid id, IFormFile file, [FromQuery] int order = 0)
        {
            if (file.Length == 0)
                return BadRequest(new { message = "Arquivo inválido." });

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "rooms", id.ToString());
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var url = $"/uploads/rooms/{id}/{fileName}";
            await _roomService.AddImageAsync(id, url, order);

            return Ok(new { url });
        }

        [HttpDelete("images/{imageId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteImage(Guid imageId)
        {
            var deleted = await _roomService.DeleteImageAsync(imageId);
            return deleted ? NoContent() : NotFound();
        }
    }
}
