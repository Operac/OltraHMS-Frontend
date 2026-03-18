// PWA Registration Service
// Handles Service Worker registration and lifecycle management
// Note: PWA is optional - app works without it

const SW_URL = '/sw.js';

export interface PWARegistration {
  ready: Promise<ServiceWorkerRegistration>;
  offlineReady: boolean;
}

let registration: ServiceWorkerRegistration | null = null;
let updateFound = false;

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

export async function registerPWA(): Promise<PWARegistration> {
  if (!isBrowser || !('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported in this environment');
    return {
      ready: Promise.reject(new Error('Service Workers not supported')),
      offlineReady: false
    };
  }

  try {
    // Register the service worker
    registration = await navigator.serviceWorker.register(SW_URL, {
      scope: '/'
    });

    console.log('Service Worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration?.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            updateFound = true;
            showUpdateNotification();
          }
        });
      }
    });

    // Handle controller change (page refresh after update)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (updateFound) {
        window.location.reload();
      }
    });

    // Check for pending updates
    if (registration.active) {
      console.log('Service Worker is active');
    }

    return {
      ready: navigator.serviceWorker.ready,
      offlineReady: true
    };
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return {
      ready: Promise.reject(error),
      offlineReady: false
    };
  }
}

// Show update notification to user
function showUpdateNotification() {
  // Dispatch custom event for UI to handle
  const event = new CustomEvent('sw-update-available');
  window.dispatchEvent(event);
}

// Request immediate update
export async function requestUpdate(): Promise<void> {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Check if app is running offline
export function isOnline(): boolean {
  return navigator.onLine;
}

// Listen for online/offline events
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

// Send message to service worker
export async function sendToSW(message: any): Promise<void> {
  if (registration?.active) {
    await registration.active.postMessage(message);
  }
}

// Get current service worker state
export function getSWState(): 'unknown' | 'activated' | 'redundant' | 'installed' | 'installing' | 'activating' {
  if (!registration?.active) return 'unknown';
  
  // @ts-ignore - state is available on SW
  return registration.active.state || 'unknown';
}

export default {
  registerPWA,
  requestUpdate,
  isOnline,
  setupNetworkListeners,
  sendToSW,
  getSWState
};
