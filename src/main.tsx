import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

const SafeThemeProvider = ThemeProvider as React.ComponentType<any>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SafeThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SafeThemeProvider>
  </StrictMode>,
);


