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
  Tooltip,
  Chip,
  Alert,
  Collapse
} from '@mui/material';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  Calendar,
  BarChart,
  FileImage,
  FilePlus,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { patientService } from '../services/patientService';
import { seanceService, SeanceData } from '../services/seanceService';
import { reevaluationService, ReevaluationData } from '../services/reevaluationService';
import { userService } from '../services/userService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getUserRole, canEdit, canOnlyView } from '../utiles/RoleAccess';
import RoleBasedAccess from '../utiles/RoleBasedAccess';

const Seances: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSeanceId, setSelectedSeanceId] = useState<string | null>(null);
  const [selectedReevaluationId, setSelectedReevaluationId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openReevaluationDialog, setOpenReevaluationDialog] = useState(false);
  const [newSeance, setNewSeance] = useState<SeanceData>({
    type: '',
    date: new Date(),
    patientId: '',
    medecinId: '',
  });
  const [newReevaluation, setNewReevaluation] = useState<Partial<ReevaluationData>>({
    indiceDePlaque: 0,
    indiceGingivale: 0,
    seanceId: '',
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [seances, setSeances] = useState<SeanceData[]>([]);
  const [reevaluations, setReevaluations] = useState<ReevaluationData[]>([]);
  const [medecins, setMedecins] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isReevaluationEditing, setIsReevaluationEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [seancesWithoutReevaluation, setSeancesWithoutReevaluation] = useState<SeanceData[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  
  // Get current user role
  const userRole = getUserRole();
  
  useEffect(() => {
    // Fetch seances when component mounts
    const fetchData = async () => {
      setIsLoading(true);
      setNetworkError(null);
      try {
        const [seancesData, patientsData, medecinsData, reevaluationsData] = await Promise.all([
          seanceService.getAll().catch(error => {
            console.error('Error fetching seances:', error);
            throw new Error('Failed to fetch séances');
          }),
          patientService.getAll().catch(error => {
            console.error('Error fetching patients:', error);
            throw new Error('Failed to fetch patients');
          }),
          userService.getMedecins().catch(error => {
            console.error('Error fetching medecins:', error);
            throw new Error('Failed to fetch médecins');
          }),
          reevaluationService.getAll().catch(error => {
            console.error('Error fetching reevaluations:', error);
            throw new Error('Failed to fetch réévaluations');
          })
        ]);
        
        // If user is MEDECIN, filter seances to only show their own
        let filteredSeances = seancesData || [];
        if (userRole === 'MEDECIN') {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const currentMedecinId = userData.user?.id;
          if (currentMedecinId) {
            filteredSeances = seancesData.filter(
              seance => seance.medecinId === currentMedecinId
            );
          }
        }
        
        setSeances(filteredSeances);
        setPatients(patientsData || []);
        setMedecins(medecinsData || []);
        setReevaluations(reevaluationsData || []);
        
        // Filter seances that don't have a reevaluation yet
        const reevaluationSeanceIds = reevaluationsData?.map(r => r.seanceId) || [];
        const availableSeances = filteredSeances.filter(s => !reevaluationSeanceIds.includes(s.id!));
        setSeancesWithoutReevaluation(availableSeances);
      } catch (error) {
        console.error('Error fetching data:', error);
        setNetworkError(error instanceof Error ? error.message : 'Network error occurred');
        // Still set empty arrays instead of failing completely
        if (!seances.length) setSeances([]);
        if (!patients.length) setPatients([]);
        if (!medecins.length) setMedecins([]);
        if (!reevaluations.length) setReevaluations([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userRole]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, id: string, isReevaluation: boolean = false) => {
    setAnchorEl(event.currentTarget);
    if (isReevaluation) {
      setSelectedReevaluationId(id);
      setSelectedSeanceId(null);
    } else {
      setSelectedSeanceId(id);
      setSelectedReevaluationId(null);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSeanceId(null);
    setSelectedReevaluationId(null);
  };

  const resetForm = (isReevaluation: boolean = false) => {
    if (isReevaluation) {
      setNewReevaluation({
        indiceDePlaque: 0,
        indiceGingivale: 0,
        seanceId: '',
      });
      setIsReevaluationEditing(false);
      setSelectedFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setNewSeance({
        type: '',
        date: new Date(),
        patientId: '',
        medecinId: '',
      });
      // Also reset reevaluation fields when resetting seance form
      setNewReevaluation({
        indiceDePlaque: 0,
        indiceGingivale: 0,
        seanceId: '',
      });
      setIsEditing(false);
      setSelectedFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Filter patients based on médecin profession
  const getFilteredPatients = () => {
    if (userRole !== 'MEDECIN' || !Array.isArray(patients)) {
      return patients; // Admin sees all patients
    }
    
    // Get current médecin's profession from localStorage
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        console.log('No user data found in localStorage');
        return patients;
      }
      
      const userData = JSON.parse(userString);
      // Check all possible locations for profession information
      const profession = userData.profession || 
                        (userData.user && userData.user.profession) ||
                        '';
      
      console.log('Filtering patients by profession:', profession);
      
      if (profession) {
        // Filter patients to match the médecin's profession (State field)
        return patients.filter(patient => patient.State === profession);
      }
    } catch (error) {
      console.error('Error filtering patients by profession:', error);
    }
    
    return patients;
  };

  const handleOpenDialog = (seance?: SeanceData) => {
    if (seance) {
      setNewSeance({
        ...seance,
        date: new Date(seance.date)
      });
      setIsEditing(true);
      
      // If this is a REEVALUATION type séance, also load its reevaluation data
      if (seance.type === 'REEVALUATION') {
        const existingReevaluation = getReevaluationForSeance(seance.id!);
        if (existingReevaluation) {
          setNewReevaluation({
            ...existingReevaluation,
            seanceId: existingReevaluation.seanceId
          });
        }
      }
    } else {
      resetForm();
      // If user is MEDECIN, force the medecinId to be the current user's ID
      if (userRole === 'MEDECIN') {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const currentMedecinId = userData.user?.id;
        if (currentMedecinId) {
          setNewSeance(prev => ({
            ...prev,
            medecinId: currentMedecinId
          }));
        }
      }
    }
    setOpenDialog(true);
  };

  const handleOpenReevaluationDialog = (reevaluation?: ReevaluationData) => {
    if (reevaluation) {
      setNewReevaluation({
        ...reevaluation,
        seanceId: reevaluation.seanceId
      });
      setIsReevaluationEditing(true);
    } else {
      resetForm(true);
    }
    setOpenReevaluationDialog(true);
  };

  const handleAddReevaluationForSeance = (seanceId: string) => {
    // Reset form state properly before setting new values
    resetForm(true);
    
    // Set the reevaluation values with the selected seance
    setNewReevaluation({
      indiceDePlaque: 0,
      indiceGingivale: 0,
      seanceId: seanceId,
    });
    
    setIsReevaluationEditing(false);
    setOpenReevaluationDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleCloseReevaluationDialog = () => {
    setOpenReevaluationDialog(false);
    resetForm(true);
  };

  const handleInputChange = (event: SelectChangeEvent<string>) => {
    const name = event.target.name as keyof SeanceData;
    const value = event.target.value;
    
    if (name === 'medecinId') {
      // Reset type when medecinId changes to ensure proper filtering
      setNewSeance(prev => ({
        ...prev,
        [name]: value,
        type: '' // Reset the type selection when medecin changes
      }));
    } else {
      setNewSeance(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleReevaluationInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const name = event.target.name as keyof ReevaluationData;
    const value = event.target.value;
    setNewReevaluation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReevaluationNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setNewReevaluation(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const validateFileUpload = (type: string): boolean => {
    // Check if a file is required but not provided
    if (type === 'REEVALUATION' && !selectedFile && !isEditing) {
      setError('Image file is required for reevaluation séances');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Validate file upload for REEVALUATION type
    if (!validateFileUpload(newSeance.type)) {
      setIsLoading(false);
      return;
    }
    
    // If user is MEDECIN, force the medecinId to be the current user's ID
    if (userRole === 'MEDECIN') {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const currentMedecinId = userData.user?.id;
      if (currentMedecinId) {
        newSeance.medecinId = currentMedecinId;
      }
    }
    
    try {
      let createdSeanceId: string | undefined;
      
      // First, save the seance
      if (isEditing && selectedSeanceId) {
        // For REEVALUATION type, prepare the reevaluation data to be included
        if (newSeance.type === 'REEVALUATION') {
          // Update the seance with the Reevaluation data
          const updatedSeance = await seanceService.update(selectedSeanceId, {
            ...newSeance,
            Reevaluation: newReevaluation as ReevaluationData
          }).catch(error => {
            console.error('Error updating seance with reevaluation:', error);
            throw new Error('Failed to update séance. Please try again later.');
          });
          
          if (updatedSeance?.id) {
            createdSeanceId = updatedSeance.id;
          }
        } else {
          // For non-REEVALUATION types, just update the seance
          const updatedSeance = await seanceService.update(selectedSeanceId, newSeance)
            .catch(error => {
              console.error('Error updating seance:', error);
              throw new Error('Failed to update séance. Please try again later.');
            });
          
          if (updatedSeance?.id) {
            createdSeanceId = updatedSeance.id;
          }
        }
      } else {
        // Creating a new seance
        if (newSeance.type === 'REEVALUATION') {
          // For REEVALUATION type, include reevaluation data in the creation process
          const createdSeance = await seanceService.create({
            ...newSeance,
            Reevaluation: newReevaluation as ReevaluationData
          }).catch(error => {
            console.error('Error creating seance with reevaluation:', error);
            throw new Error('Failed to create new séance. Please try again later.');
          });
          
          createdSeanceId = createdSeance?.id;
        } else {
          // For non-REEVALUATION types, just create the seance
          const createdSeance = await seanceService.create(newSeance)
            .catch(error => {
              console.error('Error creating seance:', error);
              throw new Error('Failed to create new séance. Please try again later.');
            });
          
          createdSeanceId = createdSeance?.id;
        }
      }
      
      handleCloseDialog();
      
      // Refresh data with error handling
      try {
        const [updatedSeances, updatedReevaluations] = await Promise.all([
          seanceService.getAll().catch(e => {
            console.error('Error refreshing seances:', e);
            return seances; // Fall back to existing data
          }),
          reevaluationService.getAll().catch(e => {
            console.error('Error refreshing reevaluations:', e);
            return reevaluations; // Fall back to existing data
          })
        ]);
        
        // If user is MEDECIN, filter seances again
        let filteredSeances = updatedSeances;
        if (userRole === 'MEDECIN') {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const currentMedecinId = userData.user?.id;
          if (currentMedecinId) {
            filteredSeances = updatedSeances.filter(
              seance => seance.medecinId === currentMedecinId
            );
          }
        }
        
        setSeances(filteredSeances);
        setReevaluations(updatedReevaluations);
        
        // Update seances without reevaluations
        const reevaluationSeanceIds = updatedReevaluations.map(r => r.seanceId);
        const availableSeances = filteredSeances.filter(s => !reevaluationSeanceIds.includes(s.id!));
        setSeancesWithoutReevaluation(availableSeances);
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
        // Don't block the UX flow on refresh errors
      }
    } catch (error: any) {
      console.error('Error saving seance:', error);
      // Set error message for display
      if (error.response) {
        try {
          const errorData = await error.response.json().catch(() => null);
          setError(errorData?.error || error.message || "Une erreur s'est produite lors de l'enregistrement de la séance");
        } catch (e) {
          setError(error.message || "Une erreur s'est produite lors de l'enregistrement de la séance");
        }
      } else {
        setError(error.message || "Une erreur s'est produite lors de l'enregistrement de la séance");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReevaluationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Validate file upload for new reevaluations
    if (!isReevaluationEditing && !selectedFile) {
      setError('Image file is required for reevaluation séances');
      setIsLoading(false);
      return;
    }
    
    try {
      const formData = new FormData();
      
      // Get the seance data to extract patient and medecin IDs
      const selectedSeance = seances.find(s => s.id === newReevaluation.seanceId);
      
      if (!selectedSeance) {
        throw new Error('Séance not found');
      }
      
      // Add required fields in the correct format for the backend
      formData.append('indiceDePlaque', (newReevaluation.indiceDePlaque || 0).toString());
      formData.append('indiceGingivale', (newReevaluation.indiceGingivale || 0).toString());
      formData.append('patientId', selectedSeance.patientId);
      formData.append('medecinId', selectedSeance.medecinId);
      formData.append('date', new Date(selectedSeance.date).toISOString());
      formData.append('seanceId', newReevaluation.seanceId || '');
      
      // Attach the image file if provided
      if (selectedFile) {
        formData.append('sondagePhoto', selectedFile);
      }
      
      if (isReevaluationEditing && selectedReevaluationId) {
        await reevaluationService.update(selectedReevaluationId, formData)
          .catch(error => {
            console.error('Error updating reevaluation:', error);
            throw new Error('Failed to update réévaluation. Please try again later.');
          });
      } else {
        await reevaluationService.create(formData)
          .catch(error => {
            console.error('Error creating reevaluation:', error);
            throw new Error('Failed to create new réévaluation. Please try again later.');
          });
      }
      
      handleCloseReevaluationDialog();
      
      // Refresh data with error handling
      try {
        const [updatedSeances, updatedReevaluations] = await Promise.all([
          seanceService.getAll().catch(e => {
            console.error('Error refreshing seances:', e);
            return seances; // Fall back to existing data
          }),
          reevaluationService.getAll().catch(e => {
            console.error('Error refreshing reevaluations:', e);
            return reevaluations; // Fall back to existing data
          })
        ]);
        
        // If user is MEDECIN, filter seances again
        let filteredSeances = updatedSeances;
        if (userRole === 'MEDECIN') {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const currentMedecinId = userData.user?.id;
          if (currentMedecinId) {
            filteredSeances = updatedSeances.filter(
              seance => seance.medecinId === currentMedecinId
            );
          }
        }
        
        setSeances(filteredSeances);
        setReevaluations(updatedReevaluations);
        
        // Update seances without reevaluations
        const reevaluationSeanceIds = updatedReevaluations.map(r => r.seanceId);
        const availableSeances = filteredSeances.filter(s => !reevaluationSeanceIds.includes(s.id!));
        setSeancesWithoutReevaluation(availableSeances);
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
        // Don't block the UX flow on refresh errors
      }
    } catch (error: any) {
      console.error('Error saving reevaluation:', error);
      // Set error message for display
      if (error.response) {
        try {
          const errorData = await error.response.json().catch(() => null);
          setError(errorData?.error || error.message || "Une erreur s'est produite lors de l'enregistrement de la réévaluation");
        } catch (e) {
          setError(error.message || "Une erreur s'est produite lors de l'enregistrement de la réévaluation");
        }
      } else {
        setError(error.message || "Une erreur s'est produite lors de l'enregistrement de la réévaluation");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Only ADMIN or MEDECIN (for their own) can delete
    if (!canEdit()) {
      handleMenuClose();
      return;
    }
    
    setIsLoading(true);
    try {
      // Find the seance to get its type
      const seanceToDelete = seances.find(s => s.id === id);
      
      // Pass the seance type to use the correct endpoint
      await seanceService.delete(id, seanceToDelete?.type)
        .catch(error => {
          console.error('Error deleting seance:', error);
          throw new Error('Failed to delete séance. Please try again later.');
        });
      handleMenuClose();
      
      // Refresh data with error handling
      try {
        const [updatedSeances, updatedReevaluations] = await Promise.all([
          seanceService.getAll().catch(e => {
            console.error('Error refreshing seances:', e);
            return seances; // Fall back to existing data
          }),
          reevaluationService.getAll().catch(e => {
            console.error('Error refreshing reevaluations:', e);
            return reevaluations; // Fall back to existing data
          })
        ]);
        
        // If user is MEDECIN, filter seances again
        let filteredSeances = updatedSeances;
        if (userRole === 'MEDECIN') {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const currentMedecinId = userData.user?.id;
          if (currentMedecinId) {
            filteredSeances = updatedSeances.filter(
              seance => seance.medecinId === currentMedecinId
            );
          }
        }
        
        setSeances(filteredSeances);
        setReevaluations(updatedReevaluations);
        
        // Update seances without reevaluations
        const reevaluationSeanceIds = updatedReevaluations.map(r => r.seanceId);
        const availableSeances = filteredSeances.filter(s => !reevaluationSeanceIds.includes(s.id!));
        setSeancesWithoutReevaluation(availableSeances);
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
        setNetworkError('Error refreshing data after delete.');
      }
    } catch (error: any) {
      console.error('Error deleting seance:', error);
      setNetworkError(error.message || "Failed to delete séance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReevaluationDelete = async (id: string) => {
    // Only ADMIN or MEDECIN (for their own) can delete
    if (!canEdit()) {
      handleMenuClose();
      return;
    }
    
    setIsLoading(true);
    try {
      await reevaluationService.delete(id).catch(error => {
        console.error('Error deleting reevaluation:', error);
        throw new Error('Failed to delete réévaluation. Please try again later.');
      });
      handleMenuClose();
      
      // Refresh data with error handling
      try {
        const [updatedSeances, updatedReevaluations] = await Promise.all([
          seanceService.getAll().catch(e => {
            console.error('Error refreshing seances:', e);
            return seances; // Fall back to existing data
          }),
          reevaluationService.getAll().catch(e => {
            console.error('Error refreshing reevaluations:', e);
            return reevaluations; // Fall back to existing data
          })
        ]);
        
        // If user is MEDECIN, filter seances again
        let filteredSeances = updatedSeances;
        if (userRole === 'MEDECIN') {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const currentMedecinId = userData.user?.id;
          if (currentMedecinId) {
            filteredSeances = updatedSeances.filter(
              seance => seance.medecinId === currentMedecinId
            );
          }
        }
        
        setSeances(filteredSeances);
        setReevaluations(updatedReevaluations);
        
        // Update seances without reevaluations
        const reevaluationSeanceIds = updatedReevaluations.map(r => r.seanceId);
        const availableSeances = filteredSeances.filter(s => !reevaluationSeanceIds.includes(s.id!));
        setSeancesWithoutReevaluation(availableSeances);
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
        setNetworkError('Error refreshing data after delete.');
      }
    } catch (error: any) {
      console.error('Error deleting reevaluation:', error);
      setNetworkError(error.message || "Failed to delete réévaluation");
    } finally {
      setIsLoading(false);
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

  // Filter seance types based on medecin profession
  const getFilteredSeanceTypes = (medecinId: string) => {
    if (!medecinId || !Array.isArray(medecins)) return [];
    
    const selectedMedecin = medecins.find(medecin => medecin.id === medecinId);
    if (!selectedMedecin) {return ['DETARTRAGE', 'SURFACAGE', 'REEVALUATION','ACTIVATION', 'RECOLLAGE'];}
    
    if (selectedMedecin.profession === 'PARODONTAIRE') {
      return ['DETARTRAGE', 'SURFACAGE', 'REEVALUATION'];
    } else if (selectedMedecin.profession === 'ORTHODONTAIRE') {
      return ['ACTIVATION', 'RECOLLAGE'];
    }
    
    return [];
  };

  // Check if a seance has a reevaluation
  const hasReevaluation = (seanceId: string) => {
    return reevaluations.some(r => r.seanceId === seanceId);
  };

  // Find reevaluation for a seance
  const getReevaluationForSeance = (seanceId: string) => {
    return reevaluations.find(r => r.seanceId === seanceId);
  };

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
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Séances
        </Typography>
        
        {/* Only ADMIN and MEDECIN can add new seances */}
        <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
          <Button 
            variant="contained" 
            startIcon={<Plus size={18} />}
            sx={{ borderRadius: 2 }}
            onClick={() => handleOpenDialog()}
            disabled={isLoading}
          >
            Add New Séance
          </Button>
        </RoleBasedAccess>
      </Box>
      
      {/* Role-specific message banner */}
      {userRole === 'ETUDIANT' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have view-only access to séances.
        </Alert>
      )}
      {userRole === 'MEDECIN' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You can view, create, and modify your own séances only.
        </Alert>
      )}

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
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Médecin</TableCell>
                <TableCell>Réévaluation</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {isLoading && filteredSeances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading séances...
                  </TableCell>
                </TableRow>
              ) : filteredSeances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      {networkError ? "Couldn't load séances due to a network error" : "No séances found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSeances
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((seance) => (
                    <TableRow
                      key={seance.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
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
                        {seance.medecin?.user? 
                          `${seance.medecin.user.name}` : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        {hasReevaluation(seance.id!) ? (
                          <Chip 
                            label="Réévaluation" 
                            color="success" 
                            size="small"
                            onClick={() => {
                              const reevaluation = getReevaluationForSeance(seance.id!);
                              if (reevaluation) {
                                handleOpenReevaluationDialog(reevaluation);
                              }
                            }}
                          />
                        ) : (
                          <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
                            <Tooltip title={seance.type === 'REEVALUATION' ? "Ajouter une réévaluation" : "Réévaluation disponible uniquement pour type REEVALUATION"}>
                              <span>
                                <IconButton 
                                  color="primary" 
                                  size="small"
                                  onClick={() => handleAddReevaluationForSeance(seance.id!)}
                                  disabled={
                                    isLoading || 
                                    seance.type !== 'REEVALUATION' || 
                                    (userRole === 'MEDECIN' && seance.medecinId !== (function() {
                                      const userData = JSON.parse(localStorage.getItem('user') || '{}');
                                      return userData.user?.id;
                                    })())
                                  }
                                >
                                  <FilePlus size={16} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </RoleBasedAccess>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {canOnlyView() ? (
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Eye size={18} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <IconButton 
                            size="small" 
                            onClick={(event) => handleMenuClick(event, seance.id!)}
                            disabled={isLoading || (userRole === 'MEDECIN' && seance.medecinId !== (function() {
                                  const userData = JSON.parse(localStorage.getItem('user') || '{}');
                                  return userData.user?.id;
                                })())}
                          >
                            <MoreVertical size={18} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSeances.length}
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
          {selectedSeanceId && (
            <>
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
            </>
          )}
          
          {selectedReevaluationId && (
            <>
              <MenuItem onClick={() => {
                const reevaluation = reevaluations.find(r => r.id === selectedReevaluationId);
                if (reevaluation) {
                  handleOpenReevaluationDialog(reevaluation);
                }
                handleMenuClose();
              }}>
                <Edit size={16} style={{ marginRight: 8 }} />
                Edit
              </MenuItem>
              <MenuItem onClick={() => selectedReevaluationId && handleReevaluationDelete(selectedReevaluationId)} sx={{ color: 'error.main' }}>
                <Trash2 size={16} style={{ marginRight: 8 }} />
                Delete
              </MenuItem>
            </>
          )}
        </Menu>
      </RoleBasedAccess>

      {/* Only ADMIN or MEDECIN can add/edit séances */}
      <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
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
                  disabled={isLoading}
                />
              </LocalizationProvider>

              {/* Médecin selection field - always visible for all users */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Médecin</InputLabel>
                
                <Select
                  label="Médecin"
                  name="medecinId"
                  value={newSeance.medecinId || ""}
                  onChange={handleInputChange}
                  required
                >
                  {Array.isArray(medecins) && medecins.length > 0 ? (
                    medecins.map((medecin) => (
                      <MenuItem key={medecin.id} value={medecin.id}>
                        {medecin.userInfo ? 
                          `${medecin.userInfo.firstName} ${medecin.userInfo.lastName}` : 
                          (medecin.user && medecin.user.name) ? medecin.user.name : 'Unknown'} 
                        - {medecin.profession}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">No médecins available</MenuItem>
                  )}
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
                  disabled={!newSeance.medecinId || isLoading}
                >
                  {newSeance.medecinId && Array.isArray(medecins) && medecins.length > 0 ? (
                    getFilteredSeanceTypes(newSeance.medecinId).map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">Sélectionnez d'abord un médecin</MenuItem>
                  )}
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
                  disabled={isLoading}
                >
                  {Array.isArray(getFilteredPatients()) && getFilteredPatients().length > 0 ? (
                    getFilteredPatients().map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.nom} {patient.prenom}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">No patients available</MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Reevaluation Fields - Only show when type is REEVALUATION */}
              <Collapse in={newSeance.type === 'REEVALUATION'}>
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Détails de Réévaluation
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Indice de Plaque"
                    name="indiceDePlaque"
                    type="number"
                    value={newReevaluation.indiceDePlaque}
                    onChange={handleReevaluationNumberChange}
                    required={newSeance.type === 'REEVALUATION'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BarChart size={16} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                    inputProps={{ step: "0.1", min: "0", max: "3" }}
                  />

                  <TextField
                    fullWidth
                    label="Indice Gingivale"
                    name="indiceGingivale"
                    type="number"
                    value={newReevaluation.indiceGingivale}
                    onChange={handleReevaluationNumberChange}
                    required={newSeance.type === 'REEVALUATION'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BarChart size={16} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                    inputProps={{ step: "0.1", min: "0", max: "3" }}
                  />

                  <Box sx={{ mb: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="sondage-photo-upload"
                      type="file"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    <label htmlFor="sondage-photo-upload">
                      <Button 
                        variant="outlined" 
                        component="span"
                        startIcon={<FileImage size={16} />}
                      >
                        {isReevaluationEditing ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                    </label>
                    {selectedFile && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Selected file: {selectedFile.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Collapse>
              
              {/* Show error message if present */}
              {error && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'error.light', 
                  color: 'error.dark',
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}>
                  {error}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} disabled={isLoading}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </RoleBasedAccess>

      {/* Reevaluation Dialog */}
      <RoleBasedAccess requiredRoles={['ADMIN', 'MEDECIN']}>
        <Dialog open={openReevaluationDialog} onClose={handleCloseReevaluationDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{isReevaluationEditing ? 'Edit Réévaluation' : 'Add New Réévaluation'}</DialogTitle>
          <form onSubmit={handleReevaluationSubmit}>
            <DialogContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Séance</InputLabel>
                <Select
                  label="Séance"
                  name="seanceId"
                  value={newReevaluation.seanceId}
                  onChange={handleReevaluationInputChange}
                  required
                  disabled={isReevaluationEditing}
                >
                  {isReevaluationEditing ? (
                    // When editing, show only the associated seance
                    (() => {
                      const seance = seances.find(s => s.id === newReevaluation.seanceId);
                      return seance ? (
                        <MenuItem key={seance.id} value={seance.id}>
                          {format(new Date(seance.date), 'dd/MM/yyyy')} - {seance.type} - 
                          {seance.patient ? ` ${seance.patient.nom} ${seance.patient.prenom}` : ' N/A'}
                        </MenuItem>
                      ) : null;
                    })()
                  ) : (
                    // When creating, show all seances without reevaluations
                    // For MEDECIN, only show their own seances
                    seancesWithoutReevaluation
                      .filter(s => userRole !== 'MEDECIN' || s.medecinId === (function() {
                                      const userData = JSON.parse(localStorage.getItem('user') || '{}');
                                      return userData.user?.id;
                                    })())
                      .map(seance => (
                        <MenuItem key={seance.id} value={seance.id}>
                          {format(new Date(seance.date), 'dd/MM/yyyy')} - {seance.type} - 
                          {seance.patient ? ` ${seance.patient.nom} ${seance.patient.prenom}` : ' N/A'}
                        </MenuItem>
                      ))
                  )}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Indice de Plaque"
                name="indiceDePlaque"
                type="number"
                value={newReevaluation.indiceDePlaque}
                onChange={handleReevaluationNumberChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BarChart size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                inputProps={{ step: "0.1", min: "0", max: "3" }}
              />

              <TextField
                fullWidth
                label="Indice Gingivale"
                name="indiceGingivale"
                type="number"
                value={newReevaluation.indiceGingivale}
                onChange={handleReevaluationNumberChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BarChart size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                inputProps={{ step: "0.1", min: "0", max: "3" }}
              />

              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="reevaluation-photo-upload"
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <label htmlFor="reevaluation-photo-upload">
                  <Button 
                    variant="outlined" 
                    component="span"
                    startIcon={<FileImage size={16} />}
                  >
                    {isReevaluationEditing ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {selectedFile.name}
                  </Typography>
                )}
              </Box>
              
              {/* Show error message if present */}
              {error && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'error.light', 
                  color: 'error.dark',
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}>
                  {error}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseReevaluationDialog} disabled={isLoading}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </RoleBasedAccess>
    </Box>
  );
};

export default Seances;
