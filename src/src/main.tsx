import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.tsx'
import '../styles/globals.css'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    console.log('📱 PWA: Registering service worker...');
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ PWA: Service Worker registered successfully:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 PWA: Service Worker update found');
        });
      })
      .catch((registrationError) => {
        console.error('❌ PWA: Service Worker registration failed:', registrationError);
      });
  });
  
  // Listen for service worker events
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 PWA: Service Worker controller changed');
  });
} else {
  console.warn('⚠️ PWA: Service Worker not supported in this browser');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)