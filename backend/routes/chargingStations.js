const express = require('express');
const router = express.Router();
const ChargingStation = require('../models/ChargingStation');
const auth = require('../middleware/auth'); // Decodes JWT and sets req.user

// --- GET ALL CHARGING STATIONS ---
router.get('/', auth, async (req, res) => {
  try {
    const { status, connectorType } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (connectorType) filter.connectorType = connectorType;
    
    const stations = await ChargingStation.find(filter).populate('createdBy', 'name email');
    
    // Convert GeoJSON format back to frontend format
    const convertedStations = stations.map(station => {
      const stationObj = station.toObject();
      if (stationObj.location && stationObj.location.coordinates) {
        stationObj.location = {
          latitude: stationObj.location.coordinates[1],
          longitude: stationObj.location.coordinates[0]
        };
      }
      return stationObj;
    });
    
    res.json(convertedStations);
  } catch (error) {
    console.error('❌ Error fetching charging stations:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- GET SINGLE CHARGING STATION ---
router.get('/:id', auth, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id).populate('createdBy', 'name email');
    if (!station) {
      return res.status(404).json({ error: 'Charging station not found' });
    }
    res.json(station);
  } catch (error) {
    console.error('❌ Error fetching charging station:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- CREATE CHARGING STATION ---
// Only authenticated users (optionally restrict to admins) can create a station
router.post('/', auth, async (req, res) => {
  try {
    console.log('📥 Charging Station Data:', req.body);
    console.log('👤 Authenticated User:', req.user);

    // Optional: Restrict to admin only
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Access denied: Admins only' });
    // }

    // Convert frontend location format to GeoJSON format
    const stationData = { ...req.body };
    if (stationData.location && stationData.location.latitude && stationData.location.longitude) {
      stationData.location = {
        type: 'Point',
        coordinates: [stationData.location.longitude, stationData.location.latitude]
      };
    }

    const newStation = new ChargingStation({
      ...stationData,
      createdBy: req.user._id,
    });

    const savedStation = await newStation.save();
    res.status(201).json(savedStation);
  } catch (error) {
    console.error('❌ Error creating charging station:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// --- UPDATE CHARGING STATION ---
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('📥 Update Charging Station Data:', req.body);
    console.log('👤 Authenticated User:', req.user);

    // Optional: Restrict to admin only
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Access denied: Admins only' });
    // }

    // Convert frontend location format to GeoJSON format (same as create route)
    const stationData = { ...req.body };
    
    // Handle location conversion - check for different possible formats
    if (stationData.location) {
      console.log('📍 Processing location data:', stationData.location);
      console.log('📍 Location data type:', typeof stationData.location);
      console.log('📍 Location data keys:', Object.keys(stationData.location));
      
      // Check if we have valid latitude and longitude values
      const hasValidLat = stationData.location.latitude !== undefined && 
                         stationData.location.latitude !== null && 
                         stationData.location.latitude !== '';
      const hasValidLng = stationData.location.longitude !== undefined && 
                         stationData.location.longitude !== null && 
                         stationData.location.longitude !== '';
      
      if (hasValidLat && hasValidLng) {
        // Frontend format: { latitude, longitude }
        const lat = Number(stationData.location.latitude);
        const lng = Number(stationData.location.longitude);
        
        console.log('📍 Parsed lat/lng:', { lat, lng });
        
        if (isNaN(lat) || isNaN(lng)) {
          return res.status(400).json({ error: 'Invalid latitude or longitude values. Must be numbers.' });
        }
        
        // Create the complete GeoJSON structure
        stationData.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
        console.log('🔄 Converted to GeoJSON:', stationData.location);
      } else if (stationData.location.coordinates && Array.isArray(stationData.location.coordinates)) {
        // Already in GeoJSON format, just ensure it has the type
        if (!stationData.location.type) {
          stationData.location.type = 'Point';
        }
        console.log('✅ Already in GeoJSON format:', stationData.location);
      } else {
        // Invalid location format
        console.log('❌ Invalid location format:', stationData.location);
        console.log('❌ Has valid lat:', hasValidLat, 'Has valid lng:', hasValidLng);
        return res.status(400).json({ 
          error: 'Invalid location format. Requires valid latitude and longitude values.',
          received: stationData.location
        });
      }
    } else {
      console.log('⚠️ No location data provided');
      return res.status(400).json({ error: 'Location is required.' });
    }

    // Final validation - ensure location has all required fields
    if (!stationData.location || !stationData.location.type || !stationData.location.coordinates) {
      console.log('❌ Missing required location fields:', stationData.location);
      return res.status(400).json({ 
        error: 'Location must have type and coordinates fields.',
        received: stationData.location 
      });
    }

    console.log('🔄 Final station data:', stationData);

    const updatedStation = await ChargingStation.findByIdAndUpdate(
      req.params.id,
      stationData,
      { new: true, runValidators: true }
    );

    if (!updatedStation) {
      return res.status(404).json({ error: 'Charging station not found' });
    }

    res.json(updatedStation);
  } catch (error) {
    console.error('❌ Error updating charging station:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// --- DELETE CHARGING STATION ---
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('👤 Authenticated User:', req.user);

    // Optional: Restrict to admin only
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Access denied: Admins only' });
    // }

    const deletedStation = await ChargingStation.findByIdAndDelete(req.params.id);
    
    if (!deletedStation) {
      return res.status(404).json({ error: 'Charging station not found' });
    }

    res.json({ message: 'Charging station deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting charging station:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
