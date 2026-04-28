import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Button, CircularProgress,
  Alert, Grid, Divider, TextField
} from '@mui/material';
import { People, LocationOn, AttachMoney, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { type Room } from '../../types';

const schema = z.object({
  startDate: z.string().min(1, 'Obrigatório'),
  endDate: z.string().min(1, 'Obrigatório'),
  numberOfPeople: z.string().min(1, 'Obrigatório'),
  observation: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const days = startDate && endDate ? Math.max(0, dayjs(endDate).diff(dayjs(startDate), 'day')) : 0;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get<Room>(`/room/${id}`);
        setRoom(response.data);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setBookingError('');
      await api.post('/booking', {
        ...data,
        roomId: id,
        numberOfPeople: Number(data.numberOfPeople),
      });
      setBookingSuccess('Reserva realizada com sucesso!');
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Erro ao realizar reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (!room) return <Alert severity="error" sx={{ m: 4 }}>Sala não encontrada.</Alert>;

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/rooms')} sx={{ mb: 2 }}>
          Voltar
        </Button>

        {room.images?.length > 0 && (
          <Box
            component="img"
            src={`http://localhost:5000${room.images[0]}`}
            alt={room.name}
            sx={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 2, mb: 3 }}
          />
        )}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{room.name}</Typography>
              <Chip label={room.available ? 'Disponível' : 'Indisponível'} color={room.available ? 'success' : 'error'} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <LocationOn color="action" />
              <Typography color="text.secondary">{room.location}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
              <People color="action" />
              <Typography color="text.secondary">Capacidade: {room.capacity} pessoas</Typography>
            </Box>

            <Typography variant="body1" sx={{ mb: 2 }}>{room.description}</Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Comodidades</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {room.amenities?.map((a) => (
                <Chip key={a.id} label={a.name} variant="outlined" />
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                <AttachMoney />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  R$ {room.pricePerDay.toFixed(2)} / dia
                </Typography>
              </Box>

              {bookingError && <Alert severity="error" sx={{ mb: 2 }}>{bookingError}</Alert>}
              {bookingSuccess && <Alert severity="success" sx={{ mb: 2 }}>{bookingSuccess}</Alert>}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Data de início"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('startDate')}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                />
                <TextField
                  label="Data de término"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('endDate')}
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                />
                <TextField
                  label="Número de pessoas"
                  type="number"
                  {...register('numberOfPeople')}
                  error={!!errors.numberOfPeople}
                  helperText={errors.numberOfPeople?.message}
                />
                <TextField
                  label="Observação (opcional)"
                  multiline
                  rows={3}
                  {...register('observation')}
                />

                {days > 0 && (
                  <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2">{days} dia(s)</Typography>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      Total: R$ {(days * room.pricePerDay).toFixed(2)}
                    </Typography>
                  </Box>
                )}

                <Button type="submit" variant="contained" size="large" disabled={!room.available || submitting}>
                  {submitting ? <CircularProgress size={24} /> : 'Reservar'}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}