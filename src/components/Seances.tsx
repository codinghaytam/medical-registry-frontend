import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { patientService } from '../services/patientService';
import { seanceService, SeanceData } from '../services/seanceService';
import { userService } from '../services/userService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Seances: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSeanceId, setSelectedSeanceId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSeance, setNewSeance] = useState<SeanceData>({
    type: '',
    date: new Date(),
    patientId: '',
    medecinId: '',
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [seances, setSeances] = useState<SeanceData[]>([]);
  const [medecins, setMedecins] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    // Fetch seances when component mounts
    const fetchData = async () => {
      try {
        const [seancesData, patientsData, medecinsData] = await Promise.all([
          seanceService.getAll(),
          patientService.getAll(),
          userService.getMedecins()
        ]);
        setSeances(seancesData);
        setPatients(patientsData);
        setMedecins(medecinsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, seanceId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSeanceId(seanceId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSeanceId(null);
  };

  const resetForm = () => {
    setNewSeance({
      type: '',
      date: new Date(),
      patientId: '',
      medecinId: '',
    });
    setIsEditing(false);
  };

  const handleOpenDialog = (seance?: SeanceData) => {
    if (seance) {
      setNewSeance({
        ...seance,
        date: new Date(seance.date)
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleInputChange = (event: SelectChangeEvent<string>) => {
    const name = event.target.name as keyof SeanceData;
    const value = event.target.value;
    setNewSeance(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (isEditing && selectedSeanceId) {
        await seanceService.update(selectedSeanceId, newSeance);
      } else {
        await seanceService.create(newSeance);
      }
      handleCloseDialog();
      // Refresh seances list
      const updatedSeances = await seanceService.getAll();
      setSeances(updatedSeances);
    } catch (error) {
      console.error('Error saving seance:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await seanceService.delete(id);
      handleMenuClose();
      // Refresh seances list
      const updatedSeances = await seanceService.getAll();
      setSeances(updatedSeances);
    } catch (error) {
      console.error('Error deleting seance:', error);
    }
  };

  const filteredSeances = React.useMemo(() => {
    if (!Array.isArray(seances)) return [];
    return seances.filter(seance => 
      seance.type?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      seance.patient?.nom?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      seance.medecin?.userInfo?.firstName?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
    );
  }, [seances, searchQuery]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Séances
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />}
          sx={{ borderRadius: 2 }}
          onClick={() => handleOpenDialog()}
        >
          Add New Séance
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search Séances..."
            variant="outlined"
            size="small"
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Medecin</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredSeances) && filteredSeances
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((seance) => (
                  <TableRow
                    key={seance.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>{seance.id}</TableCell>
                    <TableCell>{seance.type}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Calendar size={14} style={{ marginRight: 8 }} />
                        {format(new Date(seance.date), 'dd/MM/yyyy')}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {seance.patient ? 
                        `${seance.patient.nom} ${seance.patient.prenom}` : 
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      {seance.medecin?.userInfo ? 
                        `${seance.medecin.userInfo.firstName} ${seance.medecin.userInfo.lastName}` : 
                        'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(event) => handleMenuClick(event, seance.id!)}
                      >
                        <MoreVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={seances.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 1,
              mb: 0.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          const seance = seances.find(s => s.id === selectedSeanceId);
          if (seance) {
            handleOpenDialog(seance);
          }
          handleMenuClose();
        }}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedSeanceId && handleDelete(selectedSeanceId)} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Séance' : 'Add New Séance'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={newSeance.date}
                onChange={(newValue) => {
                  setNewSeance(prev => ({ ...prev, date: newValue || new Date() }));
                }}
                sx={{ mb: 2, width: '100%' }}
              />
            </LocalizationProvider>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Médecin</InputLabel>
              <Select
                label="Médecin"
                name="medecinId"
                value={newSeance.medecinId}
                onChange={handleInputChange}
                required
              >
                {Array.isArray(medecins) && medecins.map((medecin) => (
                  <MenuItem key={medecin.id} value={medecin.id}>
                    {medecin.userInfo?.firstName} {medecin.userInfo?.lastName} - {medecin.profession}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={newSeance.type}
                label="Type"
                onChange={handleInputChange}
                required
              >
                <MenuItem value="Parodontologie">Parodontologie</MenuItem>
                <MenuItem value="Orthodontie">Orthodontie</MenuItem>
                <MenuItem value="Chirurgie">Chirurgie</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Patient</InputLabel>
              <Select
                label="Patient"
                name="patientId"
                value={newSeance.patientId}
                onChange={handleInputChange}
                required
              >
                {Array.isArray(patients) && patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.nom} {patient.prenom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Seances;
