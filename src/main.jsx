import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/global.css'
import 'leaflet/dist/leaflet.css'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = '394699091297-rgiu0h4liutd64iug4h5kh9elnqkjf2i.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
