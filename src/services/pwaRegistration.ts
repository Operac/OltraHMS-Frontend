// PWA Registration Service
// vite-plugin-pwa (configured in vite.config.ts) handles service worker
// generation and auto-registration. This file provides utility helpers only.

const isBrowser = typeof window !== 'undefined';

// No-op: vite-plugin-pwa with injectRegister:'auto' handles registration
export async function registerPWA() {
  // Registration is handled automatically by the virtual module injected
  // by vite-plugin-pwa into index.html at build time.
  // In development, service workers are disabled (devOptions.enabled: false).
  return { offlineReady: 'serviceWorker' in navigator };
}

// Check if app is running offline
export function isOnline(): boolean {
  return isBrowser ? navigator.onLine : true;
}

// Listen for online/offline events — used by the app for UI indicators
export function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (!isBrowser) return () => {};
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

export function isOnlineSync(): boolean {
  return isBrowser ? navigator.onLine : true;
}

export default { registerPWA, isOnline, setupNetworkListeners };
