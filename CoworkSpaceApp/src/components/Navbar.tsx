import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
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

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" onClick={() => navigate('/rooms')}>Salas</Button>
          <Button color="inherit" onClick={() => navigate('/bookings')}>Minhas Reservas</Button>

          {user?.role === 'admin' && (
            <>
              <Button color="inherit" onClick={() => navigate('/admin/rooms')}>Admin Salas</Button>
              <Button color="inherit" onClick={() => navigate('/admin/bookings')}>Admin Reservas</Button>
            </>
          )}

          <Button color="inherit" onClick={handleLogout}>Sair</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}