import React, { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Custom marker icons for different station statuses
const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const inactiveIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ChargingStationMap = ({ stations }) => {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  // Calculate center position based on stations or default to a central location
  const center = stations.length > 0
    ? [
        stations.reduce((sum, station) => sum + parseFloat(station.location.latitude), 0) / stations.length,
        stations.reduce((sum, station) => sum + parseFloat(station.location.longitude), 0) / stations.length
      ]
    : [20.5937, 78.9629]; // Default to center of India

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Charging Stations Map View
      </Typography>
      <Box sx={{ height: '400px', width: '100%' }}>
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: '100%', width: '100%', borderRadius: '4px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stations.map((station) => (
            <Marker
              key={station._id}
              position={[station.location.latitude, station.location.longitude]}
              icon={station.status === 'Active' ? activeIcon : inactiveIcon}
            >
              <Popup>
                <div>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {station.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: station.status === 'Active' ? 'success.main' : 'error.main' }}>
                    Status: {station.status}
                  </Typography>
                  <Typography variant="body2">
                    Power Output: {station.powerOutput} kW
                  </Typography>
                  <Typography variant="body2">
                    Connector: {station.connectorType}
                  </Typography>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Paper>
  );
};

export default ChargingStationMap; 