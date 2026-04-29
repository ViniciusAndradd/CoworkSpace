import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import { type AuthResponse } from '../../types';

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { token, id, name, email, phone, role } = response.data;
      login(token, { id, name, email, phone, role });
      navigate('/rooms');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          Criar conta
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField label="Nome" fullWidth {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Email" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Telefone" fullWidth {...register('phone')} error={!!errors.phone} helperText={errors.phone?.message} />
          <TextField label="Senha" type="password" fullWidth {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
          <TextField label="Confirmar Senha" type="password" fullWidth {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Já tem conta? <Link to="/login">Entrar</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}