import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          className: 'robotic-toast',
          duration: 3500,
          style: {
            background: 'rgba(10, 20, 36, 0.9)',
            color: '#fff',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            backdropFilter: 'blur(16px) saturate(180%)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
            maxWidth: '450px',
            padding: '16px 24px',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.2), inset 0 0 12px rgba(99, 102, 241, 0.1)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          },
          success: {
            style: {
              border: '1px solid rgba(34, 211, 238, 0.5)',
              boxShadow: '0 0 30px rgba(34, 211, 238, 0.15), inset 0 0 15px rgba(34, 211, 238, 0.1)',
            },
            iconTheme: {
              primary: '#22d3ee',
              secondary: '#0a1424',
            },
          },
          error: {
            style: {
              border: '1px solid rgba(244, 63, 94, 0.5)',
              boxShadow: '0 0 30px rgba(244, 63, 94, 0.15), inset 0 0 15px rgba(244, 63, 94, 0.1)',
            },
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#0a1424',
            },
          },
        }}
      />
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
