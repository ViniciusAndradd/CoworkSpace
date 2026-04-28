import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { type Room } from '../../types';

interface RoomFormData {
  name: string;
  type: string;
  location: string;
  description: string;
  capacity: number;
  pricePerDay: number;
  available: boolean;
  amenityIds: string[];
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<RoomFormData>();

  useEffect(() => {
    fetchRooms();
  }, []);

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

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', type: '', location: '', description: '', capacity: 1, pricePerDay: 0, available: true, amenityIds: [] });
    setDialogOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    setValue('name', room.name);
    setValue('type', room.type);
    setValue('location', room.location);
    setValue('description', room.description);
    setValue('capacity', room.capacity);
    setValue('pricePerDay', room.pricePerDay);
    setValue('available', room.available);
    setValue('amenityIds', room.amenities?.map((a) => a.id) || []);
    setDialogOpen(true);
  };

  const onSubmit = async (data: RoomFormData) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        capacity: Number(data.capacity),
        pricePerDay: Number(data.pricePerDay),
        amenityIds: data.amenityIds || [],
      };

      if (editing) {
        await api.put(`/room/${editing.id}`, payload);
      } else {
        await api.post('/room', payload);
      }

      setDialogOpen(false);
      fetchRooms();
    } catch {
      alert('Erro ao salvar sala.');
    } finally {
      setSubmitting(false);
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
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Admin — Salas</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Nova Sala</Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Localização</strong></TableCell>
                <TableCell><strong>Capacidade</strong></TableCell>
                <TableCell><strong>Preço/dia</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.location}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>R$ {room.pricePerDay.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={room.available ? 'Disponível' : 'Indisponível'}
                      color={room.available ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEdit(room)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(room.id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editing ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Nome" {...register('name')} fullWidth />
              <TextField label="Tipo" {...register('type')} fullWidth />
              <TextField label="Localização" {...register('location')} fullWidth />
              <TextField label="Descrição" {...register('description')} multiline rows={3} fullWidth />
              <TextField label="Capacidade" type="number" {...register('capacity')} fullWidth />
              <TextField label="Preço por dia" type="number" {...register('pricePerDay')} fullWidth />
              {editing && (
                <FormControlLabel
                  control={<Switch defaultChecked={editing.available} {...register('available')} />}
                  label="Disponível"
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}