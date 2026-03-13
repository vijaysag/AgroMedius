import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Send, MessageSquare, User } from 'lucide-react';

export default function MessagesPage() {
    const { user } = useAuth();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const toId = params.get('to');
    const toName = params.get('name');

    const [conversations, setConversations] = useState([]);
    const [activeUser, setActiveUser] = useState(toId ? { id: toId, name: toName } : null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await api.get('/messages');
            setConversations(data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        }
    }, []);

    const fetchMessages = useCallback(async (userId) => {
        try {
            const { data } = await api.get(`/messages/${userId}`);
            setMessages(data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchConversations(); }, [fetchConversations]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { if (activeUser) fetchMessages(activeUser.id); }, [activeUser, fetchMessages]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() || !activeUser) return;
        setSending(true);
        try {
            await api.post('/messages', { receiverId: activeUser.id, content: text.trim() });
            setText('');
            fetchMessages(activeUser.id);
        } catch (err) {
            console.error('Error sending message:', err);
        }
        setSending(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] pt-20 px-4 pb-4">
            <div className="max-w-5xl mx-auto h-[calc(100vh-96px)] flex gap-4">
                {/* Conversations List */}
                <div className="w-72 glass rounded-2xl p-4 flex flex-col">
                    <h2 className="text-white font-semibold mb-4">Messages</h2>
                    {conversations.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <MessageSquare size={36} className="text-slate-600 mb-2" />
                            <p className="text-slate-500 text-sm">No conversations yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2 flex-1 overflow-y-auto">
                            {conversations.map((c, i) => (
                                <button key={i} onClick={() => setActiveUser({ id: c.id, name: c.name || 'User' })}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${activeUser?.id === c.id ? 'bg-emerald-500/20 border border-emerald-500/30' : 'hover:bg-white/5'}`}>
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {(c.name || 'U')[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white text-sm font-medium truncate">{c.name || 'User'}</div>
                                        <div className="text-slate-500 text-xs truncate">{c.lastMessage}</div>
                                    </div>
                                    {c.unread > 0 && (
                                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">{c.unread}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Window */}
                <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
                    {activeUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white font-bold">
                                    {activeUser.name[0]}
                                </div>
                                <span className="font-semibold text-white">{activeUser.name}</span>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 && (
                                    <div className="text-center text-slate-500 text-sm py-8">No messages yet. Say hello! 👋</div>
                                )}
                                {messages.map((m, i) => {
                                    const isMe = m.sender?.id === user?.id || m.sender === user?.id || m.sender?.id === user?._id || m.sender === user?._id;
                                    return (
                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-gradient-to-br from-emerald-500 to-sky-500 text-white' : 'glass text-slate-200'}`}>
                                                {m.content}
                                                <div className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-slate-500'}`}>
                                                    {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-2">
                                <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
                                <button type="submit" disabled={sending || !text.trim()}
                                    className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white disabled:opacity-40 transition-all hover:opacity-90">
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                            <MessageSquare size={48} className="text-slate-600" />
                            <p className="text-slate-400">Select a conversation or contact a farmer from a crop page</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
