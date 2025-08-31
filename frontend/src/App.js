import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider} from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ChargingStationList from './components/ChargingStations/ChargingStationList';
import ProtectedRoute from './components/ProtectedRoute';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#00843D',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Main App component

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ChargingStationList />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
