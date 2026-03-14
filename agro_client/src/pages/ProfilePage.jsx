import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { User, Mail, Phone, MapPin, Save, AlertCircle, CheckCircle, Leaf } from 'lucide-react';

export default function ProfilePage() {
    const { user, logout, updateUser } = useAuth();
    const [form, setForm] = useState({ name: '', phone: '', city: '', state: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                phone: user.phone || '',
                city: user.location?.city || '',
                state: user.location?.state || '',
            });
        }
    }, [user]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/auth/profile', {
                name: form.name,
                phone: form.phone,
                location: { city: form.city, state: form.state }
            });
            // Update token + user data in context & localStorage
            if (data.token) localStorage.setItem('agroToken', data.token);
            updateUser({ name: data.name, phone: data.phone, location: data.location });
            showToast('Profile updated successfully!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Update failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const roleColor = user?.role === 'farmer' ? 'from-emerald-500 to-teal-500' : 'from-sky-500 to-blue-500';

    return (
        <div className="min-h-screen bg-[#0a0f1e] pt-20 px-4 pb-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

                {/* Profile Header Card */}
                <div className="glass rounded-2xl p-6 mb-5 flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-3xl font-black`}>
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                        <p className="text-slate-400 text-sm">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${roleColor} text-white font-semibold capitalize`}>
                                {user?.role}
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">✓ Active</span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-5">Edit Information</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1.5 block">Email (read-only)</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input value={user?.email || ''} disabled
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-slate-500 text-sm opacity-60 cursor-not-allowed" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1.5 block">Phone Number</label>
                            <div className="relative">
                                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm text-slate-400 mb-1.5 block">City</label>
                                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Mumbai"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1.5 block">State</label>
                                <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 disabled:opacity-50 transition-all mt-2">
                            {loading ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
                        </button>
                    </form>
                </div>

                {/* Logout */}
                <button onClick={logout}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-medium text-red-400 glass border border-red-500/20 hover:bg-red-500/10 transition-all">
                    Logout from AgroMedius
                </button>
            </div>

            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg slide-in-up ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                    {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
