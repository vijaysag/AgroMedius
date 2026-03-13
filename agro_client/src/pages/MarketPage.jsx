import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import { TrendingUp, TrendingDown, BarChart2, RefreshCw, Zap, MapPin, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Soybean', 'Cotton', 'Sugarcane', 'Maize', 'Chilli'];
const BASE_PRICES = { Wheat: 2200, Rice: 3100, Tomato: 1800, Onion: 1500, Potato: 1200, Soybean: 4500, Cotton: 6200, Sugarcane: 900, Maize: 1900, Chilli: 8000 };

const CROP_EMOJI = { Wheat: '🌾', Rice: '🍚', Tomato: '🍅', Onion: '🧅', Potato: '🥔', Soybean: '🫘', Cotton: '☁️', Sugarcane: '🎋', Maize: '🌽', Chilli: '🌶️' };

function SparkLine({ data, color = '#10b981' }) {
    if (!data || data.length < 2) return <div className="text-slate-600 text-xs h-12 flex items-center">No data</div>;
    const vals = data.map(d => d.price);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    
    const range = max - min || 1;
    const w = 400, h = 100;
    const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * (h - 8) + 4}`).join(' ');
    
    const avgY = h - ((avg - min) / range) * (h - 8) + 4;
    const trend = vals[vals.length - 1] > vals[0];
    
    return (
        <div className="relative group">
            <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
                <defs>
                    <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* Average Baseline */}
                <line x1="0" y1={avgY} x2={w} y2={avgY} stroke="white" strokeWidth="1" strokeDasharray="4,4" strokeOpacity="0.2" />
                
                {/* Area Fill */}
                <polygon
                    points={`0,${h} ${pts} ${w},${h}`}
                    fill={`url(#grad-${color.replace('#', '')})`}
                />
                
                {/* Price Line */}
                <polyline 
                    points={pts} 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                />
                
                {/* Start/End Points */}
                <circle cx="0" cy={h - ((vals[0] - min) / range) * (h - 8) + 4} r="4" fill={color} />
                <circle cx={w} cy={h - ((vals[vals.length - 1] - min) / range) * (h - 8) + 4} r="5" fill={color} className="animate-pulse" />
            </svg>
            
            <div className="flex items-center justify-between mt-3">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${trend ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trend ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {trend ? 'BULLISH' : 'BEARISH'} TREND
                </div>
                <div className="text-[10px] text-white/20 font-medium">AVG: ₹{Math.round(avg).toLocaleString()}</div>
            </div>
        </div>
    );
}

export default function MarketPage() {
    const [prices, setPrices] = useState([]);
    const [history, setHistory] = useState([]);
    const [prevPrices, setPrevPrices] = useState({});
    const [selectedCrop, setSelectedCrop] = useState('Wheat');
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const intervalRef = useRef(null);

    const fetchPrices = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const { data } = await api.get('/market?days=1');
            if (data.length > 0) {
                // Track previous prices for up/down indicators
                setPrevPrices(prev => {
                    const next = { ...prev };
                    prices.forEach(p => { next[p.cropName] = p.price; });
                    return next;
                });
                setPrices(data);
                setLastUpdated(new Date());
            }
            return data.length;
        } catch (err) {
            console.error('Fetch prices error:', err);
            return 0;
        } finally {
            if (!silent) setLoading(false);
        }
    }, [prices]);

    const fetchHistory = useCallback(async () => {
        try {
            const { data } = await api.get(`/market/history/${selectedCrop}?days=30`);
            setHistory(data);
        } catch (err) {
            console.error('Fetch history error:', err);
        }
    }, [selectedCrop]);

    // Auto-seed if no data, then start live refresh
    const initMarket = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/market?days=1');
            if (data.length === 0) {
                await api.post('/market/seed');
                await fetchPrices();
            } else {
                setPrices(data);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [fetchPrices]);

    useEffect(() => { initMarket(); }, []);
    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    // Live price refresh every 15 seconds
    useEffect(() => {
        intervalRef.current = setInterval(async () => {
            try {
                const { data } = await api.post('/market/refresh');
                setPrevPrices(prev => {
                    const next = { ...prev };
                    prices.forEach(p => { next[p.cropName] = p.price; });
                    return next;
                });
                setPrices(data.prices || []);
                setLastUpdated(new Date());
            } catch (err) { /* silent */ }
        }, 15000);
        return () => clearInterval(intervalRef.current);
    }, [prices]);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            await api.post('/market/seed');
            await fetchPrices();
            fetchHistory();
        } catch (err) {
            console.error('Seed error:', err);
        } finally {
            setSeeding(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const { data } = await api.post('/market/refresh');
            setPrevPrices(prev => {
                const next = { ...prev };
                prices.forEach(p => { next[p.cropName] = p.price; });
                return next;
            });
            setPrices(data.prices || []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    // Group latest prices by crop
    const latestByCrop = {};
    prices.forEach(p => { if (!latestByCrop[p.cropName]) latestByCrop[p.cropName] = p; });

    const selectedData = latestByCrop[selectedCrop];

    return (
        <div className="min-h-screen bg-[#0a0f1e] pt-20 px-4 pb-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            <BarChart2 className="text-emerald-500" /> Market Prices
                        </h1>
                        <p className="text-slate-400 mt-1">Live crop price tracking across Indian markets</p>
                        {lastUpdated && (
                            <p className="text-slate-600 text-xs mt-0.5 flex items-center gap-1">
                                <Zap size={10} className="text-emerald-600" />
                                Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 15s
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleRefresh} disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50 border border-emerald-500/20">
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh Now
                        </button>
                        <button onClick={handleSeed} disabled={seeding}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm glass text-slate-300 hover:bg-white/10 transition-all disabled:opacity-50">
                            <RefreshCw size={14} className={seeding ? 'animate-spin' : ''} /> Reseed 90 Days
                        </button>
                    </div>
                </div>

                {/* Price Cards */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        {Array(10).fill(0).map((_, i) => (
                            <div key={i} className="glass rounded-2xl p-4 animate-pulse h-28" />
                        ))}
                    </div>
                ) : Object.keys(latestByCrop).length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center mb-8">
                        <BarChart2 size={48} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 mb-4">No market data yet.</p>
                        <button onClick={handleSeed}
                            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:opacity-90">
                            Load Market Data
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                        {CROPS.map(cropName => {
                            const p = latestByCrop[cropName];
                            if (!p) return null;
                            const prev = prevPrices[cropName];
                            const isUp = prev && p.price > prev;
                            const isDown = prev && p.price < prev;
                            return (
                                <button key={cropName} onClick={() => setSelectedCrop(cropName)}
                                    className={`glass rounded-2xl p-4 text-left card-hover transition-all ${selectedCrop === cropName ? 'border border-emerald-500/60 bg-emerald-500/5' : 'border border-transparent hover:border-white/10'}`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-2xl">{CROP_EMOJI[cropName] || '🌿'}</span>
                                        {isUp && <ArrowUpRight size={14} className="text-emerald-400" />}
                                        {isDown && <ArrowDownRight size={14} className="text-red-400" />}
                                    </div>
                                    <div className="font-bold text-white text-sm mb-1">{cropName}</div>
                                    <div className={`text-lg font-bold ${isUp ? 'text-emerald-300' : isDown ? 'text-red-300' : 'text-emerald-300'}`}>
                                        ₹{p.price.toLocaleString()}
                                    </div>
                                    <div className="text-slate-500 text-xs">/{p.unit}</div>
                                    <div className="text-slate-600 text-xs flex items-center gap-0.5 mt-1">
                                        <MapPin size={9} />{p.market}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Chart + Selected Details + Insights */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Sparkline chart */}
                    <div className="md:col-span-2 glass rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-4">{selectedCrop} — 30-Day Price Trend</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {CROPS.map(c => (
                                <button key={c} onClick={() => setSelectedCrop(c)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedCrop === c ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass text-slate-400 hover:text-white'}`}>
                                    {CROP_EMOJI[c]} {c}
                                </button>
                            ))}
                        </div>
                        {history.length > 0 ? (
                            <div className="bg-white/5 rounded-xl p-4">
                                <SparkLine data={history} color={selectedData?.price > BASE_PRICES[selectedCrop] ? '#10b981' : '#f87171'} />
                                <div className="flex justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-white/5">
                                    <span>Min: ₹{Math.min(...history.map(h => h.price)).toLocaleString()}</span>
                                    <span>Avg: ₹{Math.round(history.reduce((s, h) => s + h.price, 0) / history.length).toLocaleString()}</span>
                                    <span>Max: ₹{Math.max(...history.map(h => h.price)).toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 rounded-xl p-8 text-center text-slate-500 text-sm">No history for {selectedCrop}</div>
                        )}

                        {/* Selected crop details */}
                        {selectedData && (
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <div className="text-slate-400 text-xs mb-1">Min Today</div>
                                    <div className="text-white font-bold">₹{selectedData.minPrice?.toLocaleString() || '—'}</div>
                                </div>
                                <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                                    <div className="text-emerald-400 text-xs mb-1">Current</div>
                                    <div className="text-emerald-300 font-bold text-lg">₹{selectedData.price?.toLocaleString()}</div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <div className="text-slate-400 text-xs mb-1">Max Today</div>
                                    <div className="text-white font-bold">₹{selectedData.maxPrice?.toLocaleString() || '—'}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Market Insights */}
                    <div className="glass rounded-2xl p-6">
                        <h2 className="text-white font-semibold mb-4">💡 Market Insights</h2>
                        <div className="space-y-3">
                            {[
                                { title: 'Best time to sell Wheat', insight: 'Prices typically peak in Dec-Jan. Current trend shows upward momentum.', tag: 'For Farmers', color: 'emerald' },
                                { title: 'Bulk buy Onion now', insight: 'Price dip cycle detected. Expected to rise 15% in 3 weeks.', tag: 'For Wholesalers', color: 'sky' },
                                { title: 'Tomato Alert', insight: 'Oversupply in Delhi market. Explore Maharashtra sources for better pricing.', tag: 'Price Alert', color: 'amber' },
                                { title: 'Chilli Export Boom', insight: 'Export demand increasing. Maintain stock for Q2 surge.', tag: 'Trending', color: 'violet' },
                            ].map((item, i) => (
                                <div key={i} className={`glass rounded-xl p-4 border border-${item.color}-500/20`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white text-sm font-medium">{item.title}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${item.color}-500/20 text-${item.color}-400`}>{item.tag}</span>
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed">{item.insight}</p>
                                </div>
                            ))}
                        </div>

                        {/* All crops quick view */}
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <h3 className="text-white text-sm font-semibold mb-3">All Crops Snapshot</h3>
                            <div className="space-y-2">
                                {CROPS.map(c => {
                                    const p = latestByCrop[c];
                                    if (!p) return null;
                                    const prev = prevPrices[c];
                                    const isUp = prev && p.price > prev;
                                    const isDown = prev && p.price < prev;
                                    return (
                                        <div key={c} className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">{CROP_EMOJI[c]} {c}</span>
                                            <span className={`font-semibold ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-300'}`}>
                                                ₹{p.price.toLocaleString()}
                                                {isUp && ' ▲'}{isDown && ' ▼'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
