import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
    Plus, Package, TrendingUp, Eye, Edit2, Trash2, ChevronDown,
    Leaf, MapPin, DollarSign, AlertCircle, CheckCircle, X, Cloud,
    ClipboardList, ArrowRight, Sparkles, Bell
} from 'lucide-react';

const CATEGORIES = ['vegetable', 'fruit', 'grain', 'pulse', 'spice', 'oilseed', 'other'];
const STATUS_OPTIONS = ['sowing', 'growing', 'harvesting', 'ready', 'sold'];
const SOIL_TYPES = ['clay', 'sandy', 'loamy', 'silt', 'peat', 'chalk', 'other'];
const IRRIGATION = ['rainfed', 'drip', 'sprinkler', 'canal', 'other'];

const STATUS_COLORS = {
    sowing: 'bg-yellow-500/20 text-yellow-400',
    growing: 'bg-emerald-500/20 text-emerald-400',
    harvesting: 'bg-orange-500/20 text-orange-400',
    ready: 'bg-sky-500/20 text-sky-400',
    sold: 'bg-slate-500/20 text-slate-400',
};

const AIRecommendations = [
    { crop: 'Wheat', reason: 'High demand in Delhi markets this season', confidence: 92 },
    { crop: 'Tomato', reason: 'Price surge predicted in next 2 weeks', confidence: 87 },
    { crop: 'Onion', reason: 'Optimal soil + climate match for your region', confidence: 81 },
];

export default function FarmerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [crops, setCrops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCrop, setEditCrop] = useState(null);
    const [form, setForm] = useState({ name: '', category: 'grain', quantity: '', unit: 'kg', pricePerUnit: '', description: '', growthStatus: 'sowing', soilType: 'loamy', irrigationType: 'rainfed', harvestDate: '' });
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [cropsRes, ordersRes, notifRes] = await Promise.all([
                api.get('/crops/my'),
                api.get('/orders/my'),
                api.get('/notifications')
            ]);
            setCrops(cropsRes.data);
            setOrders(ordersRes.data);
            setNotifications(notifRes.data.slice(0, 5));
        } catch (err) {
            console.error('Fetch error:', err);
            showToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const openAdd = () => { setEditCrop(null); setForm({ name: '', category: 'grain', quantity: '', unit: 'kg', pricePerUnit: '', description: '', growthStatus: 'sowing', soilType: 'loamy', irrigationType: 'rainfed', harvestDate: '' }); setShowModal(true); };
    const openEdit = (c) => { setEditCrop(c); setForm({ name: c.name, category: c.category, quantity: c.quantity, unit: c.unit, pricePerUnit: c.pricePerUnit, description: c.description || '', growthStatus: c.growthStatus, soilType: c.soilType || 'loamy', irrigationType: c.irrigationType || 'rainfed', harvestDate: c.harvestDate ? c.harvestDate.substring(0, 10) : '' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editCrop) {
                await api.put(`/crops/${editCrop.id}`, form);
                showToast('Crop updated successfully!');
            } else {
                await api.post('/crops', form);
                showToast('Crop listed successfully!');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this crop listing?')) return;
        try {
            await api.delete(`/crops/${id}`);
            showToast('Crop deleted');
            fetchData();
        } catch {
            showToast('Delete failed', 'error');
        }
    };

    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

    const stats = [
        { label: 'Total Listings', value: crops.length, icon: <Package size={20} />, color: 'from-emerald-500 to-teal-500' },
        { label: 'Pending Orders', value: pendingOrdersCount, icon: <ClipboardList size={20} />, color: 'from-amber-500 to-orange-500', link: '/orders' },
        { label: 'Ready to Sell', value: crops.filter(c => c.growthStatus === 'ready').length, icon: <CheckCircle size={20} />, color: 'from-sky-500 to-blue-500' },
        { label: 'Total Views', value: crops.reduce((s, c) => s + (c.views || 0), 0), icon: <Eye size={20} />, color: 'from-violet-500 to-purple-500' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0f1e] pt-20 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Farmer Dashboard</h1>
                        <p className="text-slate-400 mt-1">Welcome back, <span className="text-emerald-400 font-medium">{user?.name}</span></p>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 transition-all">
                        <Plus size={18} /> Add Crop
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((s, i) => (
                        <div key={i} className={`glass rounded-2xl p-5 card-hover relative group ${s.link ? 'cursor-pointer' : ''}`} onClick={() => s.link && navigate(s.link)}>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
                            <div className="text-2xl font-bold text-white">{s.value}</div>
                            <div className="text-slate-400 text-sm">{s.label}</div>
                            {s.link && (
                                <ArrowRight size={14} className="absolute top-5 right-5 text-slate-500 opacity-0 group-hover:opacity-100 transition-all" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Crop Listings */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-semibold text-white mb-4">My Crop Listings</h2>
                        {loading ? (
                            <div className="glass rounded-2xl p-12 flex justify-center"><span className="spinner" /></div>
                        ) : crops.length === 0 ? (
                            <div className="glass rounded-2xl p-12 text-center">
                                <Leaf size={48} className="text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No crop listings yet. Add your first crop!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {crops.map(c => (
                                    <div key={c.id} className="glass rounded-2xl p-5 card-hover flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                                            <Leaf size={22} className="text-emerald-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-white">{c.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.growthStatus]}`}>{c.growthStatus}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-400">{c.category}</span>
                                            </div>
                                            <div className="flex gap-4 mt-1 text-sm text-slate-400">
                                                <span>₹{c.pricePerUnit}/{c.unit}</span>
                                                <span>{c.quantity} {c.unit}</span>
                                                {c.location?.city && <span className="flex items-center gap-1"><MapPin size={12} />{c.location.city}</span>}
                                                <span className="flex items-center gap-1"><Eye size={12} />{c.views || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(c)}
                                                className="p-2 rounded-lg hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(c.id)}
                                                className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Notifications Summary */}
                        <div className="glass rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-white flex items-center gap-2">
                                    <Bell size={18} className="text-emerald-400" /> Recent Alerts
                                </h2>
                                <Link to="/orders" className="text-[10px] text-emerald-400 hover:underline uppercase tracking-wider font-bold">
                                    View All
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {notifications.length === 0 ? (
                                    <p className="text-slate-500 text-xs italic py-4 text-center">No recent alerts</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10" onClick={() => n.link && navigate(n.link)}>
                                            <p className={`text-xs font-bold ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>{n.title}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                            <span className="text-[9px] text-slate-600 mt-2 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* AI Recommendations */}
                        <div className="glass rounded-2xl p-6 border border-emerald-500/10">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Sparkles size={18} className="text-amber-400" /> AI Insights
                            </h2>
                            <div className="space-y-3">
                                {AIRecommendations.map((r, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-white text-sm">{r.crop}</span>
                                            <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-400/10">{r.confidence}% Match</span>
                                        </div>
                                        <p className="text-slate-400 text-xs leading-relaxed">{r.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weather card */}
                        <div className="glass rounded-2xl p-6 border border-sky-500/10 bg-sky-500/3">
                            <div className="flex items-center gap-2 mb-3">
                                <Cloud size={18} className="text-sky-400" />
                                <span className="text-sm font-semibold text-white">Weather Alert</span>
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed">Light rainfall expected in Maharashtra over next 3 days. Good for sowing wheat and rabi crops.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-white">{editCrop ? 'Edit Crop' : 'Add New Crop'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Crop Name *</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Wheat"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Category *</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Quantity *</label>
                                    <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required placeholder="500"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Unit</label>
                                    <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                                        <option value="kg">kg</option><option value="quintal">quintal</option><option value="ton">ton</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Price/Unit (₹) *</label>
                                    <input type="number" value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value })} required placeholder="25"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Growth Status</label>
                                    <select value={form.growthStatus} onChange={e => setForm({ ...form, growthStatus: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Harvest Date</label>
                                    <input type="date" value={form.harvestDate} onChange={e => setForm({ ...form, harvestDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Soil Type</label>
                                    <select value={form.soilType} onChange={e => setForm({ ...form, soilType: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                                        {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Irrigation</label>
                                    <select value={form.irrigationType} onChange={e => setForm({ ...form, irrigationType: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                                        {IRRIGATION.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Any additional details..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all resize-none" />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 glass hover:bg-white/10 transition-all">Cancel</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting ? <span className="spinner" /> : (editCrop ? 'Update Crop' : 'Add Crop')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg slide-in-up ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                    {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
