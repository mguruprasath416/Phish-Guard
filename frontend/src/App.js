import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import {
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';

import {
  AuthProvider,
  useAuth
} from './context/AuthContext';

import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';

import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import History from './pages/History';
import VerifyEmail from './pages/VerifyEmail';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {

  const {
    isAuthenticated
  } = useAuth();

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace />;

};

const AppLayout = () => (
  <>

    <Navbar />

    <Routes>

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/analyze"
        element={<Analyze />}
      />

      <Route
        path="/history"
        element={<History />}
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>

  </>
);

const theme = createTheme({

  palette: {

    mode: 'light',

    primary: {
      main: '#2a7a55'
    }

  }

});

function App() {

  return (

    <ThemeProvider
      theme={theme}
    >

      <CssBaseline />

      <AuthProvider>

        <Router>

          <Routes>

            <Route
              path="/"
              element={
                <LandingPage />
              }
            />

            <Route
              path="/login"
              element={
                <Login />
              }
            />

            <Route
              path="/register"
              element={
                <Register />
              }
            />

            <Route
              path="/verify-email/:token"
              element={
                <VerifyEmail />
              }
            />

            <Route

              path="/*"

              element={

                <ProtectedRoute>

                  <AppLayout />

                </ProtectedRoute>

              }

            />

          </Routes>

        </Router>

      </AuthProvider>

    </ThemeProvider>

  );

}

export default App;