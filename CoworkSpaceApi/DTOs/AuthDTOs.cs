namespace CoworkSpaceApi.DTOs
{
    public record RegisterRequest(
    string Name,
    string Email,
    string Phone,
    string Password
);

    public record LoginRequest(
        string Email,
        string Password
    );

    public record AuthResponse(
        string Token,
        string Name,
        string Email,
        string Role
    );
}
