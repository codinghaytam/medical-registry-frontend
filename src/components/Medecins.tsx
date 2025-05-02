import React, { useEffect, useState } from 'react';
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
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  User,
} from 'lucide-react';
import { medecinService, MedecinData, CreateMedecinData } from '../services/medecinService';

const Medecins: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMedecinId, setSelectedMedecinId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [medecins, setMedecins] = useState<MedecinData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMedecin, setNewMedecin] = useState<CreateMedecinData & { firstName?: string; surname?: string }>({
    username: '',
    email: '',
    name: '',
    firstName: '',
    surname: '',
    profession: 'PARODENTAIRE',
    isSpecialiste: false,
    pwd:''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedecins = async () => {
    try {
      const data = await medecinService.getAll();
      setMedecins(data);
    } catch (error) {
      console.error('Error fetching medecins:', error);
    }
  };

  useEffect(() => {
    fetchMedecins();
  }, []);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedMedecinId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMedecinId(null);
  };

  const handleOpenDialog = (medecin?: MedecinData) => {
    if (medecin) {
      // Split name into firstName and surname if available
      const fullName = medecin.user?.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const surname = nameParts.slice(1).join(' ') || '';
      
      setNewMedecin({
        username: medecin.user?.username || '',
        email: medecin.user?.email || '',
        name: fullName,
        firstName: firstName,
        surname: surname,
        profession: medecin.profession,
        isSpecialiste: medecin.isSpecialiste,
        pwd: medecin.pwd
      });
      setIsEditing(true);
      setSelectedMedecinId(medecin.id);
    } else {
      setNewMedecin({
        username: '',
        email: '',
        name: '',
        firstName: '',
        surname: '',
        profession: 'PARODENTAIRE',
        isSpecialiste: false,
        pwd:''
      });
      setIsEditing(false);
      setSelectedMedecinId(null);
    }
    setOpenDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
    // Update the specific field that changed
    setNewMedecin(prev => ({ ...prev, [name]: value }));
    
    // If firstName or surname changed, update the username and name fields
    if (name === 'firstName' || name === 'surname') {
      setNewMedecin(prev => {
        const firstName = name === 'firstName' ? value : prev.firstName || '';
        const surname = name === 'surname' ? value : prev.surname || '';
        
        // Only generate username/name if both fields have values
        if (firstName && surname) {
          const generatedUsername = `${firstName} ${surname}`;
          return {
            ...prev,
            username: generatedUsername,
            name: generatedUsername
          };
        }
        return prev;
      });
    }
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setNewMedecin(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMedecin(prev => ({ ...prev, isSpecialiste: event.target.checked }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditing && selectedMedecinId) {
        await medecinService.update(selectedMedecinId, newMedecin);
      } else {
        await medecinService.create(newMedecin);
      }
      handleCloseDialog();
      fetchMedecins();
    } catch (error) {
      console.error('Failed to save medecin:', error);
      setError(error instanceof Error ? error.message : 'Failed to save doctor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await medecinService.delete(id);
      handleMenuClose();
      fetchMedecins();
    } catch (error) {
      console.error('Failed to delete medecin:', error);
    }
  };

  const filteredMedecins = React.useMemo(() => {
    if (!Array.isArray(medecins)) return [];
    return medecins.filter(medecin => 
      medecin.user?.username?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      medecin.user?.email?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      medecin.profession.toLowerCase().includes(searchQuery?.toLowerCase() || '')
    );
  }, [medecins, searchQuery]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Médecins
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          sx={{ borderRadius: 2 }}
          onClick={() => handleOpenDialog()}
        >
          Add New Doctor
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search doctors..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Profession</TableCell>
                <TableCell>Specialist</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(filteredMedecins) && filteredMedecins
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((medecin) => (
                  <TableRow
                    key={medecin.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell>
                      <User size={14} style={{ marginRight: 8 }} />
                    </TableCell>
                    <TableCell>{medecin.user?.username}</TableCell>
                    <TableCell>{medecin.user?.email}</TableCell>
                    <TableCell>{medecin.user?.name}</TableCell>
                    <TableCell>{medecin.user?.role}</TableCell>
                    <TableCell>{medecin.profession}</TableCell>
                    <TableCell>{medecin.isSpecialiste ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuClick(event, medecin.id)}
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
          count={filteredMedecins.length}
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
          const medecin = medecins.find(m => m.id === selectedMedecinId);
          if (medecin) {
            handleOpenDialog(medecin);
          }
          handleMenuClose();
        }}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => selectedMedecinId && handleDelete(selectedMedecinId)}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              size="small"
              label="First Name"
              name="firstName"
              value={newMedecin.firstName || ''}
              onChange={handleTextInputChange}
              required
              disabled={isEditing || isSubmitting}
              sx={{ mb: 2, width: '100%' }}
            />
            <TextField
              size="small"
              label="Surname"
              name="surname"
              value={newMedecin.surname || ''}
              onChange={handleTextInputChange}
              required
              disabled={isEditing || isSubmitting}
              sx={{ mb: 2, width: '100%' }}
            />
            <TextField
              size="small"
              label="Email"
              name="email"
              type="email"
              value={newMedecin.email}
              onChange={handleTextInputChange}
              required
              disabled={isEditing || isSubmitting}
              sx={{ mb: 2, width: '100%' }}
            />
             <TextField
              size="small"
              label="password"
              name="pwd"
              type="password"
              value={newMedecin.pwd}
              onChange={handleTextInputChange}
              required
              disabled={isEditing || isSubmitting}
              sx={{ mb: 2, width: '100%' }}
            />
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel>Profession</InputLabel>
              <Select
                name="profession"
                value={newMedecin.profession}
                onChange={handleSelectChange}
                label="Profession"
                disabled={isSubmitting}
              >
                <MenuItem value="PARODENTAIRE">Parodentaire</MenuItem>
                <MenuItem value="ORTHODONTAIRE">Orthodentaire</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={newMedecin.isSpecialiste}
                  onChange={handleSwitchChange}
                  name="isSpecialiste"
                  disabled={isSubmitting}
                />
              }
              label="Is Specialist"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Medecins;