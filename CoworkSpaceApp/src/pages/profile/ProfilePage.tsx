import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box, Typography, TextField, Button,
  CircularProgress, Alert, Divider, Paper
} from '@mui/material';
import { Person } from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

const profileSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, login, token } = useAuthStore();
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');
      await api.put(`/user/${user?.id}`, data);
      login(token!, { ...user!, name: data.name });
      setProfileSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');
      await api.patch(`/user/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess('Senha alterada com sucesso!');
      resetPassword();
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Erro ao alterar senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <Person fontSize="large" />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Meu perfil
          </Typography>
        </Box>

        {/* Dados pessoais */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Dados pessoais
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Email: <strong>{user?.email}</strong>
          </Typography>

          {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>{profileSuccess}</Alert>}
          {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}

          <Box
            component="form"
            onSubmit={handleProfileSubmit(onProfileSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Nome"
              fullWidth
              {...registerProfile('name')}
              error={!!profileErrors.name}
              helperText={profileErrors.name?.message}
            />
            <TextField
              label="Telefone"
              fullWidth
              {...registerProfile('phone')}
              error={!!profileErrors.phone}
              helperText={profileErrors.phone?.message}
            />
            <Button type="submit" variant="contained" disabled={profileLoading} sx={{ alignSelf: 'flex-end' }}>
              {profileLoading ? <CircularProgress size={24} /> : 'Salvar alterações'}
            </Button>
          </Box>
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* Alterar senha */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Alterar senha
          </Typography>

          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>}
          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}

          <Box
            component="form"
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Senha atual"
              type="password"
              fullWidth
              {...registerPassword('currentPassword')}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
            />
            <TextField
              label="Nova senha"
              type="password"
              fullWidth
              {...registerPassword('newPassword')}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
            />
            <TextField
              label="Confirmar nova senha"
              type="password"
              fullWidth
              {...registerPassword('confirmPassword')}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
            />
            <Button type="submit" variant="contained" disabled={passwordLoading} sx={{ alignSelf: 'flex-end' }}>
              {passwordLoading ? <CircularProgress size={24} /> : 'Alterar senha'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}