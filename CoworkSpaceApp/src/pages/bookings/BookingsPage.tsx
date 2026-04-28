import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip,
  CircularProgress, Alert, Grid
} from '@mui/material';
import { CalendarMonth, People, AttachMoney } from '@mui/icons-material';
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get<Booking[]>('/booking/my');
        setBookings(response.data);
      } catch {
        setError('Erro ao carregar reservas.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          Minhas Reservas
        </Typography>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && bookings.length === 0 && (
          <Alert severity="info">Você ainda não possui reservas.</Alert>
        )}

        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={booking.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{booking.roomName}</Typography>
                    <Chip label={statusLabel[booking.status]} color={statusColor[booking.status]} size="small" />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(booking.startDate).format('DD/MM/YYYY')} → {dayjs(booking.endDate).format('DD/MM/YYYY')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">{booking.numberOfPeople} pessoa(s)</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <AttachMoney fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>R$ {booking.totalPrice.toFixed(2)}</Typography>
                  </Box>

                  {booking.observation && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      "{booking.observation}"
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}