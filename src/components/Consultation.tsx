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
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Tooltip
} from '@mui/material';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  User,
  Stethoscope,
  Calendar,
  Eye
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { userService } from '../services/userService';
import { consultationService, ConsultationData } from '../services/consultationService';
import { getUserRole, canEdit, canOnlyView } from '../utiles/RoleAccess';
import RoleBasedAccess from '../utiles/RoleBasedAccess';

interface ConsultationState extends ConsultationData {
  id: string;
  patient: any;
  medecin: any;
}

const Consultations: React.FC = () => {
  const [consultations, setConsultations] = useState<ConsultationState[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoveredText, setHoveredText] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newConsultation, setNewConsultation] = useState<ConsultationData>({
    date: '',
    patientId: '',
    medecinId: '',
    diagnostiqueParo: '',
    diagnostiqueOrtho: '',
    idConsultation: ''
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [medecins, setMedecins] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  // Get current user role
  const userRole = getUserRole();
  
  useEffect(() => {
    // Fetch patients, medecins and consultations when component mounts
    Promise.all([
      patientService.getAll(),
      userService.getMedecins(),
      consultationService.getAll()
    ])
      .then(([patientsData, medecinsData, consultationsData]) => {
        setPatients(patientsData);
        setMedecins(medecinsData);
        
        // If user is MEDECIN, filter consultations to only show their own
        if (userRole === 'MEDECIN') {
          // Get current medecin ID from localStorage or some other means
          const currentMedecinId = localStorage.getItem('userId');
          if (currentMedecinId) {
            const filteredConsultations = consultationsData.filter(
              consultation => consultation.medecinId === currentMedecinId
            );
            setConsultations(filteredConsultations);
          } else {
            setConsultations(consultationsData);
          }
        } else {
          // ADMIN and ETUDIANT see all consultations
          setConsultations(consultationsData);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [userRole]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, consultationId: string) => {
    setSelectedConsultation(consultationId);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMouseEnter = (text: string | undefined, event: React.MouseEvent) => {
    if (text) {
      setHoveredText(text);
      setHoverPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredText(null);
    setHoverPosition(null);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewConsultation({
      date: '',
      patientId: '',
      medecinId: '',
      diagnostiqueParo: '',
      diagnostiqueOrtho: '',
      idConsultation: ''
    });
  };

  const handleInputChange = (
    event: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.name as keyof ConsultationData;
    const value = event.target.value;
    setNewConsultation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // If user is MEDECIN, force the medecinId to be the current user's ID
    if (userRole === 'MEDECIN') {
      const currentMedecinId = localStorage.getItem('userId');
      if (currentMedecinId) {
        newConsultation.medecinId = currentMedecinId;
      }
    }
    
    try {
      await consultationService.create(newConsultation);
      // Refresh the consultations list
      const updatedConsultations = await consultationService.getAll();
      
      // If user is MEDECIN, filter consultations again
      if (userRole === 'MEDECIN') {
        const currentMedecinId = localStorage.getItem('userId');
        if (currentMedecinId) {
          const filteredConsultations = updatedConsultations.filter(
            consultation => consultation.medecinId === currentMedecinId
          );
          setConsultations(filteredConsultations);
        } else {
          setConsultations(updatedConsultations);
        }
      } else {
        setConsultations(updatedConsultations);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating consultation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    // Only ADMIN or MEDECIN (for their own consultations) can delete
    if (!canEdit()) {
      handleMenuClose();
      return;
    }
    
    try {
      await consultationService.delete(id);
      // Refresh the consultations list
      const updatedConsultations = await consultationService.getAll();
      
      // If user is MEDECIN, filter consultations again
      if (userRole === 'MEDECIN') {
        const currentMedecinId = localStorage.getItem('userId');
        if (currentMedecinId) {
          const filteredConsultations = updatedConsultations.filter(
            consultation => consultation.medecinId === currentMedecinId
          );
          setConsultations(filteredConsultations);
        } else {
          setConsultations(updatedConsultations);
        }
      } else {
        setConsultations(updatedConsultations);
      }
    } catch (error) {
      console.error('Error deleting consultation:', error);
    }
    handleMenuClose();
  };

  const filteredConsultations = React.useMemo(() => {
    if (!Array.isArray(consultations)) return [];
    return consultations.filter(consultation => 
      consultation.patient?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      consultation.date?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
    );
  }, [consultations, searchQuery]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
         Consultations
        </Typography>
        
        {/* Only ADMIN and MEDECIN can add new consultations */}
        <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
          <Button 
            variant="contained" 
            startIcon={<Plus size={18} />}
            sx={{ borderRadius: 2 }}
            onClick={handleOpenDialog}
          >
            Add New Consultation
          </Button>
        </RoleBasedAccess>
      </Box>

      {/* Role-specific message banner */}
      {userRole === 'ETUDIANT' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have view-only access to consultations.
        </Alert>
      )}
      {userRole === 'MEDECIN' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You can view, create, and modify your own consultations only.
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search Consultations..."
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
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {/* Only ADMIN and MEDECIN can export data */}
            <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
              <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                Export
              </Button>
            </RoleBasedAccess>
            <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>date de la consultation</TableCell>
                <TableCell>nom patient</TableCell>
                <TableCell>nom du medecin</TableCell>
                <TableCell>diagnostique paro</TableCell>
                <TableCell>diagnostique ortho</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredConsultations) && filteredConsultations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Calendar  size={14} style={{ marginRight: 8 }} />
                          <Typography variant="body2">{user.date}</Typography>
                        </Box>
                        
                    </TableCell>
                    <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <User size={14} style={{ marginRight: 8 }}></User>
                          <Typography variant="body2">{user.patient}</Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Stethoscope size={14} style={{ marginRight: 8 }}/>
                          <Typography variant="body2">{user.medecin}</Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 150,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(event) => handleMouseEnter(user.diagnostiqueParo, event)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {user.diagnostiqueParo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 150,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(event) => handleMouseEnter(user.diagnostiqueOrtho, event)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {user.diagnostiqueOrtho}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {/* Different action buttons based on role */}
                      {canOnlyView() ? (
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <IconButton 
                          size="small" 
                          onClick={(event) => handleMenuClick(event, user.id)}
                          // For MEDECIN, only allow actions on their own consultations
                          disabled={userRole === 'MEDECIN' && user.medecinId !== localStorage.getItem('userId')}
                        >
                          <MoreVertical size={18} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={consultations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Only ADMIN or MEDECIN (for their own) can see the action menu */}
      <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
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
          <MenuItem onClick={handleMenuClose}>
            <Edit size={16} style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => handleDelete(selectedConsultation!)} sx={{ color: 'error.main' }}>
            <Trash2 size={16} style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        </Menu>
      </RoleBasedAccess>

      {hoveredText && hoverPosition && (
        <Box
          sx={{
            position: 'fixed',
            top: hoverPosition.y + 10,
            left: hoverPosition.x + 10,
            backgroundColor: 'white',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            padding: 1,
            zIndex: 1000,
            maxWidth: 300,
            wordWrap: 'break-word',
          }}
        >
          <Typography variant="body2">{hoveredText}</Typography>
        </Box>
      )}

      {/* Only ADMIN or MEDECIN can add/edit consultations */}
      <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Consultation</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={newConsultation.date}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Patient</InputLabel>
                <Select
                  label="Patient"
                  name="patientId"
                  value={newConsultation.patientId}
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
              
              {/* Only ADMIN can choose medecin, MEDECIN is restricted to their own ID */}
              <RoleBasedAccess 
                requiredRoles="ADMIN"
                fallback={
                  <Alert severity="info" sx={{ mb: 2 }}>
                    As a MEDECIN, you will be automatically assigned as the consultant.
                  </Alert>
                }
              >
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Médecin</InputLabel>
                  <Select
                    label="Médecin"
                    name="medecinId"
                    value={newConsultation.medecinId}
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
              </RoleBasedAccess>
              
              <TextField
                fullWidth
                label="Diagnostique Paro"
                name="diagnostiqueParo"
                value={newConsultation.diagnostiqueParo}
                onChange={handleInputChange}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Diagnostique Ortho"
                name="diagnostiqueOrtho"
                value={newConsultation.diagnostiqueOrtho}
                onChange={handleInputChange}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">Save</Button>
            </DialogActions>
          </form>
        </Dialog>
      </RoleBasedAccess>
    </Box>
  );
};

export default Consultations;