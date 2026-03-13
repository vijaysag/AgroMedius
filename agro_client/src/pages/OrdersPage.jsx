import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
    Package, DollarSign, Calendar, RefreshCcw, ClipboardList,
    CheckCircle, XCircle, Truck, Star, ShoppingBag, ChevronDown,
    AlertCircle, Clock
} from 'lucide-react';

const STATUS_CONFIG = {
    pending: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Pending', icon: Clock },
    accepted: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Accepted', icon: CheckCircle },
    rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Rejected', icon: XCircle },
    cancelled: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Cancelled', icon: XCircle },
};

const FARMER_ACTIONS = [
    { status: 'accepted', label: '✅ Accept', cls: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30' },
    { status: 'rejected', label: '❌ Reject', cls: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30' },
    { status: 'cancelled', label: '🚫 Cancel', cls: 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 border-slate-500/30' },
];

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    const isFarmer = user?.role === 'farmer';

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/orders/my');
            setOrders(data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const updateOrder = async (orderId, body) => {
        try {
            await api.put(`/orders/${orderId}`, body);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...body } : o));
            if (body.status) showToast(`Order ${body.status}!`);
            if (body.paymentStatus === 'paid') showToast('Payment marked as paid ✅');
        } catch (err) {
            showToast(err.response?.data?.message || 'Update failed', 'error');
        }
    };

    // Filter tabs
    const tabs = [{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'accepted', label: 'Accepted' }];

    const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

    // Summary counts
    const pending = orders.filter(o => o.status === 'pending').length;

    return (
        <div className="min-h-screen bg-[#0a0f1e] pt-24 px-4 pb-12">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
                            <ClipboardList className="text-emerald-500" size={36} />
                            {isFarmer ? 'Order Management' : 'My Orders'}
                        </h1>
                        <p className="text-slate-400 text-lg mt-1">
                            {isFarmer ? 'Review and manage incoming crop booking requests' : 'Track the lifecycle of your crop bookings'}
                        </p>
                    </div>
                    <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-slate-300 text-sm hover:bg-white/10 transition-all self-start">
                        <RefreshCcw size={14} /> Refresh
                    </button>
                </div>

                {/* Farmer Alert Banner — pending orders */}
                {isFarmer && pending > 0 && (
                    <div className="glass rounded-2xl p-4 mb-6 border border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                        <AlertCircle className="text-amber-400 shrink-0" size={20} />
                        <div>
                            <p className="text-amber-300 font-semibold text-sm">{pending} order{pending > 1 ? 's' : ''} awaiting your approval</p>
                            <p className="text-amber-400/70 text-xs mt-0.5">Review and accept or reject incoming bookings from buyers.</p>
                        </div>
                        <button onClick={() => setActiveTab('pending')} className="ml-auto px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all border border-amber-500/30">
                            View Now
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t.key ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass text-slate-400 hover:text-white border border-transparent'}`}>
                            {t.label}
                            {t.key === 'pending' && pending > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs">{pending}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex justify-center py-20"><RefreshCcw className="animate-spin text-emerald-500" size={40} /></div>
                ) : filtered.length === 0 ? (
                    <div className="glass rounded-3xl p-20 text-center border border-white/5">
                        <Package size={64} className="text-slate-600 mx-auto mb-4" />
                        <h3 className="text-white text-2xl font-bold">No Orders Found</h3>
                        <p className="text-slate-500 mt-2 text-lg">
                            {activeTab === 'all'
                                ? isFarmer ? 'No bookings yet. Your crop listings will appear here once buyers place orders.'
                                    : 'Start browsing crops and booking fresh produce!'
                                : `No ${activeTab} orders right now.`}
                        </p>
                        {activeTab === 'all' && !isFarmer && (
                            <Link to="/crops" className="inline-block mt-6 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 transition-all">
                                Browse Crops →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(order => {
                            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const StatusIcon = cfg.icon;
                            const isPending = order.status === 'pending';

                            return (
                                <div key={order.id}
                                    className={`glass rounded-2xl border transition-all ${isPending && isFarmer ? 'border-amber-500/30 bg-amber-500/3 shadow-lg shadow-amber-500/5' : 'border-white/5 hover:border-emerald-500/20'}`}>

                                    {/* Farmer pending highlight */}
                                    {isFarmer && isPending && (
                                        <div className="px-6 pt-4 pb-0 flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-widest">
                                            <AlertCircle size={12} /> New Booking — Awaiting Your Response
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {/* Order Info Row */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isPending ? 'bg-amber-500/10' : 'bg-gradient-to-br from-emerald-500/20 to-sky-500/20'}`}>
                                                    {isPending ? '⏳' : <ShoppingBag size={24} className="text-emerald-400" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">{order.crop?.name || 'Unknown Crop'}</h3>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mt-1">
                                                        <span className="flex items-center gap-1"><Calendar size={13} className="text-sky-400" /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span className="flex items-center gap-1"><DollarSign size={13} className="text-emerald-400" /> ₹{order.totalPrice?.toLocaleString()}</span>
                                                        <span className="font-semibold text-emerald-300">Qty: {order.quantity} {order.crop?.unit || order.unit || 'kg'}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {isFarmer ? `👤 Buyer: ${order.buyer?.name || 'Anonymous'} · ${order.buyer?.phone || ''}` : `🌾 Farmer: ${order.farmer?.name || 'Verified Farmer'}`}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status + Payment */}
                                            <div className="flex flex-col md:items-end gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${cfg.color}`}>
                                                        <StatusIcon size={11} /> {cfg.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ─── FARMER ACTIONS ─── */}
                                        {isFarmer && (
                                            <div className="border-t border-white/5 pt-4">
                                                {isPending ? (
                                                    // Big accept/reject buttons for pending
                                                    <div className="flex flex-wrap gap-3">
                                                        <button onClick={() => updateOrder(order.id, { status: 'accepted' })}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all">
                                                            <CheckCircle size={16} /> Accept Order
                                                        </button>
                                                        <button onClick={() => updateOrder(order.id, { status: 'rejected' })}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all">
                                                            <XCircle size={16} /> Reject Order
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-slate-500 text-xs italic">
                                                        {order.status === 'accepted' ? '✅ Order accepted.' : '🚫 Order closed.'}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ─── BUYER STATUS TIMELINE ─── */}
                                        {!isFarmer && (
                                            <div className="border-t border-white/5 pt-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {['pending', 'accepted'].map((s, i, arr) => {
                                                        const idx = arr.indexOf(order.status);
                                                        const done = i <= idx && order.status !== 'rejected' && order.status !== 'cancelled';
                                                        return (
                                                            <div key={s} className="flex items-center gap-2">
                                                                <div className={`w-2.5 h-2.5 rounded-full transition-all ${done ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                                                <span className={`text-xs capitalize ${done ? 'text-emerald-400' : 'text-slate-600'}`}>{s}</span>
                                                                {i < arr.length - 1 && <div className={`h-px w-6 ${done && i < idx ? 'bg-emerald-500/50' : 'bg-white/10'}`} />}
                                                            </div>
                                                        );
                                                    })}
                                                    {(order.status === 'rejected' || order.status === 'cancelled') && (
                                                        <span className="text-red-400 text-xs font-semibold capitalize ml-2">⚠ {order.status}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                    {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
