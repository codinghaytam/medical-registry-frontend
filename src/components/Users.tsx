import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Paper, IconButton, Menu, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, SelectChangeEvent, useTheme
} from '@mui/material';
import { Search, Plus, MoreVertical, Edit, Trash2, User } from 'lucide-react';
import { userService, UserData } from '../services/userService';

const Users: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
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

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewUser({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      role: '',
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setNewUser(prev => ({
      ...prev,
      role: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await userService.create(newUser);
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.delete(id);
      handleMenuClose();
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const filteredUsers = React.useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter(user => 
      user.firstName?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      user.lastName?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      user.email?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
      user.username?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
    );
  }, [users, searchQuery]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Users
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={18} />}
          sx={{ borderRadius: 2 }}
          onClick={handleOpenDialog}
        >
          Add New User
        </Button>
      </Box>

      {/* Search Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder="Search users..."
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

      {/* Users Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && Array.isArray(filteredUsers) && filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <User size={14} style={{ marginRight: 8 }} />
                        {`${user.firstName || ''} ${user.lastName || ''}`}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.roles?.join(', ') || 'No roles'}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.enabled ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(event) => handleMenuClick(event, parseInt(user.id))}
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
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Actions Menu */}
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
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={newUser.firstName}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={newUser.lastName}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={handleRoleChange}
                required
              >
                <MenuItem value="Dentist">Dentist</MenuItem>
                <MenuItem value="Assistant">Assistant</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
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

export default Users;