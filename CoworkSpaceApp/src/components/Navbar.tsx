import { AppBar, Toolbar, Typography, Button, Box, Divider } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer', flexGrow: 1, fontWeight: 'bold' }}
          onClick={() => navigate('/rooms')}
        >
          CoworkSpace
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button color="inherit" onClick={() => navigate('/rooms')}>Salas</Button>
          <Button color="inherit" onClick={() => navigate('/rooms/my')}>Minhas salas</Button>
          <Button color="inherit" onClick={() => navigate('/bookings')}>Minhas reservas</Button>
          <Button color="inherit" onClick={() => navigate('/bookings/my-rooms')}>Reservas das minhas salas</Button>

          {user?.role === 'admin' && (
            <>
              <Button color="inherit" onClick={() => navigate('/admin/rooms')}>Admin salas</Button>
              <Button color="inherit" onClick={() => navigate('/admin/bookings')}>Admin reservas</Button>
            </>
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }} />

          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
          >
            <AccountCircle />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {user?.name}
            </Typography>
          </Box>

          <Button color="inherit" onClick={handleLogout}>Sair</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}