import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Button,
  TextField, Select, MenuItem, FormControl, InputLabel, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Alert, AppBar, Toolbar, CircularProgress, Snackbar
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon,
  Logout as LogoutIcon, Add as AddIcon
} from '@mui/icons-material';

import { getAllStations, createStation, updateStation, deleteStation } from '../../services/chargingStationApi';
import { useNavigate } from 'react-router-dom';
import ChargingStationMap from './ChargingStationMap';
import { useAuth } from '../../context/AuthContext';




const ChargingStationList = () => {
  const navigate = useNavigate();
  const { user, token, logout, userRole, userId } = useAuth();

  const [stations, setStations] = useState([]);
  const [filters, setFilters] = useState({ status: '', connectorType: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: { latitude: '', longitude: '' },
    status: 'Active',
    powerOutput: '',
    connectorType: '',
    slots: '',
  });

  // Debug logging to help troubleshoot role issues
  console.log('DEBUG - User object:', user);
  console.log('DEBUG - Token:', token ? 'present' : 'missing');
  console.log('DEBUG - AuthContext userRole:', userRole);
  console.log('DEBUG - User role from user object:', user?.role);
  console.log('DEBUG - Is user admin?', userRole === 'admin');
  console.log('DEBUG - Should show Add button?', user && userRole === 'admin');

  // mounted guard to avoid setting state after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // fetchStations (memoized)
  const fetchStations = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const data = await getAllStations(cleanFilters, token);
      if (isMountedRef.current) {
        // support both array and { data: [...] } shapes
        setStations(Array.isArray(data) ? data : (data?.data || []));
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to fetch stations';
      if (isMountedRef.current) setError(msg);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [filters, token]);

  // initial & filter-driven fetch
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // helper to clear toasts
  useEffect(() => {
    let t;
    if (success) {
      setOpenSnackbar(true);
      t = setTimeout(() => {
        if (isMountedRef.current) {
          setSuccess('');
          setOpenSnackbar(false);
        }
      }, 3000);
    }
    return () => clearTimeout(t);
  }, [success]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStationData = (stationData) => {
    const lat = stationData.location.latitude;
    const lng = stationData.location.longitude;
    const power = stationData.powerOutput;
    const slots = stationData.slots;

    if (!stationData.name?.trim()) return 'Station name is required.';
    if (!stationData.connectorType) return 'Connector Type is required.';
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) return 'Latitude must be a number between -90 and 90.';
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) return 'Longitude must be a number between -180 and 180.';
    if (!Number.isFinite(power) || power <= 0) return 'Power Output must be a positive number.';
    if (!Number.isInteger(slots) || slots < 1) return 'Slots must be an integer >= 1.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate and convert location data
    const lat = Number(formData.location.latitude);
    const lng = Number(formData.location.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid latitude or longitude values. Please enter valid numbers.');
      setLoading(false);
      return;
    }

    const stationData = {
      name: formData.name?.trim(),
      location: {
        latitude: lat,
        longitude: lng,
      },
      powerOutput: Number(formData.powerOutput),
      slots: parseInt(formData.slots, 10),
      connectorType: formData.connectorType,
      status: formData.status,
      createdBy: userId,
    };

    console.log('🔍 Frontend station data before validation:', stationData);

    const validationError = validateStationData(stationData);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      if (!token) {
        setError('Authentication required.');
        setLoading(false);
        return;
      }

      if (selectedStation) {
        // Fix the ID extraction - it was using _1d instead of _id
        const stationId = selectedStation._id || selectedStation.id;
        console.log('🔄 Updating station with ID:', stationId);
        console.log('📤 Sending station data:', stationData);
        await updateStation(stationId, stationData);
        if (isMountedRef.current) setSuccess('Station updated successfully!');
      } else {
        console.log('➕ Creating new station');
        console.log('📤 Sending station data:', stationData);
        await createStation(stationData);
        if (isMountedRef.current) setSuccess('Station created successfully!');
      }

      handleCloseDialog();
      fetchStations();
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      const msg = err?.response?.data?.error || err.message || 'Error saving station';
      if (isMountedRef.current) setError(msg);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this charging station?')) return;
    try {
      setLoading(true);
      await deleteStation(id);
      if (isMountedRef.current) setSuccess('Charging station deleted successfully!');
      fetchStations();
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Failed to delete station';
      if (isMountedRef.current) setError(msg);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const handleOpenDialog = (station = null) => {
    if (station) {
      setSelectedStation(station);
      
      // Extract location data from GeoJSON format or frontend format
      let latitude = '';
      let longitude = '';
      
      if (station.location) {
        if (station.location.coordinates && Array.isArray(station.location.coordinates)) {
          // GeoJSON format: [longitude, latitude]
          longitude = station.location.coordinates[0] || '';
          latitude = station.location.coordinates[1] || '';
        } else {
          // Frontend format: { latitude, longitude }
          latitude = station.location.latitude || '';
          longitude = station.location.longitude || '';
        }
      }
      
      setFormData({
        name: station.name ?? '',
        location: {
          latitude: latitude,
          longitude: longitude,
        },
        status: station.status ?? 'Active',
        powerOutput: station.powerOutput ?? '',
        connectorType: station.connectorType ?? '',
        slots: station.slots ?? '',
      });
    } else {
      setSelectedStation(null);
      setFormData({
        name: '',
        location: { latitude: '', longitude: '' },
        status: 'Active',
        powerOutput: '',
        connectorType: '',
        slots: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStation(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>EVION - A Perfect Vitamin C 💊 For Your EV</Typography>

          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="filter-status-label" sx={{ color: 'white' }}>Station Status</InputLabel>
            <Select
              labelId="filter-status-label"
              id="filter-status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Station Status"
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                '.MuiSvgIcon-root': { color: 'white' }
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="filter-connector-label" sx={{ color: 'white' }}>Charger Type</InputLabel>
            <Select
              labelId="filter-connector-label"
              id="filter-connector"
              name="connectorType"
              value={filters.connectorType}
              onChange={handleFilterChange}
              label="Charger Type"
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                '.MuiSvgIcon-root': { color: 'white' }
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Type 1">Type 1</MenuItem>
              <MenuItem value="Type 2">Type 2</MenuItem>
              <MenuItem value="CCS">CCS</MenuItem>
              <MenuItem value="CHAdeMO">CHAdeMO</MenuItem>
              <MenuItem value="Tesla">Tesla</MenuItem>
            </Select>
          </FormControl>

          {/* Only show Add for admins */}
          {user && userRole === 'admin' && (
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': { backgroundColor: '#f5f5f5' },
                mr: 2
              }}
            >
              Add New Station
            </Button>
          )}

          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <Grid container spacing={3}>
          {stations.length === 0 && !loading && (
            <Grid item xs={12}>
              <Typography>No charging stations found.</Typography>
            </Grid>
          )}

          {stations.map((station) => (
            <Grid key={station._id} item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{station.name}</Typography>
                  <Typography sx={{ color: station.status === 'Active' ? 'green' : 'red', fontWeight: 500 }}>
                    {station.status}
                  </Typography>
                  <Typography variant="body2">
                    Lat: {station.location?.latitude ?? 'N/A'}, Lng: {station.location?.longitude ?? 'N/A'}
                  </Typography>
                  <Typography variant="body2">Power: {station.powerOutput ?? 'N/A'} kW</Typography>
                  <Typography variant="body2">Connector: {station.connectorType ?? 'N/A'}</Typography>
                  <Typography variant="body2">Slots: {station.slots ?? 'N/A'}</Typography>
                </CardContent>
                {user && userRole === 'admin' && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton onClick={() => handleOpenDialog(station)} color="primary" aria-label={`edit-${station._id}`}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(station._id)} color="error" aria-label={`delete-${station._id}`}><DeleteIcon /></IconButton>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ my: 4 }}>
          <ChargingStationMap stations={stations} />
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedStation ? 'Edit Station' : 'Add New Station'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth name="name" label="Station Name" value={formData.name} onChange={handleInputChange} required />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name="location.latitude"
                    label="Latitude"
                    type="number"
                    inputProps={{ step: 'any' }}
                    value={formData.location.latitude}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    name="location.longitude"
                    label="Longitude"
                    type="number"
                    inputProps={{ step: 'any' }}
                    value={formData.location.longitude}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth name="powerOutput" label="Power Output (kW)" type="number" inputProps={{ min: 0 }} value={formData.powerOutput} onChange={handleInputChange} required />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth name="slots" label="Slots" type="number" inputProps={{ min: 1, step: 1 }} value={formData.slots} onChange={handleInputChange} required />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select labelId="status-label" name="status" value={formData.status} onChange={handleInputChange} required>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="connector-label">Connector Type</InputLabel>
                    <Select labelId="connector-label" name="connectorType" value={formData.connectorType} onChange={handleInputChange} required>
                      <MenuItem value="Type 1">Type 1</MenuItem>
                      <MenuItem value="Type 2">Type 2</MenuItem>
                      <MenuItem value="CCS">CCS</MenuItem>
                      <MenuItem value="CHAdeMO">CHAdeMO</MenuItem>
                      <MenuItem value="Tesla">Tesla</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Saving...' : selectedStation ? 'Update Station' : 'Add Station'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          message={success}
        />
      </Container>
    </>
  );
};

export default ChargingStationList;
