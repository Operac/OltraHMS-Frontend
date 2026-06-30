import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import io, { Socket } from 'socket.io-client';
import {
    MessageCircle, X, Send, ChevronDown, Volume2, VolumeX,
    Lock, Users, Search, ChevronLeft, Hash, UserCircle2
} from 'lucide-react';
import api from '../services/api';
import { Role } from '../constants/roles';

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL?.replace('/api', '') ||
    'http://localhost:3000';

const STAFF_CHAT_ROLES: string[] = [
    Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST,
    Role.PHARMACIST, Role.LAB_TECH, Role.RADIOLOGIST,
    Role.ACCOUNTANT, Role.INSURANCE_OFFICER,
];

const ROLE_COLOR: Record<string, string> = {
    DOCTOR: 'text-sky-600', NURSE: 'text-teal-600', ADMIN: 'text-purple-600',
    PHARMACIST: 'text-orange-500', LAB_TECH: 'text-indigo-500',
    RECEPTIONIST: 'text-pink-500', RADIOLOGIST: 'text-cyan-600',
    ACCOUNTANT: 'text-amber-600', INSURANCE_OFFICER: 'text-emerald-600',
};

const ROLE_BG: Record<string, string> = {
    DOCTOR: 'bg-sky-100', NURSE: 'bg-teal-100', ADMIN: 'bg-purple-100',
    PHARMACIST: 'bg-orange-100', LAB_TECH: 'bg-indigo-100',
    RECEPTIONIST: 'bg-pink-100', RADIOLOGIST: 'bg-cyan-100',
    ACCOUNTANT: 'bg-amber-100', INSURANCE_OFFICER: 'bg-emerald-100',
};

interface Message {
    content: string;
    senderId: string;
    senderName: string;
    senderRole?: string;
    timestamp: string;
}

interface StaffMember {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string | null;
    specialization?: string | null;
}

interface Conversation {
    channel: string;
    otherUser: { id: string; firstName: string; lastName: string; role: string } | null;
    lastMessage: { content: string; createdAt: string; senderId: string } | null;
}

interface GroupChannel { id: string; label: string; }

type View = 'home' | 'group' | 'dm' | 'new-dm';

function buildDmChannel(myId: string, otherId: string): string {
    const sorted = [myId, otherId].sort();
    return `dm:${sorted[0]}:${sorted[1]}`;
}

function playBeep() {
    try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch { /* ignore */ }
}

const ChatWidget = () => {
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<View>('home');
    const [activeChannel, setActiveChannel] = useState('');
    const [activeLabel, setActiveLabel] = useState('');

    const [groupChannels, setGroupChannels] = useState<GroupChannel[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
    const [staffSearch, setStaffSearch] = useState('');

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [channelError, setChannelError] = useState<string | null>(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showChannelPicker, setShowChannelPicker] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    if (!user || !STAFF_CHAT_ROLES.includes(user.role)) return null;

    // ── Load group channels and conversations ────────────────────────────
    const loadHomeData = useCallback(async () => {
        try {
            const [chRes, convRes] = await Promise.all([
                api.get('/chat/channels'),
                api.get('/chat/conversations'),
            ]);
            setGroupChannels(chRes.data);
            setConversations(convRes.data);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadHomeData();
            setUnreadCount(0);
        }
    }, [isOpen]);

    // ── Socket lifecycle ─────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen || !token) return;

        const sock = io(SOCKET_URL, { auth: { token } });
        socketRef.current = sock;

        sock.on('receive-message', (data: any) => {
            const isFromMe = data.senderId === user.id;
            if (data.roomId === activeChannel) {
                setMessages(prev => [...prev, {
                    content: data.message,
                    senderName: data.senderName,
                    senderId: data.senderId,
                    senderRole: data.senderRole,
                    timestamp: data.timestamp,
                }]);
                scrollToBottom();
            } else if (!isFromMe) {
                setUnreadCount(prev => prev + 1);
                // Refresh conversation list so last message updates
                loadHomeData();
            }
            if (!isFromMe && soundEnabled) playBeep();
        });

        sock.on('dm-ready', (data: { channel: string }) => {
            // Server confirmed DM room is ready
            loadMessages(data.channel);
            loadHomeData();
        });

        sock.on('chat-error', (data: { message: string }) => {
            setChannelError(data.message);
            setTimeout(() => setChannelError(null), 5000);
        });

        return () => {
            sock.disconnect();
            socketRef.current = null;
        };
    }, [isOpen, token]);

    // ── Re-join when active channel changes ──────────────────────────────
    useEffect(() => {
        if (!activeChannel || !socketRef.current) return;
        socketRef.current.emit('join-chat', activeChannel);
    }, [activeChannel]);

    const scrollToBottom = () =>
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    const loadMessages = async (channel: string) => {
        setLoadingMessages(true);
        setMessages([]);
        try {
            const res = await api.get(`/chat/${encodeURIComponent(channel)}`);
            setMessages(res.data.map((m: any) => ({
                content: m.content,
                senderId: m.senderId,
                senderName: `${m.sender.firstName} ${m.sender.lastName}`,
                senderRole: m.sender.role,
                timestamp: m.createdAt,
            })));
            scrollToBottom();
        } catch (err: any) {
            if (err?.response?.status === 403) setChannelError(err.response.data.message);
        } finally {
            setLoadingMessages(false);
        }
    };

    // ── Open a group channel ─────────────────────────────────────────────
    const openGroupChannel = (ch: GroupChannel) => {
        setActiveChannel(ch.id);
        setActiveLabel(`#${ch.label}`);
        setView('group');
        setShowChannelPicker(false);
        loadMessages(ch.id);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // ── Open an existing DM ──────────────────────────────────────────────
    const openConversation = (conv: Conversation) => {
        if (!conv.otherUser) return;
        const channel = conv.channel;
        setActiveChannel(channel);
        setActiveLabel(`${conv.otherUser.firstName} ${conv.otherUser.lastName}`);
        setView('dm');
        loadMessages(channel);
        socketRef.current?.emit('join-chat', channel);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // ── Start a new DM with a staff member ───────────────────────────────
    const startDM = async (staff: StaffMember) => {
        const channel = buildDmChannel(user.id, staff.id);
        setActiveChannel(channel);
        setActiveLabel(`${staff.firstName} ${staff.lastName}`);
        setView('dm');
        setMessages([]);
        // Tell server to join/ready the DM room, then load history
        socketRef.current?.emit('start-dm', staff.id);
        loadMessages(channel);
        setStaffSearch('');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const loadAllStaff = async () => {
        if (allStaff.length > 0) return;
        try {
            const res = await api.get('/chat/staff');
            setAllStaff(res.data);
        } catch { /* silent */ }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const content = inputText.trim();
        if (!content || !socketRef.current || !user) return;
        socketRef.current.emit('send-message', {
            roomId: activeChannel,
            message: content,
            senderName: `${user.firstName} ${user.lastName}`,
            senderId: user.id,
        });
        setInputText('');
    };

    const goHome = () => {
        setView('home');
        setActiveChannel('');
        setMessages([]);
        setChannelError(null);
        loadHomeData();
    };

    const filteredStaff = allStaff.filter(s =>
        !staffSearch ||
        `${s.firstName} ${s.lastName} ${s.role} ${s.department ?? ''}`.toLowerCase()
            .includes(staffSearch.toLowerCase())
    );

    const myConvPartners = new Set(conversations.map(c => c.otherUser?.id));

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
                    style={{ height: 520 }}>

                    {/* ── Header ── */}
                    <div className="bg-sky-500 text-white px-4 py-3 flex items-center gap-2 shrink-0">
                        {(view === 'group' || view === 'dm' || view === 'new-dm') && (
                            <button onClick={goHome}
                                className="p-1 hover:bg-sky-600/50 rounded-lg transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                        )}

                        {view === 'home' && (
                            <div className="flex items-center gap-2 flex-1">
                                <MessageCircle size={18} />
                                <span className="font-bold text-sm">Staff Chat</span>
                            </div>
                        )}

                        {view === 'group' && (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <div className="relative">
                                    <button onClick={() => setShowChannelPicker(v => !v)}
                                        className="font-bold text-sm flex items-center gap-1 hover:bg-sky-600/50 px-1.5 py-0.5 rounded">
                                        {activeLabel} <ChevronDown size={13} />
                                    </button>
                                    {showChannelPicker && (
                                        <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-gray-800 z-50">
                                            {groupChannels.map(c => (
                                                <button key={c.id} onClick={() => openGroupChannel(c)}
                                                    className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${activeChannel === c.id ? 'font-bold text-sky-500 bg-sky-50' : ''}`}>
                                                    <Hash size={12} /> {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {view === 'dm' && (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <UserCircle2 size={16} className="shrink-0" />
                                <span className="font-bold text-sm truncate">{activeLabel}</span>
                            </div>
                        )}

                        {view === 'new-dm' && (
                            <span className="font-bold text-sm flex-1">New Direct Message</span>
                        )}

                        <div className="flex items-center gap-1 ml-auto">
                            <button onClick={() => setSoundEnabled(v => !v)}
                                className="p-1.5 hover:bg-sky-600/50 rounded-lg transition-colors"
                                title={soundEnabled ? 'Mute' : 'Unmute'}>
                                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                            </button>
                            <button onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-sky-600/50 rounded-lg transition-colors">
                                <X size={17} />
                            </button>
                        </div>
                    </div>

                    {/* ── Error banner ── */}
                    {channelError && (
                        <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-xs text-red-600 flex items-center gap-1.5 shrink-0">
                            <Lock size={11} className="shrink-0" /> {channelError}
                        </div>
                    )}

                    {/* ── HOME view ── */}
                    {view === 'home' && (
                        <div className="flex-1 overflow-y-auto">
                            {/* Group channels */}
                            <div className="px-3 pt-3 pb-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-1.5">Channels</p>
                                {groupChannels.map(c => (
                                    <button key={c.id} onClick={() => openGroupChannel(c)}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-left">
                                        <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                                            #
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{c.label}</p>
                                            <p className="text-[11px] text-gray-400">Group channel</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 mx-3 my-2" />

                            {/* Direct messages */}
                            <div className="px-3 pb-3">
                                <div className="flex items-center justify-between px-1 mb-1.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Direct Messages</p>
                                    <button
                                        onClick={() => { setView('new-dm'); loadAllStaff(); }}
                                        className="text-[10px] font-semibold text-sky-500 hover:text-sky-700 flex items-center gap-0.5">
                                        + New
                                    </button>
                                </div>

                                {conversations.length === 0 && (
                                    <div className="text-center py-4 text-gray-400 text-xs">
                                        No conversations yet.
                                        <button onClick={() => { setView('new-dm'); loadAllStaff(); }}
                                            className="block mx-auto mt-1.5 text-sky-500 hover:underline">
                                            Start a DM →
                                        </button>
                                    </div>
                                )}

                                {conversations.map((conv) => {
                                    if (!conv.otherUser) return null;
                                    const color = ROLE_COLOR[conv.otherUser.role] ?? 'text-gray-600';
                                    const bg = ROLE_BG[conv.otherUser.role] ?? 'bg-gray-100';
                                    return (
                                        <button key={conv.channel} onClick={() => openConversation(conv)}
                                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-left">
                                            <div className={`w-8 h-8 ${bg} ${color} rounded-full flex items-center justify-center text-xs font-bold shrink-0`}>
                                                {conv.otherUser.firstName[0]}{conv.otherUser.lastName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {conv.otherUser.firstName} {conv.otherUser.lastName}
                                                </p>
                                                <p className="text-[11px] text-gray-400 truncate">
                                                    {conv.lastMessage?.content ?? 'No messages yet'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── NEW DM — staff picker ── */}
                    {view === 'new-dm' && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="px-3 py-2 border-b border-gray-100 shrink-0">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search staff by name or role..."
                                        value={staffSearch}
                                        onChange={e => setStaffSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto py-1">
                                {filteredStaff.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm py-8">
                                        {staffSearch ? 'No staff found' : 'Loading staff...'}
                                    </p>
                                )}
                                {filteredStaff.map(s => {
                                    const color = ROLE_COLOR[s.role] ?? 'text-gray-600';
                                    const bg = ROLE_BG[s.role] ?? 'bg-gray-100';
                                    const hasConv = myConvPartners.has(s.id);
                                    return (
                                        <button key={s.id} onClick={() => startDM(s)}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                                            <div className={`w-9 h-9 ${bg} ${color} rounded-full flex items-center justify-center text-sm font-bold shrink-0`}>
                                                {s.firstName[0]}{s.lastName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {s.firstName} {s.lastName}
                                                    </p>
                                                    {hasConv && (
                                                        <span className="text-[9px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full font-medium">Active</span>
                                                    )}
                                                </div>
                                                <p className={`text-[11px] font-medium ${color}`}>
                                                    {s.role.replace('_', ' ')}
                                                    {s.department ? ` · ${s.department}` : ''}
                                                </p>
                                            </div>
                                            <Users size={13} className="text-gray-300 shrink-0" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── MESSAGES (group or DM) ── */}
                    {(view === 'group' || view === 'dm') && (
                        <>
                            <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-2.5">
                                {loadingMessages && (
                                    <div className="text-center text-gray-400 text-sm py-8">Loading...</div>
                                )}
                                {!loadingMessages && messages.length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        No messages yet. Say hello!
                                    </div>
                                )}
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user.id;
                                    const roleColor = ROLE_COLOR[msg.senderRole ?? ''] ?? 'text-gray-500';
                                    return (
                                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && (
                                                <div className={`text-[10px] font-semibold mb-0.5 px-1 ${roleColor}`}>
                                                    {msg.senderName}
                                                    {msg.senderRole && (
                                                        <span className="text-gray-400 font-normal ml-1">
                                                            · {msg.senderRole.replace('_', ' ').toLowerCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm
                                                ${isMe ? 'bg-sky-500 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'}`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder={view === 'dm' ? `Message ${activeLabel}...` : `Message ${activeLabel}...`}
                                    maxLength={2000}
                                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                                />
                                <button type="submit" disabled={!inputText.trim()}
                                    className="bg-sky-500 text-white p-2.5 rounded-xl hover:bg-sky-600 disabled:opacity-40 transition-colors shrink-0">
                                    <Send size={15} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* ── Toggle button ── */}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)}
                    className="bg-sky-500 text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all relative">
                    <MessageCircle size={22} />
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
