namespace CoworkSpaceApi.DTOs
{
    public record UserResponse(
    Guid Id,
    string Name,
    string Email,
    string Phone,
    string Role,
    DateTime StartDate
);

    public record UpdateUserRequest(
        string Name,
        string Phone
    );

    public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);
}
