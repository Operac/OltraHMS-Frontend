import { useState, useEffect } from 'react';
import { queueSocket } from '../../services/socketService';
import api from '../../services/api';
import { Monitor, Volume2, VolumeX } from 'lucide-react';

interface QueueItem {
  id: string;
  patientName: string;
  tokenNumber: number;
  doctorName: string;
  department: string;
  status: string;
}

const QueueDisplay = () => {
  const [currentPatient, setCurrentPatient] = useState<QueueItem | null>(null);
  const [waitingQueue, setWaitingQueue] = useState<QueueItem[]>([]);
  const [lastCalled, setLastCalled] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load initial queue data
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await api.get('/queue/all');
        const queues = res.data.queues || [];
        
        // Set current patient (IN_PROGRESS)
        const inProgress = queues.find((q: any) => q.status === 'IN_PROGRESS');
        if (inProgress) {
          setCurrentPatient({
            id: inProgress.id,
            patientName: `${inProgress.patient.firstName} ${inProgress.patient.lastName}`,
            tokenNumber: inProgress.queuePosition || 0,
            doctorName: inProgress.doctor?.user ? `${inProgress.doctor.user.firstName} ${inProgress.doctor.user.lastName}` : 'N/A',
            department: inProgress.doctor?.department?.name || '',
            status: inProgress.status
          });
        }
        
        // Set waiting queue (CHECKED_IN)
        const waiting = queues
          .filter((q: any) => q.status === 'CHECKED_IN')
          .sort((a: any, b: any) => (a.queuePosition || 0) - (b.queuePosition || 0))
          .map((q: any) => ({
            id: q.id,
            patientName: `${q.patient.firstName} ${q.patient.lastName}`,
            tokenNumber: q.queuePosition || 0,
            doctorName: q.doctor?.user ? `${q.doctor.user.firstName} ${q.doctor.user.lastName}` : 'N/A',
            department: q.doctor?.department?.name || '',
            status: q.status
          }));
        setWaitingQueue(waiting);
      } catch (err) {
        console.error('Failed to load queue:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQueue();
    
    // Connect to socket
    queueSocket.connect();
    queueSocket.joinDisplay();
    
    const handleQueueEvent = (data: any) => {
      console.log('Display received event:', data);
      
      if (data.type === 'PATIENT_CALLED' || data.type === 'PATIENT_WITH_DOCTOR') {
        // Play sound
        if (soundEnabled) {
          playBeep();
        }
        
        setCurrentPatient({
          id: data.appointmentId,
          patientName: data.patientName,
          tokenNumber: data.tokenNumber,
          doctorName: data.doctorName || 'N/A',
          department: data.department || '',
          status: data.status
        });
        setLastCalled(`Token #${data.tokenNumber} - ${data.patientName}`);
        
        // Remove from waiting
        setWaitingQueue(prev => prev.filter(q => q.tokenNumber !== data.tokenNumber));
      } else if (data.type === 'PATIENT_CHECKED_IN') {
        // Add to waiting queue
        setWaitingQueue(prev => {
          const newItem: QueueItem = {
            id: data.appointmentId,
            patientName: data.patientName,
            tokenNumber: data.tokenNumber,
            doctorName: data.doctorName || 'N/A',
            department: data.department || '',
            status: data.status
          };
          return [...prev, newItem].sort((a, b) => a.tokenNumber - b.tokenNumber);
        });
      } else if (data.type === 'PATIENT_COMPLETED') {
        setCurrentPatient(null);
      } else if (data.type === 'QUEUE_UPDATED') {
        fetchQueue();
      }
    };
    
    queueSocket.on('queue-event', handleQueueEvent);
    
    return () => {
      queueSocket.off('queue-event', handleQueueEvent);
      queueSocket.disconnect();
    };
  }, [soundEnabled]);

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-900 flex items-center justify-center">
        <div className="text-white text-4xl font-bold animate-pulse">Loading Queue...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Monitor className="w-12 h-12 text-sky-300" />
          <div>
            <h1 className="text-3xl font-bold text-sky-100">OltraHMS Queue Display</h1>
            <p className="text-sky-300">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 rounded-full bg-sky-800 hover:bg-sky-700 transition"
        >
          {soundEnabled ? <Volume2 className="w-8 h-8" /> : <VolumeX className="w-8 h-8" />}
        </button>
      </div>

      {/* Last Called Banner */}
      {lastCalled && (
        <div className="bg-yellow-500 text-black text-center py-6 rounded-2xl mb-8 animate-pulse">
          <p className="text-2xl font-bold">NOW CALLED</p>
          <p className="text-5xl font-black">{lastCalled}</p>
        </div>
      )}

      {/* Current Patient */}
      <div className="bg-sky-800 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-sky-200 mb-4">NOW WITH DOCTOR</h2>
        {currentPatient ? (
          <div className="text-center">
            <div className="text-8xl font-black text-yellow-400 mb-4">
              #{currentPatient.tokenNumber}
            </div>
            <div className="text-5xl font-bold mb-2">{currentPatient.patientName}</div>
            <div className="text-2xl text-sky-200">
              Dr. {currentPatient.doctorName} • {currentPatient.department}
            </div>
          </div>
        ) : (
          <div className="text-center text-sky-300 text-3xl py-12">
            No patient currently being served
          </div>
        )}
      </div>

      {/* Waiting Queue */}
      <div className="bg-sky-800/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-sky-200 mb-4">
          Waiting ({waitingQueue.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {waitingQueue.map((patient) => (
            <div 
              key={patient.id} 
              className="bg-sky-700 rounded-xl p-4 text-center"
            >
              <div className="text-4xl font-black text-sky-200">#{patient.tokenNumber}</div>
              <div className="font-semibold text-lg truncate">{patient.patientName}</div>
              <div className="text-sm text-sky-300">{patient.doctorName}</div>
            </div>
          ))}
          {waitingQueue.length === 0 && (
            <div className="col-span-full text-center text-sky-300 py-8">
              No patients waiting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueDisplay;
