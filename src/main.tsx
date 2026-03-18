import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerPWA, setupNetworkListeners, isOnline } from './services/pwaRegistration'
import { syncAllPendingData } from './services/offlineStorage'

// Register PWA Service Worker (optional - silently fails if not available)
registerPWA().then(() => {
  // Silent - app works without PWA
}).catch(() => {
  // Silent failure - PWA is optional
});

// Setup network listeners for offline support
if (typeof window !== 'undefined') {
  setupNetworkListeners(
    // Online - sync pending data
    async () => {
      console.log('Back online! Syncing pending data...');
      const result = await syncAllPendingData();
      console.log('Sync result:', result);
    },
    // Offline - show notification
    () => {
      console.log('You are offline. Data will be synced when connection is restored.');
    }
  );
  
  // Check initial state
  if (!isOnline()) {
    console.log('App started offline. Using cached data.');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
