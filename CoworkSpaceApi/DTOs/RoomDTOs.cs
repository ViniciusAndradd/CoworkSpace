namespace CoworkSpaceApi.DTOs;

public record CreateRoomRequest(
    string Name,
    string Type,
    string Location,
    string Description,
    int Capacity,
    decimal PricePerDay,
    List<Guid> AmenityIds
);

public record UpdateRoomRequest(
    string Name,
    string Type,
    string Location,
    string Description,
    int Capacity,
    decimal PricePerDay,
    bool Available,
    List<Guid> AmenityIds
);

public record RoomResponse(
    Guid Id,
    Guid OwnerId,
    string OwnerName,
    string Name,
    string Type,
    string Location,
    string Description,
    int Capacity,
    decimal PricePerDay,
    bool Available,
    List<string> Images,
    List<AmenityResponse> Amenities
);

public record AmenityResponse(
    Guid Id,
    string Name,
    string Icon
);