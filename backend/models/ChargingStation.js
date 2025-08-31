const mongoose = require('mongoose');

const ChargingStationSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // ✅ GeoJSON Point format
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },

  powerOutput: { type: Number, required: true },
  slots: { type: Number, required: true },
  connectorType: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// ✅ Create 2dsphere index for Geo queries (if needed later)
ChargingStationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ChargingStation', ChargingStationSchema);
