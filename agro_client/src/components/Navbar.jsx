import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
    Leaf, ShoppingCart, BarChart2, FlaskConical,
    MessageSquare, User, LogOut, Menu, X, Bell, ClipboardList, Stethoscope,
    Trash2, Check, ExternalLink, Clock
} from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notifRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Notification fetching
    useEffect(() => {
        if (!user) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (err) { console.error('Notif error:', err); }
    };

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) { console.error(err); }
    };

    const deleteNotif = async (e, id) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) { console.error(err); }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const navLinks = [
        { to: '/crops', label: 'Crops', icon: <Leaf size={16} /> },
        { to: '/market', label: 'Market', icon: <BarChart2 size={16} /> },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center">
                            <Leaf size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">AgroMedius</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                            >
                                {link.icon}
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <>
                                {user.role === 'farmer' && (
                                    <>
                                        <Link to="/farmer" className="px-3 py-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                                            Dashboard
                                        </Link>
                                        <Link to="/ai-doctor" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                                            <Stethoscope size={16} /> AI Doctor
                                        </Link>
                                    </>
                                )}
                                {user.role === 'wholesaler' && (
                                    <Link to="/wholesaler" className="px-3 py-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors">
                                        Dashboard
                                    </Link>
                                )}
                                <Link to="/orders" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300" title="My Orders">
                                    <ClipboardList size={18} />
                                </Link>

                                {/* Notification Bell */}
                                <div className="relative" ref={notifRef}>
                                    <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300 relative">
                                        <Bell size={18} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#0a0f1e]">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown Panel */}
                                    {notifOpen && (
                                        <div className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                    <Bell size={14} className="text-emerald-400" /> Notifications
                                                </h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={async () => {
                                                        await api.put('/notifications/read-all');
                                                        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                                                    }} className="text-[10px] text-emerald-400 hover:underline uppercase tracking-wider font-bold">
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-[350px] overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center">
                                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                                            <Bell size={16} className="text-slate-600" />
                                                        </div>
                                                        <p className="text-slate-500 text-xs">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div key={n.id} onClick={() => markRead(n.id)}
                                                            className={`p-4 border-b border-white/5 transition-all hover:bg-white/5 cursor-pointer relative group ${!n.isRead ? 'bg-emerald-500/[0.03]' : ''}`}>
                                                            {!n.isRead && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-full" />}
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div>
                                                                    <p className={`text-xs font-bold ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>{n.title}</p>
                                                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                                                                    <div className="flex items-center gap-3 mt-2">
                                                                        <span className="text-[9px] text-slate-600 flex items-center gap-1">
                                                                            <Clock size={10} /> {new Date(n.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                        {n.link && (
                                                                            <Link to={n.link} className="text-[9px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5" onClick={() => setNotifOpen(false)}>
                                                                                <ExternalLink size={10} /> View details
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <button onClick={(e) => deleteNotif(e, n.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all">
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <div className="p-2 border-t border-white/5 text-center bg-white/5">
                                                    <Link to="/profile" onClick={() => setNotifOpen(false)} className="text-[10px] text-slate-500 hover:text-white transition-colors">
                                                        View all settings
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Link to="/profile" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300">
                                    <User size={18} />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:opacity-90 transition-opacity"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 text-slate-300" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden glass border-t border-white/10 px-4 py-3 space-y-1">
                    {navLinks.map(link => (
                        <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition-all">
                            {link.icon} {link.label}
                        </Link>
                    ))}
                    {user ? (
                        <>
                            <Link to={user.role === 'farmer' ? '/farmer' : '/wholesaler'} onClick={() => setMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-emerald-400">Dashboard</Link>
                            <Link to="/orders" onClick={() => setMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-slate-300">My Orders</Link>
                            <Link to="/messages" onClick={() => setMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-slate-300">Messages</Link>
                            <Link to="/profile" onClick={() => setMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-slate-300">Profile</Link>
                            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-300">Login</Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}
                                className="block px-3 py-2 text-sm font-semibold text-emerald-400">Get Started</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

