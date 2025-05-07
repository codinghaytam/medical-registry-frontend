import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress
} from '@mui/material';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  MoreVertical, 
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  User
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
import { consultationService } from '../services/consultationService';
import { patientService } from '../services/patientService';
import RoleDebugInfo from './RoleDebugInfo';

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
  const navigate = useNavigate();
  const userRole = getUserRole();
  const [medecinPatients, setMedecinPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    // Only fetch patients if the user is a medecin
    if (userRole === 'MEDECIN') {
      fetchMedecinPatients();
    }
  }, [userRole]);

  const fetchMedecinPatients = async () => {
    setIsLoading(true);
    try {
      // Get the medecin ID from localStorage
      const medecinId = JSON.parse(localStorage.getItem('user') || '{}').user.id;
      
      if (!medecinId) {
        console.error('Medecin ID not found in local storage');
        return;
      }

      // Fetch all consultations
      const consultations = await consultationService.getAll();
      
      // Filter consultations by medecin ID
      const medecinConsultations = consultations.filter(
        (consultation: any) => consultation.medecinId === medecinId
      );
      
      // Extract unique patient IDs from consultations
      const patientIds = new Set(
        medecinConsultations.map((consultation: any) => consultation.patientId)
      );
      
      // Fetch all patients
      const allPatients = await patientService.getAll();
      
      // Filter patients by ID
      const filteredPatients = allPatients.filter(
        (patient: any) => patientIds.has(patient.id)
      );
      
      setMedecinPatients(filteredPatients);
    } catch (error) {
      console.error('Error fetching medecin patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      <Profile></Profile>
      
      {/* Role information banner */}
      
      
      {/* Stats Cards */}
      
      

      
      {/* Medecin-only patients section */}
      <RoleBasedAccess requiredRoles="MEDECIN">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Your Patients</Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Card>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Num dossier</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Prénom</TableCell>
                      <TableCell>Adresse</TableCell>
                      <TableCell>Téléphone</TableCell>
                      <TableCell>Motif de Consultation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {medecinPatients.length > 0 ? (
                      medecinPatients
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((patient) => (
                          <TableRow
                            key={patient.id}
                            onClick={() => handleRowClick(patient.id)}
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              cursor: 'pointer',
                            }}
                          >
                            <TableCell>
                              <User size={14} style={{ marginRight: 8 }} />
                            </TableCell>
                            <TableCell>{patient.numeroDeDossier}</TableCell>
                            <TableCell>{patient.nom}</TableCell>
                            <TableCell>{patient.prenom}</TableCell>
                            <TableCell>{patient.adresse}</TableCell>
                            <TableCell>{patient.tel}</TableCell>
                            <TableCell>
                              {patient.motifConsultation?.toLowerCase().replace(/_/g, ' ')}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body1" sx={{ py: 2 }}>
                            You don't have any patients yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {medecinPatients.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={medecinPatients.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              )}
            </Card>
          )}
        </Box>
      </RoleBasedAccess>
    </Box>
  );
};

export default Dashboard;