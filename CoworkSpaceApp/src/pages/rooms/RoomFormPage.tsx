import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,
  CircularProgress, Alert, Switch, FormControlLabel
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import { type Room } from '../../types';

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  type: z.string().min(2, 'Obrigatório'),
  location: z.string().min(3, 'Obrigatório'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  capacity: z.string().min(1, 'Obrigatório'),
  pricePerDay: z.string().min(1, 'Obrigatório'),
  available: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RoomFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { available: true },
  });

  useEffect(() => {
    if (!isEditing) return;
    const fetchRoom = async () => {
      try {
        const response = await api.get<Room>(`/room/${id}`);
        const r = response.data;
        setValue('name', r.name);
        setValue('type', r.type);
        setValue('location', r.location);
        setValue('description', r.description);
        setValue('capacity', String(r.capacity));
        setValue('pricePerDay', String(r.pricePerDay));
        setValue('available', r.available);
      } catch {
        setError('Erro ao carregar sala.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        ...data,
        capacity: Number(data.capacity),
        pricePerDay: Number(data.pricePerDay),
        amenityIds: [],
      };

      if (isEditing) {
        await api.put(`/room/${id}`, payload);
      } else {
        await api.post('/room', payload);
      }

      navigate('/rooms/my');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar sala.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
          {isEditing ? 'Editar sala' : 'Anunciar sala'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField label="Nome" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Tipo" fullWidth placeholder="Ex: Sala de reunião, Escritório..." {...register('type')} error={!!errors.type} helperText={errors.type?.message} />
          <TextField label="Localização" fullWidth {...register('location')} error={!!errors.location} helperText={errors.location?.message} />
          <TextField label="Descrição" fullWidth multiline rows={4} {...register('description')} error={!!errors.description} helperText={errors.description?.message} />
          <TextField label="Capacidade (pessoas)" type="number" fullWidth {...register('capacity')} error={!!errors.capacity} helperText={errors.capacity?.message} />
          <TextField label="Preço por dia (R$)" type="number" fullWidth {...register('pricePerDay')} error={!!errors.pricePerDay} helperText={errors.pricePerDay?.message} />

          {isEditing && (
            <FormControlLabel
              control={<Switch defaultChecked {...register('available')} />}
              label="Disponível para reservas"
            />
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => navigate('/rooms/my')}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" fullWidth disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : isEditing ? 'Salvar alterações' : 'Anunciar'}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}