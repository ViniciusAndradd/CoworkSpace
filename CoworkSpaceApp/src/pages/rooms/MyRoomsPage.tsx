import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardMedia,
  CircularProgress, Alert, Grid, Button, Chip, IconButton
} from '@mui/material';
import { Edit, Delete, Add, Image } from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { type Room } from '../../types';

export default function MyRoomsPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get<Room[]>('/room/my');
      setRooms(response.data);
    } catch {
      setError('Erro ao carregar suas salas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta sala?')) return;
    try {
      await api.delete(`/room/${id}`);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Erro ao excluir sala.');
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Minhas salas</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/rooms/new')}>
            Anunciar sala
          </Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && rooms.length === 0 && (
          <Alert severity="info">Você ainda não anunciou nenhuma sala.</Alert>
        )}

        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="160"
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
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {room.location} · R$ {room.pricePerDay.toFixed(2)}/dia · {room.capacity} pessoas
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton color="primary" onClick={() => navigate(`/rooms/${room.id}/edit`)} title="Editar">
                      <Edit />
                    </IconButton>
                    <IconButton color="inherit" onClick={() => navigate(`/rooms/${room.id}/images`)} title="Imagens">
                      <Image />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(room.id)} title="Excluir">
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}