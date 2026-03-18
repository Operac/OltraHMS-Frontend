# OltraHMS Frontend

This is the frontend client for the OltraHMS application, built with React, TypeScript, and Vite.

## Quick Start

Please refer to the root [README.md](../README.md) for full project setup and documentation.

## Commands

*   `npm run dev`: Start development server
*   `npm run build`: Build for production
*   `npm run lint`: Run ESLint
*   `npx playwright test`: Run E2E tests

## New Features (March 2025)

### PWA Support
- Offline-first capability with Service Worker
- IndexedDB for local data storage
- Background Sync for offline queue operations
- Installable as native app

### Queue Management
- Real-time queue updates via Socket.io
- Socket service: `src/services/socketService.ts`
- Offline storage: `src/services/offlineStorage.ts`
- Print service for thermal printers: `src/services/printService.ts`

### Key Services
- **socketService.ts**: Real-time queue updates
- **offlineStorage.ts**: IndexedDB wrapper for offline data
- **printService.ts**: Thermal printer integration
- **pwaRegistration.ts**: Service Worker management
