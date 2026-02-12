import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Send } from 'lucide-react';
import api from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const VideoCallPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [remotePeerId, setRemotePeerId] = useState<string | null>(null);

    const myVideo = useRef<HTMLVideoElement>(null);


    const remoteVideo = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const streamRef = useRef<MediaStream | null>(null); // Ref for access inside headers/callbacks without dep/re-render

    const rtcConfig: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    };

    // 1. Get Media First
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                streamRef.current = currentStream;
                if (myVideo.current) myVideo.current.srcObject = currentStream;
            })
            .catch((err) => {
                console.error("Camera access failed", err);
            });
            
        return () => {
             if (streamRef.current) {
                 streamRef.current.getTracks().forEach(track => track.stop());
             }
        };
    }, []);

    // 2. Initialize Socket & WebRTC (Only when stream is ready? Or handle null stream?)
    // Let's initialize anyway, but add tracks if available. 
    useEffect(() => {
        if (!stream) return; // Wait for local stream before connecting to avoid "no track" issues or complex logic

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        const createPeerConnection = () => {
            if (peerConnection.current) return peerConnection.current;

            const pc = new RTCPeerConnection(rtcConfig);
            peerConnection.current = pc;

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    newSocket.emit('ice-candidate', { candidate: event.candidate, roomId: appointmentId });
                }
            };

            pc.ontrack = (event) => {
                if (remoteVideo.current) {
                    remoteVideo.current.srcObject = event.streams[0];
                }
            };

            // Add local tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current!));
            }

            return pc;
        };

        newSocket.on('connect', () => {
            console.log("Connected to Signal Server");
            newSocket.emit('join-room', appointmentId);
        });

        // Initiator
        newSocket.on('user-connected', async (userId) => {
            console.log("User Connected:", userId);
            setRemotePeerId(userId);

            const pc = createPeerConnection();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            newSocket.emit('offer', { offer, roomId: appointmentId });
        });

        // Receiver
        newSocket.on('offer', async (data) => {
            setRemotePeerId(data.senderId);
            const pc = createPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            newSocket.emit('answer', { answer, roomId: appointmentId });
        });

        newSocket.on('answer', async (data) => {
            const pc = peerConnection.current;
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        newSocket.on('ice-candidate', async (data) => {
            const pc = peerConnection.current;
            if (pc && data.candidate) {
                try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (e) { console.error(e); }
            }
        });

        newSocket.on('receive-message', (data) => setMessages(prev => [...prev, data]));

        // Record Session
        api.post('/video/sessions', { appointmentId }).catch(console.error);

        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            newSocket.disconnect();
        };
    }, [appointmentId, stream]); // Run once stream is ready. Stream object reference shouldn't change often if handled in useEffect 1.

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !micOn;
            setMicOn(!micOn);
        }
    };

    const toggleCam = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !camOn;
            setCamOn(!camOn);
        }
    };

    const endCall = async () => {
        if (confirm("End consultation?")) {
            await api.post('/video/sessions/end', { appointmentId });
            navigate('/');
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        // Optimistic update? No, let's wait for socket echo
        socket.emit('send-message', {
             roomId: appointmentId,
             message: newMessage,
             senderName: user?.firstName || 'User'
        });
        setNewMessage('');
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Main Video Area */}
            <div className="flex-1 relative flex items-center justify-center">
                {remotePeerId ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center overflow-hidden">
                        <video 
                            ref={remoteVideo} 
                            autoPlay 
                            playsInline
                            className="w-full h-full object-cover" 
                        />
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <h2 className="text-xl">Waiting for other party...</h2>
                        <p className="text-sm">Share the appointment link to connect.</p>
                    </div>
                )}

                {/* Self View (PiP) */}
                <div className="absolute bottom-24 right-6 w-48 h-36 bg-black rounded-lg border-2 border-gray-700 overflow-hidden shadow-xl z-10">
                    <video 
                        ref={myVideo} 
                        muted 
                        autoPlay 
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]" 
                    />
                    {!camOn && <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-xs">Camera Off</div>}
                </div>

                {/* Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800/90 px-6 py-3 rounded-full flex gap-4 backdrop-blur shadow-2xl z-20">
                    <button onClick={toggleMic} className={`p-4 rounded-full ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}>
                        {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </button>
                    <button onClick={toggleCam} className={`p-4 rounded-full ${camOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}>
                        {camOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </button>
                    <button onClick={() => setShowChat(!showChat)} className={`p-4 rounded-full ${showChat ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        <MessageSquare className="w-6 h-6" />
                    </button>
                    <button onClick={endCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700">
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Chat Sidebar */}
            {showChat && (
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col text-gray-900 animate-in slide-in-from-right duration-200">
                    <div className="p-4 border-b font-bold bg-gray-50">In-Call Chat</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.senderName === user?.firstName ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                                    msg.senderName === user?.firstName 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                }`}>
                                    <div className="text-xs opacity-75 mb-1 font-bold">{msg.senderName}</div>
                                    {msg.message}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={sendMessage} className="p-4 border-t bg-gray-50 flex gap-2">
                        <input 
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="Type a message..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default VideoCallPage;
