import React, { useEffect, useState } from 'react';
import useInterval from '../utiles/useInterval'
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Chip,
  Alert,
  Collapse,
} from '@mui/material';
import { 
  Search, 
  Plus, 
  MoreVertical,
  Edit, 
  Trash2,
  User,
  RefreshCw
} from 'lucide-react';
import { fetch } from '@tauri-apps/plugin-http';
import { patientService, PatientData } from '../services/patientService';
import { getUserRole } from '../utiles/RoleAccess';

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [Motifs, setMotifs] = useState<string[]>([]);
  const [typeMastications, setTypeMastications] = useState<string[]>([]);
  const [hygienes, setHygienes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userRole] = useState(getUserRole());
  const [userProfession, setUserProfession] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState<PatientData>({
    nom: '',
    prenom: '',
    numeroDeDossier: '',
    adresse: '',
    tel: '',
    motifConsultation: 'ESTHETIQUE',
    anameseGenerale: '',
    anamneseFamiliale: '',
    anamneseLocale: '',
    typeMastication: 'BILATERALE',
    hygieneBuccoDentaire: 'BONNE',
    antecedentsDentaires: '',
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get the current user's profession if they are a médecin
  useEffect(() => {
    if (userRole === 'MEDECIN') {
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          
          // Check all possible locations for profession information
          const profession = userData.profession || 
                            (userData.user && userData.user.profession) ||
                            '';
          
          console.log('Found profession in localStorage:', profession);
          setUserProfession(profession);
        } else {
          console.log('No user data found in localStorage');
        }
      } catch (error) {
        console.error('Error getting user profession:', error);
      }
    }
  }, [userRole]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, patientId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(patientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleEditPatient = async () => {
    if (!selectedUserId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Fetch the selected patient data
      const patientData = await patientService.getById(selectedUserId.toString());
      
      // Set it to the form
      setNewPatient(patientData);
      
      // Open dialog in edit mode
      setOpenDialog(true);
      
      // Close menu
      handleMenuClose();
    } catch (error) {
      console.error('Failed to fetch patient for editing:', error);
      setError('Failed to fetch patient data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (patientId: string) => {
    // Navigate to patient details page instead of expanding the row
    navigate(`/patients/${patientId}`);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
    setNewPatient({
      nom: '',
      prenom: '',
      numeroDeDossier: '',
      adresse: '',
      tel: '',
      motifConsultation: 'ESTHETIQUE',
      anameseGenerale: '',
      anamneseFamiliale: '',
      anamneseLocale: '',
      typeMastication: 'BILATERALE',
      hygieneBuccoDentaire: 'BONNE',
      antecedentsDentaires: '',
    });
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setNewPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (newPatient.id) {
        // Update existing patient
        await patientService.update(newPatient.id.toString(), newPatient);
      } else {
        // Create new patient
        await patientService.create(newPatient);
      }
      handleCloseDialog();
      // Refresh patients list after successful creation/update
      fetchPatients();
    } catch (error: any) {
      console.error('Failed to save patient:', error);
      // Set error message for display
      if (error.response) {
        try {
          const errorData = await error.response.json().catch(() => null);
          setError(errorData?.error || error.message || "Une erreur s'est produite lors de l'enregistrement du patient");
        } catch (e) {
          setError(error.message || "Une erreur s'est produite lors de l'enregistrement du patient");
        }
      } else {
        setError(error.message || "Une erreur s'est produite lors de l'enregistrement du patient");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await patientService.delete(id);
      handleMenuClose();
      // Refresh patients list after deletion
      fetchPatients();
    } catch (error: any) {
      console.error('Failed to delete patient:', error);
      setNetworkError(error.message || "Failed to delete patient");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch patients data
  const fetchPatients = async () => {
    setIsLoading(true);
    setNetworkError(null);
    try {
      const data = await patientService.getAll();
      
      // If user is a médecin, filter patients based on their profession
      if (userRole === 'MEDECIN' && userProfession) {
        // Filter patients to match the médecin's profession
        const filteredData = data.filter((patient: any) => 
          patient.State === userProfession
        );
        setPatients(filteredData);
      } else {
        // Admin or other roles see all patients
        setPatients(data);
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setNetworkError(error.message || 'Failed to load patients. Please try again.');
      // Still set empty array instead of failing completely
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auto-refresh for patients list every 5 minutes
  useInterval(() => {
    fetchPatients();
  }, 300000); // 5 minutes in milliseconds

  useEffect(() => {
    fetchPatients();
  }, [userProfession]); // Refetch when userProfession changes
  

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const [motifsResponse, masticationsResponse, hygienesResponse] = await Promise.all([
          fetch('http://localhost:3000/enum/motif-consultation').then(res => res.json()),
          fetch('http://localhost:3000/enum/type-mastication').then(res => res.json()),
          fetch('http://localhost:3000/enum/hygiene-bucco-dentaire').then(res => res.json())
        ]);
        
        setMotifs(motifsResponse);
        setTypeMastications(masticationsResponse);
        setHygienes(hygienesResponse);
      } catch (error) {
        console.error('Error fetching enum values:', error);
        // Use empty arrays as fallback
        setMotifs([]);
        setTypeMastications([]);
        setHygienes([]);
      }
    };
    
    fetchEnums();
  }, []);

  const filteredPatients = React.useMemo(() => {
    if (!Array.isArray(patients)) return [];
    return patients.filter(patient => 
      patient.nom?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      patient.prenom?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      patient.numeroDeDossier?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
    );
  }, [patients, searchQuery]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Show network error message at the top if present */}
      {networkError && (
        <Box sx={{ 
          mb: 4, 
          p: 2, 
          bgcolor: 'error.light', 
          color: 'error.dark',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body1">
            {networkError}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            size="small"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Patients
          </Typography>
          {userRole === 'MEDECIN' && userProfession && (
            <Chip 
              label={`${userProfession.replace(/_/g, ' ').toLowerCase()} department`}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />}
          sx={{ borderRadius: 2 }}
          onClick={handleOpenDialog}
          disabled={isLoading}
        >
          Add New Patient
        </Button>
      </Box>

      {userRole === 'MEDECIN' && userProfession && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You are viewing patients in the {userProfession.replace(/_/g, ' ').toLowerCase()} department based on your profession.
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search patients..."
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
            <Tooltip title="Refresh patients list">
              <IconButton onClick={fetchPatients} size="small" disabled={isLoading}>
                <RefreshCw size={18} />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>
              Export
            </Button>
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
                <TableCell></TableCell>
                <TableCell>Num dossier</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Téléphone</TableCell>
                {userRole === 'ADMIN' && <TableCell>Département</TableCell>}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={userRole === 'ADMIN' ? 8 : 7} align="center">
                    Loading patients...
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={userRole === 'ADMIN' ? 8 : 7} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      {networkError ? "Couldn't load patients due to a network error" : "No patients found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((patient) => (
                    <React.Fragment key={patient.id}>
                      <TableRow
                        onClick={() => handleRowClick(patient.id)}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
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
                        {userRole === 'ADMIN' && (
                          <TableCell>
                            <Chip 
                              label={patient.State?.replace(/_/g, ' ').toLowerCase() || 'unassigned'} 
                              size="small" 
                              color={patient.State === 'PARODONTAIRE' ? 'primary' : 'secondary'} 
                              variant="outlined"
                            />
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            onClick={(event) => {
                              event.stopPropagation();
                              handleMenuClick(event, patient.id);
                            }}
                            disabled={isLoading}
                          >
                            <MoreVertical size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      {expandedRow === patient.id && (
                        <TableRow>
                          <TableCell colSpan={userRole === 'ADMIN' ? 8 : 7}>
                            <Table size="small" sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                              <TableBody>
                                <TableRow>
                                  <TableCell><strong>Motif de Consultation:</strong></TableCell>
                                  <TableCell>{patient.motifConsultation?.replace(/_/g, ' ').toLowerCase()}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell><strong>Anamnèses Générale:</strong></TableCell>
                                  <TableCell>{patient.anameseGenerale}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell><strong>Anamnèses Familiale:</strong></TableCell>
                                  <TableCell>{patient.anamneseFamiliale}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell><strong>Anamnèses Locale:</strong></TableCell>
                                  <TableCell>{patient.anamneseLocale}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell><strong>Type de Mastication:</strong></TableCell>
                                  <TableCell>{patient.typeMastication?.replace(/_/g, ' ').toLowerCase()}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell><strong>Hygiène Bucco-Dentaire:</strong></TableCell>
                                  <TableCell>{patient.hygieneBuccoDentaire?.replace(/_/g, ' ').toLowerCase()}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell><strong>Antécédents Dentaires:</strong></TableCell>
                                  <TableCell>{patient.antecedentsDentaires}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
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
        <MenuItem onClick={handleEditPatient}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedUserId && handleDelete(selectedUserId.toString())} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{newPatient.id ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {/* Show error message if present */}
            {error && (
              <Box sx={{ 
                mb: 3,
                p: 2, 
                bgcolor: 'error.light', 
                color: 'error.dark',
                borderRadius: 1,
                fontSize: '0.875rem'
              }}>
                {error}
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Left column - Text fields */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Informations Générales</Typography>
                <TextField
                  size="small"
                  label="Nom"
                  name="nom"
                  value={newPatient.nom}
                  onChange={handleTextInputChange}
                  required
                  sx={{ mb: 2, width: '100%' }}
                  disabled={isLoading}
                />
                <TextField
                  size="small"
                  label="Prénom"
                  name="prenom"
                  value={newPatient.prenom}
                  onChange={handleTextInputChange}
                  required
                  sx={{ mb: 2, width: '100%' }}
                  disabled={isLoading}
                />
                <TextField
                  size="small"
                  label="Numéro de Dossier"
                  name="numeroDeDossier"
                  value={newPatient.numeroDeDossier}
                  onChange={handleTextInputChange}
                  required
                  sx={{ mb: 2, width: '100%' }}
                  disabled={isLoading}
                />
                <TextField
                  size="small"
                  label="Adresse"
                  name="adresse"
                  value={newPatient.adresse}
                  onChange={handleTextInputChange}
                  sx={{ mb: 2, width: '100%' }}
                  disabled={isLoading}
                />
                <TextField
                  size="small"
                  label="Téléphone"
                  name="tel"
                  value={newPatient.tel}
                  onChange={handleTextInputChange}
                  sx={{ mb: 2, width: '100%' }}
                  disabled={isLoading}
                />
                <TextField
                  size="small"
                  label="Antécédents Dentaires"
                  name="antecedentsDentaires"
                  value={newPatient.antecedentsDentaires}
                  onChange={handleTextInputChange}
                  multiline
                  rows={2}
                  sx={{ mb: 2, width: '100%' }}
                  disabled={isLoading}
                />
              </Box>

              {/* Right column - Select fields and multiline text fields */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Informations Médicales</Typography>
                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Motif de Consultation</InputLabel>
                  <Select
                    name="motifConsultation"
                    value={newPatient.motifConsultation}
                    onChange={handleSelectChange}
                    label="Motif de Consultation"
                    disabled={isLoading}
                  >
                    {Array.isArray(Motifs) && Motifs.length > 0 ? (
                      Motifs.map((motif: string) => (
                        <MenuItem key={motif} value={motif}>
                          {motif.toLowerCase().replace(/_/g, ' ')}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">No options available</MenuItem>
                    )}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Type de Mastication</InputLabel>
                  <Select
                    name="typeMastication"
                    value={newPatient.typeMastication}
                    onChange={handleSelectChange}
                    label="Type de Mastication"
                    disabled={isLoading}
                  >
                    {Array.isArray(typeMastications) && typeMastications.length > 0 ? (
                      typeMastications.map((type: string) => (
                        <MenuItem key={type} value={type}>
                          {type.toLowerCase().replace(/_/g, ' ')}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">No options available</MenuItem>
                    )}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Hygiène Bucco-Dentaire</InputLabel>
                  <Select
                    name="hygieneBuccoDentaire"
                    value={newPatient.hygieneBuccoDentaire}
                    onChange={handleSelectChange}
                    label="Hygiène Bucco-Dentaire"
                    disabled={isLoading}
                  >
                    {Array.isArray(hygienes) && hygienes.length > 0 ? (
                      hygienes.map((hygiene: string) => (
                        <MenuItem key={hygiene} value={hygiene}>
                          {hygiene.toLowerCase().replace(/_/g, ' ')}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">No options available</MenuItem>
                    )}
                  </Select>
                </FormControl>

                {userRole === 'ADMIN' && (
                  <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Département</InputLabel>
                    <Select
                      name="State"
                      value={newPatient.State || 'PARODONTAIRE'}
                      onChange={handleSelectChange}
                      label="Département"
                      disabled={isLoading}
                    >
                      <MenuItem value="PARODONTAIRE">Parodontaire</MenuItem>
                      <MenuItem value="ORTHODONTAIRE">Orthodontaire</MenuItem>
                    </Select>
                  </FormControl>
                )}

                <TextField
                  size="small"
                  label="Anamnèse Générale"
                  name="anameseGenerale"
                  value={newPatient.anameseGenerale}
                  onChange={handleTextInputChange}
                  multiline
                  rows={2}
                  sx={{ mb: 2, width: '100%' }}
                  disabled={isLoading}
                />
                <TextField
                  size="small"
                  label="Anamnèse Familiale"
                  name="anamneseFamiliale"
                  value={newPatient.anamneseFamiliale}
                  onChange={handleTextInputChange}
                  multiline
                  rows={2}
                  sx={{ mb: 2, width: '100%' }}
                  disabled={isLoading}
                />
                <TextField
                  size="small"
                  label="Anamnèse Locale"
                  name="anamneseLocale"
                  value={newPatient.anamneseLocale}
                  onChange={handleTextInputChange}
                  multiline
                  rows={2}
                  sx={{ mb: 2, width: '100%' }}
                  disabled={isLoading}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Patients;