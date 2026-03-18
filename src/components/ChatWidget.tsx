
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import io, { Socket } from 'socket.io-client';
import { MessageCircle, X, Send, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import api from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

interface Message {
    id?: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string;
    sender?: { firstName: string, lastName: string, role: string }; // From API
}

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [currentChannel, setCurrentChannel] = useState('general');
    const [showGenerals, setShowChannels] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Socket
    useEffect(() => {
        if (!isOpen || !user) return;

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.emit('join-room', currentChannel);

        newSocket.on('receive-message', (data: any) => {
            const isFromMe = data.senderId === user.id;
            
            // Play sound notification for incoming messages (when chat is open or closed)
            if (!isFromMe && soundEnabled) {
                playNotificationSound();
            }
            
            // Only add to messages if chat is open AND in the same channel
            // OR increment unread count if chat is closed or different channel
            if (isOpen && data.roomId === currentChannel) {
                setMessages(prev => [...prev, {
                    content: data.message,
                    senderName: data.senderName,
                    senderId: data.senderId,
                    timestamp: data.timestamp
                }]);
            } else if (!isFromMe) {
                // Increment unread count for messages in other channels or when chat is closed
                setUnreadCount(prev => prev + 1);
            }
        });
        
        // Load history
        loadHistory(currentChannel);

        return () => {
            newSocket.disconnect();
        };
    }, [isOpen, currentChannel, user]);

    // Clear unread count when opening chat
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleV4gWqrb5bBlHTpjl9npsWMgQmCh1+CyZh1BYJ7V4rRjHT5fmdLfr2MdP1+Z0d6vYh1BX5jP369iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0/X5fP3q9iHT9fl8/er2IdP1+Xz96vYh0');
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore errors
        } catch (e) {
            // Ignore audio errors
        }
    };

    const loadHistory = async (channel: string) => {
        try {
            const res = await api.get(`/chat/${channel}`);
            // Map API messages to UI format
            const history = res.data.map((m: any) => ({
                id: m.id,
                content: m.content,
                senderId: m.senderId,
                senderName: `${m.sender.firstName} ${m.sender.lastName}`,
                timestamp: m.createdAt,
                sender: m.sender
            }));
            setMessages(history);
        } catch (err) {
            console.error('Failed to load chat history', err);
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !socket || !user) return;

        // Optimistic UI update
        // Actually socket 'receive-message' might echo back. 
        // If we duplicate, we need to handle uniq. 
        // My socket handler broadcasts to room. Does it exclude sender? 
        // socket.to(room) excludes sender. io.to(room) includes sender.
        // The handler uses io.to(room).emit... So it includes sender.
        // So we should NOT append locally, wait for echo? 
        // Or append locally and ignore own echo?
        // Let's rely on echo for simplicity or check ID.

        socket.emit('send-message', {
            roomId: currentChannel,
            message: inputText,
            senderName: `${user.firstName} ${user.lastName}`,
            senderId: user.id
        });

        setInputText('');
    };

    const channels = [
        { id: 'general', label: 'General' },
        { id: 'doctors', label: 'Doctors' },
        { id: 'nurses', label: 'Nurses' },
        { id: 'handover', label: 'Handovers' }
    ];

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-200">
                    
                    {/* Header */}
                    <div className="bg-sky-500 text-white p-4 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 relative">
                            <button 
                                onClick={() => setShowChannels(!showGenerals)}
                                className="font-bold flex items-center gap-1 hover:bg-sky-600/50 px-2 py-1 rounded transition-colors"
                            >
                                {channels.find(c => c.id === currentChannel)?.label}
                                <ChevronDown size={14} />
                            </button>
                            
                            {/* Channel Dropdown */}
                            {showGenerals && (
                                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 text-gray-800 z-50">
                                    {channels.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setCurrentChannel(c.id);
                                                setShowChannels(false);
                                                setMessages([]); // Clear before load
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${currentChannel === c.id ? 'font-bold text-sky-500' : ''}`}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setSoundEnabled(!soundEnabled)} 
                                className="hover:bg-sky-600/50 p-1 rounded transition-colors"
                                title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
                            >
                                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-sky-600/50 p-1 rounded">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === user.id || msg.senderName === `${user.firstName} ${user.lastName}`; 
                            // senderId check is safer if available locally
                            
                            return (
                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm
                                        ${isMe ? 'bg-sky-500 text-white' : 'bg-white text-gray-800 border border-gray-200'}
                                    `}>
                                        {!isMe && <div className="text-xs font-bold text-sky-500 mb-0.5">{msg.senderName}</div>}
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={`Message #${currentChannel}...`}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                        />
                        <button 
                            type="submit" 
                            disabled={!inputText.trim()}
                            className="bg-sky-500 text-white p-2 rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-sky-500 text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative"
                >
                    <MessageCircle size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
