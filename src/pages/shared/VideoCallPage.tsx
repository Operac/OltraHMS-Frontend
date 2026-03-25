import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { PhoneOff, MessageSquare, Send, ExternalLink } from 'lucide-react';
import api from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const VideoCallPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [jitsiUrl, setJitsiUrl] = useState<string | null>(null);
    const [jitsiToken, setJitsiToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');

    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);

    // Load video session with Jitsi configuration
    useEffect(() => {
        const loadSession = async () => {
            try {
                setLoading(true);
                const response = await api.post('/video/sessions', { appointmentId });
                
                if (response.data && response.data.jitsiUrl) {
                    setJitsiUrl(response.data.jitsiUrl);
                    setJitsiToken(response.data.token);
                } else {
                    setError('Failed to get video session URL');
                }
            } catch (err: any) {
                console.error('Failed to load video session:', err);
                setError(err.response?.data?.message || 'Failed to load video session');
            } finally {
                setLoading(false);
            }
        };

        if (appointmentId) {
            loadSession();
        }

        return () => {
            // Clean up Jitsi on unmount
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
        };
    }, [appointmentId]);

    // Initialize Jitsi when URL is available
    useEffect(() => {
        if (!jitsiUrl || !jitsiContainerRef.current) return;

        // Load Jitsi Meet external script
        const loadJitsi = async () => {
            if (!(window as any).JitsiMeetExternalAPI) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://meet.jit.si/external_api.js';
                    script.async = true;
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Jitsi'));
                    document.body.appendChild(script);
                });
            }

            const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
            
            const domain = jitsiUrl.replace('https://', '').replace('http://', '');
            const roomName = jitsiUrl.split('/').pop() || `${appointmentId}`;

            const options: any = {
                parentNode: jitsiContainerRef.current,
                roomName: `${domain}/${roomName}`,
                width: '100%',
                height: '100%',
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: '#1a1a2e',
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'desktop', 'fullscreen',
                        'floatingvideos', 'hangup', 'chat', 'settings'
                    ],
                },
                userInfo: {
                    displayName: user ? `${user.firstName} ${user.lastName}` : 'Patient'
                }
            };

            // Add token if available (for authenticated Jitsi)
            if (jitsiToken) {
                options.jwt = jitsiToken;
            }

            try {
                jitsiApiRef.current = new JitsiMeetExternalAPI(domain, options);
                
                // Handle join events
                jitsiApiRef.current.addListener('videoConferenceJoined', () => {
                    console.log('Joined Jitsi meeting');
                });
                
                jitsiApiRef.current.addListener('videoConferenceLeft', () => {
                    console.log('Left Jitsi meeting');
                });
            } catch (err) {
                console.error('Failed to initialize Jitsi:', err);
                setError('Failed to initialize video call');
            }
        };

        loadJitsi();

    }, [jitsiUrl, appointmentId, user]);

    // Initialize Socket for chat
    useEffect(() => {
        if (!appointmentId || !user) return;

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.emit('join-room', `chat-${appointmentId}`);

        newSocket.on('receive-message', (data: any) => {
            if (data.roomId === `chat-${appointmentId}`) {
                setMessages(prev => [...prev, data]);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [appointmentId, user]);

    const endCall = async () => {
        if (confirm("End consultation?")) {
            // Dispose Jitsi
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
            
            try {
                await api.post('/video/sessions/end', { appointmentId });
            } catch (err) {
                console.error('Failed to end session:', err);
            }
            
            navigate(-1);
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !user) return;

        socket.emit('send-message', {
            roomId: `chat-${appointmentId}`,
            message: newMessage,
            senderName: `${user.firstName} ${user.lastName}`,
            senderId: user.id
        });
        setNewMessage('');
    };

    if (loading) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Connecting to video call...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-center p-8">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Main Video Area - Jitsi Embed */}
            <div className="flex-1 relative flex items-center justify-center">
                <div ref={jitsiContainerRef} className="w-full h-full" />
                
                {/* End Call Button (floating) */}
                <div className="absolute top-4 right-4 z-20">
                    <button 
                        onClick={endCall}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
                    >
                        <PhoneOff className="w-4 h-4" />
                        End Call
                    </button>
                </div>

                {/* Open in Browser Button */}
                {jitsiUrl && (
                    <div className="absolute top-4 left-4 z-20">
                        <a 
                            href={jitsiUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open in Browser
                        </a>
                    </div>
                )}
            </div>

            {/* Chat Sidebar */}
            {showChat && (
                <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-700 font-bold">In-Call Chat</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === user?.id || msg.senderName === `${user?.firstName} ${user?.lastName}`;
                            return (
                                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                                        isMe 
                                        ? 'bg-sky-500 text-white rounded-br-none' 
                                        : 'bg-gray-700 text-gray-100 rounded-bl-none'
                                    }`}>
                                        <div className="text-xs opacity-75 mb-1 font-bold">{msg.senderName}</div>
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1">
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 flex gap-2">
                        <input 
                            className="flex-1 p-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:border-sky-500" 
                            placeholder="Type a message..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Chat Toggle Button */}
            <div className="absolute bottom-6 right-6 z-20">
                <button 
                    onClick={() => setShowChat(!showChat)} 
                    className={`p-4 rounded-full ${showChat ? 'bg-sky-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default VideoCallPage;
