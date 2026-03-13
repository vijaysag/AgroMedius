import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Leaf, MapPin, Clock, Droplets, Sprout, Phone, Mail, MessageSquare, ArrowLeft, Eye, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
    sowing: 'bg-yellow-500/20 text-yellow-400',
    growing: 'bg-emerald-500/20 text-emerald-400',
    harvesting: 'bg-orange-500/20 text-orange-400',
    ready: 'bg-sky-500/20 text-sky-400',
    sold: 'bg-slate-500/20 text-slate-400',
};

export default function CropDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [booking, setBooking] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        api.get(`/crops/${id}`)
            .then(({ data }) => {
                setCrop(data);
                if (data.quantity > 0) setQuantity(Math.min(100, data.quantity));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleBooking = async () => {
        if (!user) return showToast('Please login to book crops', 'error');
        setBooking(true);
        try {
            await api.post('/orders', { cropId: id, quantity });
            showToast('Crop booked successfully! Check My Orders.');
            // Re-fetch crop to update quantity locally
            const { data } = await api.get(`/crops/${id}`);
            setCrop(data);
            if (data.quantity > 0) setQuantity(Math.min(quantity, data.quantity));
            else setQuantity(1);
        } catch (err) {
            showToast(err.response?.data?.message || 'Booking failed', 'error');
        } finally {
            setBooking(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center pt-16">
            <span className="spinner" style={{ width: 40, height: 40 }} />
        </div>
    );

    if (!crop) return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center pt-16">
            <div className="text-center"><Leaf size={48} className="text-slate-600 mx-auto mb-3" /><p className="text-slate-400">Crop not found.</p><Link to="/crops" className="text-emerald-400 mt-3 inline-block">← Back to crops</Link></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0f1e] pt-20 px-4 pb-12">
            <div className="max-w-4xl mx-auto">
                <Link to="/crops" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
                    <ArrowLeft size={16} /> Back to Marketplace
                </Link>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                        <Leaf size={28} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">{crop.name}</h1>
                                        <p className="text-slate-400 capitalize">{crop.category}</p>
                                    </div>
                                </div>
                                <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[crop.growthStatus]}`}>{crop.growthStatus}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                <div className="glass rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-emerald-300">₹{crop.pricePerUnit}</div>
                                    <div className="text-slate-400 text-xs">per {crop.unit}</div>
                                </div>
                                <div className="glass rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-sky-300">{crop.quantity}</div>
                                    <div className="text-slate-400 text-xs">{crop.unit} available</div>
                                </div>
                                <div className="glass rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-violet-300">{crop.views || 0}</div>
                                    <div className="text-slate-400 text-xs flex items-center justify-center gap-1"><Eye size={11} />views</div>
                                </div>
                            </div>

                            {crop.description && (
                                <p className="text-slate-300 text-sm leading-relaxed">{crop.description}</p>
                            )}
                        </div>

                        {/* Details */}
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-white font-semibold mb-4">Crop Details</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {crop.soilType && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Sprout size={15} className="text-emerald-400" />
                                        <span>Soil:</span><span className="text-white capitalize">{crop.soilType}</span>
                                    </div>
                                )}
                                {crop.irrigationType && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Droplets size={15} className="text-sky-400" />
                                        <span>Irrigation:</span><span className="text-white capitalize">{crop.irrigationType}</span>
                                    </div>
                                )}
                                {crop.harvestDate && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={15} className="text-amber-400" />
                                        <span>Harvest:</span><span className="text-white">{new Date(crop.harvestDate).toLocaleDateString('en-IN')}</span>
                                    </div>
                                )}
                                {crop.location?.city && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <MapPin size={15} className="text-rose-400" />
                                        <span>{crop.location.city}, {crop.location.state}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Farmer Contact Sidebar */}
                    <div className="space-y-4">
                        <div className="glass rounded-2xl p-5">
                            <h2 className="text-white font-semibold mb-4">Farmer Details</h2>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg">
                                    {crop.farmer?.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-semibold text-white">{crop.farmer?.name}</div>
                                    <div className="text-emerald-400 text-xs">Verified Farmer</div>
                                </div>
                            </div>
                            {crop.farmer?.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                                    <Phone size={14} className="text-slate-500" /> {crop.farmer.phone}
                                </div>
                            )}
                            {crop.farmer?.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-300 mb-4">
                                    <Mail size={14} className="text-slate-500" /> {crop.farmer.email}
                                </div>
                            )}
                            {user && (user.id === (crop.farmerId || crop.farmer?.id)) && (
                                <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs text-center">
                                    This is your listing. You can manage it from the dashboard.
                                </div>
                            )}

                            {user && (user.id !== (crop.farmerId || crop.farmer?.id)) && (
                                <div className="space-y-3">
                                    <Link
                                        to={`/messages?to=${crop.farmerId || crop.farmer?.id}&name=${crop.farmer?.name}`}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
                                    >
                                        <MessageSquare size={16} /> Send Message
                                    </Link>

                                    {user.role === 'wholesaler' ? (
                                        <div className="pt-2 border-t border-white/5 mt-2">
                                            <label className="text-xs text-slate-500 mb-1 block">Quantity to Book ({crop.unit})</label>
                                            <input type="number" min="1" max={crop.quantity} value={quantity} onChange={e => setQuantity(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-emerald-500/50" />

                                            <button onClick={handleBooking} disabled={booking || crop.quantity <= 0}
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:opacity-90 transition-all disabled:opacity-50">
                                                <ShoppingCart size={18} /> {booking ? 'Processing...' : 'Book Now'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center">
                                            Only Wholesalers can book crops directly.
                                        </div>
                                    )}
                                </div>
                            )}
                            {!user && (
                                <Link to="/login"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold glass border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all">
                                    Login to Book / Contact
                                </Link>
                            )}
                        </div>

                        <div className="glass rounded-2xl p-4 border border-emerald-500/10">
                            <p className="text-slate-400 text-xs">📋 Listed on {new Date(crop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </div>
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
