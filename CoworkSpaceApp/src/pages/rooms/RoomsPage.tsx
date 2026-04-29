import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, CardMedia, CardActionArea,
  Typography, Chip, CircularProgress, Alert, Button
} from '@mui/material';
import { People, AttachMoney, LocationOn, Add } from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { type Room } from '../../types';
import useAuthStore from '../../store/authStore';

export default function RoomsPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get<Room[]>('/room');
        setRooms(response.data);
      } catch {
        setError('Erro ao carregar salas.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Salas disponíveis
          </Typography>
          {token && (
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/rooms/new')}>
              Anunciar sala
            </Button>
          )}
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea onClick={() => navigate(`/rooms/${room.id}`)}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={
                      room.images?.[0]
                        ? `http://localhost:5000${room.images[0]}`
                        : 'https://placehold.co/400x200?text=Sem+Imagem'
                    }
                    alt={room.name}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{room.name}</Typography>
                      <Chip
                        label={room.available ? 'Disponível' : 'Indisponível'}
                        color={room.available ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">{room.location}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">Até {room.capacity} pessoas</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoney fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        R$ {room.pricePerDay.toFixed(2)} / dia
                      </Typography>
                    </Box>

                    {room.amenities?.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {room.amenities.slice(0, 3).map((a) => (
                          <Chip key={a.id} label={a.name} size="small" variant="outlined" />
                        ))}
                        {room.amenities.length > 3 && (
                          <Chip label={`+${room.amenities.length - 3}`} size="small" />
                        )}
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Anunciado por {room.ownerName}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}