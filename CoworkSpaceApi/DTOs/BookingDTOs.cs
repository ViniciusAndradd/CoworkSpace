namespace CoworkSpaceApi.DTOs
{
    public record CreateBookingRequest(
    Guid RoomId,
    DateTime StartDate,
    DateTime EndDate,
    int NumberOfPeople,
    string? Observation
);

    public record UpdateBookingStatusRequest(
        string Status
    );

    public record BookingResponse(
        Guid Id,
        Guid UserId,
        string UserName,
        Guid RoomId,
        string RoomName,
        DateTime StartDate,
        DateTime EndDate,
        int NumberOfPeople,
        string? Observation,
        string Status,
        decimal TotalPrice
    );
}
