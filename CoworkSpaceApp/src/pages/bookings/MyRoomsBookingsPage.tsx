import { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Select,
  MenuItem, FormControl
} from '@mui/material';
import dayjs from 'dayjs';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { type Booking } from '../../types';

const statusColor: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
};

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

export default function MyRoomsBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get<Booking[]>('/booking/my-rooms');
        setBookings(response.data);
      } catch {
        setError('Erro ao carregar reservas.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/booking/${id}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: status as Booking['status'] } : b))
      );
    } catch {
      alert('Erro ao atualizar status.');
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          Reservas das minhas salas
        </Typography>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && bookings.length === 0 && (
          <Alert severity="info">Nenhuma reserva encontrada para suas salas.</Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Sala</strong></TableCell>
                <TableCell><strong>Inquilino</strong></TableCell>
                <TableCell><strong>Período</strong></TableCell>
                <TableCell><strong>Pessoas</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Observação</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.roomName}</TableCell>
                  <TableCell>{booking.userName}</TableCell>
                  <TableCell>
                    {dayjs(booking.startDate).format('DD/MM/YYYY')} →{' '}
                    {dayjs(booking.endDate).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell>{booking.numberOfPeople}</TableCell>
                  <TableCell>R$ {booking.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>{booking.observation || '—'}</TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        renderValue={(val) => (
                          <Chip label={statusLabel[val]} color={statusColor[val]} size="small" />
                        )}
                      >
                        <MenuItem value="pending">Pendente</MenuItem>
                        <MenuItem value="confirmed">Confirmada</MenuItem>
                        <MenuItem value="cancelled">Cancelada</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}