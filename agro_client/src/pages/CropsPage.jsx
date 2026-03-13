import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Search, Leaf, MapPin, DollarSign, Eye, Filter } from 'lucide-react';

const CATEGORIES = ['vegetable', 'fruit', 'grain', 'pulse', 'spice', 'oilseed', 'other'];
const STATUS_COLORS = {
    sowing: 'bg-yellow-500/20 text-yellow-400',
    growing: 'bg-emerald-500/20 text-emerald-400',
    harvesting: 'bg-orange-500/20 text-orange-400',
    ready: 'bg-sky-500/20 text-sky-400',
    sold: 'bg-slate-500/20 text-slate-400',
};

export default function CropsPage() {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [city, setCity] = useState('');
    const [sort, setSort] = useState('newest');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minQty, setMinQty] = useState('');
    const [maxQty, setMaxQty] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    const fetchCrops = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 12, sort });
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (city) params.append('city', city);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (minQty) params.append('minQty', minQty);
            if (maxQty) params.append('maxQty', maxQty);
            const { data } = await api.get(`/crops?${params}`);
            setCrops(data.crops);
            setTotalPages(data.pages);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, sort, search, category, city, minPrice, maxPrice, minQty, maxQty]);

    useEffect(() => { fetchCrops(); }, [fetchCrops]);

    return (
        <div className="min-h-screen bg-[#0a0f1e] pt-20 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Crop Marketplace</h1>
                    <p className="text-slate-400 mt-1">Browse fresh crop listings from verified farmers across India</p>
                </div>

                {/* Search + Filter Bar */}
                <div className="glass rounded-2xl p-4 mb-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-48">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search by crop name..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
                        </div>
                        <select value={sort} onChange={e => setSort(e.target.value)}
                            className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price ↑</option>
                            <option value="price_desc">Price ↓</option>
                        </select>
                        <button onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-all ${showFilters ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass text-slate-300 hover:bg-white/10'}`}>
                            <Filter size={15} /> Filters
                        </button>
                    </div>
                    {showFilters && (
                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/10">
                            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                                className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                                <option value="">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input value={city} onChange={e => { setCity(e.target.value); setPage(1); }} placeholder="City..."
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 min-w-28" />
                            <input type="number" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} placeholder="Min Price"
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-28" />
                            <input type="number" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} placeholder="Max Price (₹)"
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-32" />
                            <input type="number" value={minQty} onChange={e => { setMinQty(e.target.value); setPage(1); }} placeholder="Min Qty"
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-28" />
                            <input type="number" value={maxQty} onChange={e => { setMaxQty(e.target.value); setPage(1); }} placeholder="Max Qty"
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 w-28" />
                        </div>
                    )}
                </div>

                <div className="text-slate-400 text-sm mb-5">{total} crops available</div>

                {loading ? (
                    <div className="flex justify-center py-24"><span className="spinner" style={{ width: 36, height: 36 }} /></div>
                ) : crops.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                        <Leaf size={48} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No crops found matching your search.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {crops.map(c => (
                                <div key={c.id} className="glass rounded-2xl p-4 card-hover flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                            <Leaf size={18} className="text-emerald-400" />
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.growthStatus] || ''}`}>{c.growthStatus}</span>
                                    </div>
                                    <h3 className="font-semibold text-white mb-0.5">{c.name}</h3>
                                    <p className="text-slate-500 text-xs capitalize mb-2">{c.category}</p>
                                    <div className="text-sm space-y-1 text-slate-400 flex-1">
                                        <div className="text-emerald-300 font-semibold">₹{c.pricePerUnit}/{c.unit}</div>
                                        <div>{c.quantity} {c.unit} available</div>
                                        {c.location?.city && <div className="flex items-center gap-1 text-xs"><MapPin size={11} className="text-sky-400" />{c.location.city}</div>}
                                        <div className="text-slate-500 text-xs">by {c.farmer?.name}</div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Link to={`/crops/${c.id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all">
                                            <Eye size={13} /> Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
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
