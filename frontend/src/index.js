import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GoogleOAuthProvider } from '@react-oauth/google';

import theme from './utils/theme';
import App from './App';

const root =
  ReactDOM.createRoot(
    document.getElementById('root')
  );

root.render(

  <React.StrictMode>

    <GoogleOAuthProvider

      clientId={
        process.env
          .REACT_APP_GOOGLE_CLIENT_ID
      }

    >

      <ThemeProvider theme={theme}>

        <CssBaseline />

        <App />

      </ThemeProvider>

    </GoogleOAuthProvider>

  </React.StrictMode>

);