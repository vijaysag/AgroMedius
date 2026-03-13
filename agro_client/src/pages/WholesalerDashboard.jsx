import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Search, MapPin, DollarSign, Filter, Leaf, Eye, ChevronRight, Sparkles, ClipboardList, Clock, CheckCircle, Bell } from 'lucide-react';

const STATUS_COLORS = {
    sowing: 'bg-yellow-500/20 text-yellow-400',
    growing: 'bg-emerald-500/20 text-emerald-400',
    harvesting: 'bg-orange-500/20 text-orange-400',
    ready: 'bg-sky-500/20 text-sky-400',
    sold: 'bg-slate-500/20 text-slate-400',
};

const AISuggestions = [
    { crop: 'Tomato', region: 'Maharashtra', reason: 'High demand, below-average supply expected', badge: 'Best Buy' },
    { crop: 'Wheat', region: 'Punjab', reason: 'New harvest arriving — lock in early prices', badge: 'Trending' },
    { crop: 'Onion', region: 'Nashik', reason: 'Price dip window — optimal bulk purchase time', badge: 'Value Deal' },
];

export default function WholesalerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [crops, setCrops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [city, setCity] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, limit: 9, sort });
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (city) params.append('city', city);

            const [cropsRes, ordersRes, notifRes] = await Promise.all([
                api.get(`/crops?${params}`),
                api.get('/orders/my'),
                api.get('/notifications')
            ]);

            setCrops(cropsRes.data.crops);
            setTotalPages(cropsRes.data.pages);
            setTotal(cropsRes.data.total);
            setOrders(ordersRes.data.slice(0, 3)); // Only show top 3 recent orders
            setNotifications(notifRes.data.slice(0, 3));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, sort, search, category, city]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="min-h-screen bg-[#0a0f1e] pt-20 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Wholesaler Dashboard</h1>
                        <p className="text-slate-400 mt-1">Welcome, <span className="text-sky-400 font-medium">{user?.name}</span> — find your next deal</p>
                    </div>
                    <Link to="/orders" className="text-sm text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 group">
                        My Orders <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* AI Suggestions */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-amber-400" />
                            <h2 className="text-lg font-semibold text-white">AI-Based Purchase Suggestions</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {AISuggestions.map((s, i) => (
                                <div key={i} className="glass rounded-2xl p-4 card-hover border border-amber-500/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-white">{s.crop}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">{s.badge}</span>
                                    </div>
                                    <p className="text-sky-400 text-xs flex items-center gap-1 mb-1"><MapPin size={11} />{s.region}</p>
                                    <p className="text-slate-400 text-xs leading-relaxed">{s.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity Sidebar */}
                    <div className="space-y-6">
                        {/* Notifications */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Bell size={18} className="text-emerald-400" />
                                <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
                            </div>
                            <div className="glass rounded-2xl p-4 border border-white/5 space-y-3">
                                {notifications.length === 0 ? (
                                    <p className="text-slate-500 text-sm py-4 text-center italic">No recent alerts</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10" onClick={() => n.link && navigate(n.link)}>
                                            <p className={`text-xs font-bold ${!n.isRead ? 'text-white' : 'text-slate-400'}`}>{n.title}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Orders Summary */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <ClipboardList size={18} className="text-sky-400" />
                                <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
                            </div>
                            <div className="glass rounded-2xl p-4 border border-white/5 space-y-3">
                                {orders.length === 0 ? (
                                    <p className="text-slate-500 text-sm py-4 text-center italic">No recent bookings</p>
                                ) : (
                                    orders.map(o => (
                                        <div key={o.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/orders')}>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                    <Leaf size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{o.crop?.name}</p>
                                                    <p className="text-[10px] text-slate-500">₹{o.totalPrice?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${o.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {o.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                                {orders.length > 0 && (
                                    <button onClick={() => navigate('/orders')} className="w-full mt-2 py-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                        View All Orders
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search crops..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all" />
                    </div>
                    <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                        className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50 min-w-32">
                        <option value="">All Categories</option>
                        {['vegetable', 'fruit', 'grain', 'pulse', 'spice', 'oilseed', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={city} onChange={e => { setCity(e.target.value); setPage(1); }} placeholder="Filter by city..."
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all min-w-36" />
                    <select value={sort} onChange={e => setSort(e.target.value)}
                        className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500/50">
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low→High</option>
                        <option value="price_desc">Price: High→Low</option>
                    </select>
                </div>

                <div className="text-slate-400 text-sm mb-4">{total} crop listings found</div>

                {/* Crops Grid */}
                {loading ? (
                    <div className="flex justify-center py-24"><span className="spinner" style={{ width: 36, height: 36 }} /></div>
                ) : crops.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <Leaf size={48} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No crops found. Try adjusting your filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {crops.map(c => (
                                <div key={c.id} className="glass rounded-2xl p-5 card-hover flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                            <Leaf size={22} className="text-emerald-400" />
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.growthStatus]}`}>{c.growthStatus}</span>
                                    </div>
                                    <h3 className="font-bold text-white text-lg">{c.name}</h3>
                                    <p className="text-slate-500 text-xs capitalize mb-3">{c.category}</p>
                                    <div className="space-y-1.5 text-sm text-slate-400 flex-1">
                                        <div className="flex items-center gap-1.5"><DollarSign size={13} className="text-emerald-400" /><span className="text-emerald-300 font-semibold">₹{c.pricePerUnit}/{c.unit}</span></div>
                                        <div className="flex items-center gap-1.5"><span>Qty:</span><span className="text-white">{c.quantity} {c.unit}</span></div>
                                        {c.location?.city && <div className="flex items-center gap-1.5"><MapPin size={12} className="text-sky-400" /><span>{c.location.city}, {c.location.state}</span></div>}
                                        <div className="flex items-center gap-1.5 text-slate-500"><span>by</span><span className="text-slate-300">{c.farmer?.name}</span></div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Link to={`/crops/${c.id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:opacity-90 transition-all">
                                            <Eye size={14} /> View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-4 py-2 rounded-lg glass text-sm text-slate-300 hover:bg-white/10 disabled:opacity-30 transition-all">← Prev</button>
                                <span className="text-slate-400 text-sm px-4">Page {page} of {totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg glass text-sm text-slate-300 hover:bg-white/10 disabled:opacity-30 transition-all">Next →</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
