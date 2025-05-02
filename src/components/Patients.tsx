import React, { useEffect, useState } from 'react';
import useInterval from '../utiles/useInterval'
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

const Patients: React.FC = () => {
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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, userId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleRowClick = (rowId: number) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
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
    try {
      await patientService.create(newPatient);
      handleCloseDialog();
      // Refresh patients list after successful creation
      fetchPatients();
    } catch (error) {
      console.error('Failed to create patient:', error);
      // Add error handling UI here
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await patientService.delete(id);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete patient:', error);
      // Add error handling UI here
    }
  };

  // Function to fetch patients data
  const fetchPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  },[]);
  

  useEffect(() => {
    fetch('http://localhost:3000/enum/motif-consultation')
      .then((response) => response.json())
      .then((data) => {
        setMotifs(data);
      })
      .catch((error) => {
        console.error('Error fetching motifs:', error);
      });

    fetch('http://localhost:3000/enum/type-mastication')
      .then((response) => response.json())
      .then((data) => {
        setTypeMastications(data);
      })
      .catch((error) => {
        console.error('Error fetching type mastications:', error);
      });

    fetch('http://localhost:3000/enum/hygiene-bucco-dentaire')
      .then((response) => response.json())
      .then((data) => {
        setHygienes(data);
      })
      .catch((error) => {
        console.error('Error fetching hygienes:', error);
      });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Patients
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />}
          sx={{ borderRadius: 2 }}
          onClick={handleOpenDialog}
        >
          Add New Patient
        </Button>
      </Box>

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
              <IconButton onClick={fetchPatients} size="small">
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((patient) => (
                  <React.Fragment key={patient.id}>
                    <TableRow
                      onClick={() => handleRowClick(patient.id)}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell>
                        <User size={14} style={{ marginRight: 8 }} />
                      </TableCell>
                      <TableCell>{patient.id}</TableCell>
                      <TableCell>{patient.nom}</TableCell>
                      <TableCell>{patient.prenom}</TableCell>
                      <TableCell>{patient.numeroDeDossier}</TableCell>
                      <TableCell>{patient.adresse}</TableCell>
                      <TableCell>{patient.tel}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMenuClick(event, patient.id);
                          }}
                        >
                          <MoreVertical size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {expandedRow === patient.id && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Table size="small" sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                            <TableBody>
                              <TableRow>
                                <TableCell><strong>Motif de Consultation:</strong></TableCell>
                                <TableCell>{patient.motifDeConsultation}</TableCell>
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
                                <TableCell>{patient.typeMastication}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Hygiène Bucco-Dentaire:</strong></TableCell>
                                <TableCell>{patient.hygieneBuccoDentaire}</TableCell>
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
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={patients.length}
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
        <MenuItem onClick={handleMenuClose}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedUserId && handleDelete(selectedUserId.toString())} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Patient</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
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
                />
                <TextField
                  size="small"
                  label="Prénom"
                  name="prenom"
                  value={newPatient.prenom}
                  onChange={handleTextInputChange}
                  required
                  sx={{ mb: 2, width: '100%' }}
                />
                <TextField
                  size="small"
                  label="Numéro de Dossier"
                  name="numeroDeDossier"
                  value={newPatient.numeroDeDossier}
                  onChange={handleTextInputChange}
                  required
                  sx={{ mb: 2, width: '100%' }}
                />
                <TextField
                  size="small"
                  label="Adresse"
                  name="adresse"
                  value={newPatient.adresse}
                  onChange={handleTextInputChange}
                  sx={{ mb: 2, width: '100%' }}
                />
                <TextField
                  size="small"
                  label="Téléphone"
                  name="tel"
                  value={newPatient.tel}
                  onChange={handleTextInputChange}
                  sx={{ mb: 2, width: '100%' }}
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
                  >
                    {Array.isArray(Motifs) && Motifs.map((motif: string) => (
                      <MenuItem key={motif} value={motif}>
                        {motif.toLowerCase().replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Type de Mastication</InputLabel>
                  <Select
                    name="typeMastication"
                    value={newPatient.typeMastication}
                    onChange={handleSelectChange}
                    label="Type de Mastication"
                  >
                    {Array.isArray(typeMastications) && typeMastications.map((type: string) => (
                      <MenuItem key={type} value={type}>
                        {type.toLowerCase().replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Hygiène Bucco-Dentaire</InputLabel>
                  <Select
                    name="hygieneBuccoDentaire"
                    value={newPatient.hygieneBuccoDentaire}
                    onChange={handleSelectChange}
                    label="Hygiène Bucco-Dentaire"
                  >
                    {Array.isArray(hygienes) && hygienes.map((hygiene: string) => (
                      <MenuItem key={hygiene} value={hygiene}>
                        {hygiene.toLowerCase().replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="Anamnèse Générale"
                  name="anameseGenerale"
                  value={newPatient.anameseGenerale}
                  onChange={handleTextInputChange}
                  multiline
                  rows={2}
                  sx={{ mb: 2, width: '100%' }}
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
                />
                
              </Box>
            </Box>
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

export default Patients;