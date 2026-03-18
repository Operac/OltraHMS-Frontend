import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface QueueItem {
  id?: number;
  patientId: string;
  patientName: string;
  appointmentType: string;
  department: string;
  doctorName?: string;
  priority: 'normal' | 'urgent' | 'elderly' | 'pregnant';
  status: 'waiting' | 'triage' | 'with-doctor' | 'completed' | 'no-show';
  tokenNumber: number;
  checkInTime: Date;
  triageTime?: Date;
  consultStartTime?: Date;
  consultEndTime?: Date;
  complaints?: string;
  notes?: string;
  createdBy: string;
  isSynced: boolean;
}

interface VitalsRecord {
  id?: number;
  patientId: string;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordedBy: string;
  recordedAt: Date;
  isSynced: boolean;
}

interface PendingRequest {
  id?: number;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body: any;
  timestamp: Date;
  retries: number;
}

interface OltraHMSDB extends DBSchema {
  queue: {
    key: number;
    value: QueueItem;
    indexes: { 'by-patient': string; 'by-status': string; 'by-token': number };
  };
  vitals: {
    key: number;
    value: VitalsRecord;
    indexes: { 'by-patient': string; 'by-date': Date };
  };
  pendingRequests: {
    key: number;
    value: PendingRequest;
    indexes: { 'by-timestamp': Date };
  };
}

let dbPromise: Promise<IDBPDatabase<OltraHMSDB>>;

function getDB(): Promise<IDBPDatabase<OltraHMSDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OltraHMSDB>('oltrahms-offline', 1, {
      upgrade(db: IDBPDatabase<OltraHMSDB>) {
        // Queue store
        const queueStore = db.createObjectStore('queue', {
          keyPath: 'id',
          autoIncrement: true
        });
        queueStore.createIndex('by-patient', 'patientId');
        queueStore.createIndex('by-status', 'status');
        queueStore.createIndex('by-token', 'tokenNumber');

        // Vitals store
        const vitalsStore = db.createObjectStore('vitals', {
          keyPath: 'id',
          autoIncrement: true
        });
        vitalsStore.createIndex('by-patient', 'patientId');
        vitalsStore.createIndex('by-date', 'recordedAt');

        // Pending requests store for offline queue
        const pendingStore = db.createObjectStore('pendingRequests', {
          keyPath: 'id',
          autoIncrement: true
        });
        pendingStore.createIndex('by-timestamp', 'timestamp');
      }
    });
  }
  return dbPromise;
}

// Queue operations
export async function addToOfflineQueue(item: Omit<QueueItem, 'id' | 'isSynced'>): Promise<number> {
  const db = await getDB();
  return db.add('queue', { ...item, isSynced: false });
}

export async function getOfflineQueue(status?: string): Promise<QueueItem[]> {
  const db = await getDB();
  if (status) {
    return db.getAllFromIndex('queue', 'by-status', status);
  }
  return db.getAll('queue');
}

export async function updateOfflineQueueItem(id: number, updates: Partial<QueueItem>): Promise<void> {
  const db = await getDB();
  const item = await db.get('queue', id);
  if (item) {
    await db.put('queue', { ...item, ...updates });
  }
}

export async function deleteOfflineQueueItem(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('queue', id);
}

export async function clearSyncedQueueItems(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('queue', 'readwrite');
  const store = tx.objectStore('queue');
  const items = await store.getAll();
  
  for (const item of items) {
    if (item.isSynced) {
      await store.delete(item.id!);
    }
  }
  await tx.done;
}

// Vitals operations
export async function addOfflineVitals(vitals: Omit<VitalsRecord, 'id' | 'isSynced'>): Promise<number> {
  const db = await getDB();
  return db.add('vitals', { ...vitals, isSynced: false });
}

export async function getOfflineVitals(patientId?: string): Promise<VitalsRecord[]> {
  const db = await getDB();
  if (patientId) {
    return db.getAllFromIndex('vitals', 'by-patient', patientId);
  }
  return db.getAll('vitals');
}

// Pending requests queue (for background sync)
export async function addPendingRequest(
  method: PendingRequest['method'],
  url: string,
  body: any
): Promise<number> {
  const db = await getDB();
  return db.add('pendingRequests', {
    method,
    url,
    body,
    timestamp: new Date(),
    retries: 0
  });
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  const db = await getDB();
  return db.getAll('pendingRequests');
}

export async function removePendingRequest(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('pendingRequests', id);
}

export async function incrementRequestRetries(id: number): Promise<void> {
  const db = await getDB();
  const request = await db.get('pendingRequests', id);
  if (request) {
    await db.put('pendingRequests', { ...request, retries: request.retries + 1 });
  }
}

// Network status
export function isOnline(): boolean {
  return navigator.onLine;
}

// Sync all pending data
export async function syncAllPendingData(): Promise<{ success: boolean; synced: number; failed: number }> {
  if (!isOnline()) {
    return { success: false, synced: 0, failed: 0 };
  }

  const db = await getDB();
  let synced = 0;
  let failed = 0;

  // Sync pending queue items
  const queueItems = await db.getAll('queue');
  for (const item of queueItems) {
    if (!item.isSynced) {
      try {
        const response = await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (response.ok) {
          await db.put('queue', { ...item, isSynced: true });
          synced++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }
  }

  // Sync pending vitals
  const vitalsItems = await db.getAll('vitals');
  for (const item of vitalsItems) {
    if (!item.isSynced) {
      try {
        const response = await fetch('/api/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        if (response.ok) {
          await db.put('vitals', { ...item, isSynced: true });
          synced++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }
  }

  // Sync pending requests
  const pendingRequests = await db.getAll('pendingRequests');
  for (const request of pendingRequests) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: { 'Content-Type': 'application/json' },
        body: request.body ? JSON.stringify(request.body) : undefined
      });
      if (response.ok) {
        await db.delete('pendingRequests', request.id!);
        synced++;
      } else {
        if (request.retries < 3) {
          await incrementRequestRetries(request.id!);
        } else {
          await db.delete('pendingRequests', request.id!);
          failed++;
        }
      }
    } catch (error) {
      failed++;
    }
  }

  return { success: failed === 0, synced, failed };
}

// Export for use in components
export const offlineStorage = {
  getDB,
  queue: {
    add: addToOfflineQueue,
    getAll: getOfflineQueue,
    update: updateOfflineQueueItem,
    delete: deleteOfflineQueueItem,
    clearSynced: clearSyncedQueueItems
  },
  vitals: {
    add: addOfflineVitals,
    getAll: getOfflineVitals
  },
  isOnline,
  syncAllPendingData
};

export type { QueueItem, VitalsRecord, PendingRequest };
