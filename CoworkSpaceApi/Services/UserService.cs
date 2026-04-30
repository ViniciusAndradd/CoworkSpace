using Microsoft.EntityFrameworkCore;
using CoworkSpaceApi.Data;
using CoworkSpaceApi.DTOs;

namespace CoworkSpaceApi.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserResponse>> GetAllAsync()
        {
            return await _context.Users
                .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Phone, u.Role, u.StartDate))
                .ToListAsync();
        }

        public async Task<UserResponse?> GetByIdAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return null;
            return new UserResponse(user.Id, user.Name, user.Email, user.Phone, user.Role, user.StartDate);
        }

        public async Task<UserResponse?> UpdateAsync(Guid id, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return null;

            user.Name = request.Name;
            user.Phone = request.Phone;
            await _context.SaveChangesAsync();

            return new UserResponse(user.Id, user.Name, user.Email, user.Phone, user.Role, user.StartDate);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(bool success, string? error)> ChangePasswordAsync(Guid id, ChangePasswordRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return (false, "Usuário não encontrado.");

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return (false, "Senha atual incorreta.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            return (true, null);
        }
    }
}
