import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Loader } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext'; // Unused
import { PatientService } from '../../services/patient.service';

const VideoConsultation = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    // const { user } = useAuth(); // Unused
    
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Call State
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [joined, setJoined] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('CONNECTING');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!appointmentId) return;
            try {
                const data = await PatientService.getAppointment(appointmentId);
                setAppointment(data);
                
                // Simulate "Connecting" to video server
                if (joined) {
                    setTimeout(() => setConnectionStatus('CONNECTED'), 2000);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load appointment details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [appointmentId, joined]);

    const handleJoin = () => {
        setJoined(true);
        // Here we would normally initialize the WebRTC session
    };

    if (loading) return (
        <div className="h-screen bg-gray-900 flex items-center justify-center text-white">
            <Loader className="w-8 h-8 animate-spin mr-2" /> Loading session...
        </div>
    );

    if (error) return (
         <div className="h-screen bg-gray-900 flex items-center justify-center text-red-500">
            {error}
        </div>
    );

    if (!joined) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-xl max-w-md w-full text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 animate-pulse">
                        <Video className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Ready to Join?</h1>
                        {appointment && (
                             <p className="text-gray-600 mt-2">
                                Consultation with <span className="font-semibold text-purple-700">Dr. {appointment.doctor?.user?.lastName}</span>
                             </p>
                        )}
                        <p className="text-sm text-gray-400 mt-1">Check your camera and microphone before joining.</p>
                    </div>

                    {/* Pre-join Preview */}
                    <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 relative overflow-hidden">
                        {videoOn ? (
                             <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                                 <span className="text-xs">Camera Preview</span>
                             </div>
                        ) : (
                             <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                <VideoOff className="w-10 h-10 text-gray-600" />
                             </div>
                        )}
                        <div className="absolute bottom-2 flex gap-2">
                             <button onClick={() => setMicOn(!micOn)} className={`p-2 rounded-full ${micOn ? 'bg-gray-600' : 'bg-red-500'} text-white`}>
                                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                             </button>
                             <button onClick={() => setVideoOn(!videoOn)} className={`p-2 rounded-full ${videoOn ? 'bg-gray-600' : 'bg-red-500'} text-white`}>
                                {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                             </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleJoin}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 w-full shadow-lg shadow-purple-200 transition-all hover:scale-[1.02]"
                        >
                            Join Conversation
                        </button>
                         <button 
                            onClick={() => navigate(-1)}
                            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 w-full"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="h-16 bg-gray-800 flex items-center justify-between px-6 text-white border-b border-gray-700">
                <div className="flex items-center gap-3">
                     <div className={`w-3 h-3 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                     <span className="font-bold tracking-wide">
                        Dr. {appointment?.doctor?.user?.lastName} <span className="font-normal text-gray-400 mx-2">|</span> {connectionStatus === 'CONNECTED' ? '00:42' : 'Connecting...'}
                    </span>
                </div>
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                     <span className="text-xs text-red-500 font-bold tracking-wider">REC</span>
                </div>
            </div>

            {/* Main Video Area (Grid) */}
            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Remote Stream (Doctor) */}
                <div className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-2xl">
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            {connectionStatus === 'CONNECTED' ? (
                                <div className="text-gray-500 flex flex-col items-center">
                                     {/* Placeholder for Doctor Video Stream */}
                                     <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mb-4 border-4 border-gray-600">
                                        <span className="text-5xl">👨‍⚕️</span>
                                     </div>
                                     <p className="text-gray-300 font-medium">Dr. {appointment?.doctor?.user?.lastName}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader className="w-10 h-10 text-blue-500 animate-spin" />
                                    <p className="text-gray-400">Waiting for doctor...</p>
                                </div>
                            )}
                        </div>
                     </div>
                     <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-sm font-medium border border-white/10">
                        Dr. {appointment?.doctor?.user?.lastName}
                     </div>
                </div>

                {/* Local Stream (Self) */}
                <div className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-xl">
                     {videoOn ? (
                         <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Your Video Feed</span>
                         </div>
                     ) : (
                         <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                             <VideoOff className="w-16 h-16 text-gray-700" />
                         </div>
                     )}
                     
                     <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-sm font-medium border border-white/10">
                        You {micOn ? '' : '(Muted)'}
                     </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="h-24 bg-gray-800/90 backdrop-blur-lg border-t border-gray-700 flex items-center justify-center gap-6 pb-4">
                <button 
                    onClick={() => setMicOn(!micOn)}
                    className={`p-4 rounded-full transition-all duration-300 ${micOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'}`}
                >
                    {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                <button 
                    onClick={() => setVideoOn(!videoOn)}
                    className={`p-4 rounded-full transition-all duration-300 ${videoOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'}`}
                >
                    {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                <button 
                    onClick={() => {
                        if (confirm("End consultation?")) navigate(`/consultation/${appointmentId}`);
                    }}
                    className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-300 hover:scale-110 shadow-lg shadow-red-600/40 px-8 flex items-center gap-2"
                >
                    <PhoneOff className="w-6 h-6" />
                    <span className="font-bold">End Call</span>
                </button>
                <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all relative">
                    <MessageSquare className="w-6 h-6" />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"></span>
                </button>
            </div>
        </div>
    );
};

export default VideoConsultation;
