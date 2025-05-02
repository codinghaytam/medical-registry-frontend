import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Avatar, 
  LinearProgress, 
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  MoreVertical, 
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Profile from './Profile';
import RoleBasedAccess from '../utiles/RoleBasedAccess';
import { getUserRole, canEdit } from '../utiles/RoleAccess';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const userRole = getUserRole();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      <Profile></Profile>
      
      {/* Role information banner */}
      <Card sx={{ mb: 4, bgcolor: theme.palette.primary.light + '20' }}>
        <CardContent>
          <Typography variant="h6">
            Welcome, {userRole}
          </Typography>
          <Typography variant="body2">
            {userRole === 'ADMIN' && "You have full access to all features."}
            {userRole === 'MEDECIN' && "You can view and modify data related to your profession."}
            {userRole === 'ETUDIANT' && "You have view-only access to the application."}
          </Typography>
        </CardContent>
      </Card>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    $24,532
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowUpRight size={16} color={theme.palette.success.main} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +12.5%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.light + '20', p: 1 }}>
                  <DollarSign size={24} color={theme.palette.primary.main} />
                </Avatar>
              </Box>
              
              {/* Admin/Medecin only actions */}
              <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth
                  >
                    View Details
                  </Button>
                </Box>
              </RoleBasedAccess>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Orders
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    1,243
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowUpRight size={16} color={theme.palette.success.main} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +8.3%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.secondary.light + '20', p: 1 }}>
                  <ShoppingCart size={24} color={theme.palette.secondary.main} />
                </Avatar>
              </Box>
              
              {/* Admin/Medecin only actions */}
              <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    fullWidth
                  >
                    Manage Orders
                  </Button>
                </Box>
              </RoleBasedAccess>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Customers
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    3,582
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowUpRight size={16} color={theme.palette.success.main} />
                    <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                      +5.7%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.info.light + '20', p: 1 }}>
                  <Users size={24} color={theme.palette.info.main} />
                </Avatar>
              </Box>
              
              {/* Admin only actions */}
              <RoleBasedAccess requiredRoles="ADMIN">
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth
                    color="primary"
                  >
                    Add New
                  </Button>
                </Box>
              </RoleBasedAccess>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Growth Rate
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                    +18.3%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowDownRight size={16} color={theme.palette.error.main} />
                    <Typography variant="caption" color="error.main" sx={{ ml: 0.5 }}>
                      -2.1%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.light + '20', p: 1 }}>
                  <TrendingUp size={24} color={theme.palette.success.main} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Admin-only section */}
      <RoleBasedAccess requiredRoles="ADMIN">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Admin Controls</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Button variant="contained" color="primary" fullWidth>
                Manage System Settings
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="contained" color="secondary" fullWidth>
                User Management
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="contained" color="error" fullWidth>
                System Logs
              </Button>
            </Grid>
          </Grid>
        </Box>
      </RoleBasedAccess>
    </Box>
  );
};

export default Dashboard;