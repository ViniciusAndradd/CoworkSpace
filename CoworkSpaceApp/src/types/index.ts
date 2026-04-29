export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  startDate: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Room {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  type: string;
  location: string;
  description: string;
  capacity: number;
  pricePerDay: number;
  available: boolean;
  images: string[];
  amenities: Amenity[];
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  roomId: string;
  roomName: string;
  startDate: string;
  endDate: string;
  numberOfPeople: number;
  observation?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}