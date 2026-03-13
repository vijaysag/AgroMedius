import { Link } from 'react-router-dom';
import { Leaf, TrendingUp, Cloud, Shield, Zap, Users, ArrowRight, Star, ChevronRight } from 'lucide-react';

const features = [
    { icon: <Leaf size={24} />, title: 'Smart Crop Listings', desc: 'Farmers upload crops with full details — soil type, quantity, price, harvest date and location.', color: 'from-emerald-500 to-teal-500' },
    { icon: <TrendingUp size={24} />, title: 'AI Recommendations', desc: 'Hybrid ML engine using collaborative + content-based filtering provides personalised crop suggestions.', color: 'from-sky-500 to-blue-500' },
    { icon: <Cloud size={24} />, title: 'Weather Intelligence', desc: 'Real-time weather alerts and crop suitability maps keep farmers ahead of the climate.', color: 'from-violet-500 to-purple-500' },
    { icon: <Shield size={24} />, title: 'Secure & Verified', desc: 'JWT-secured authentication with role-based access ensures data privacy and trust.', color: 'from-rose-500 to-pink-500' },
    { icon: <Zap size={24} />, title: 'Live Market Prices', desc: 'Track price fluctuations with interactive graphs and find the optimal time to sell or buy.', color: 'from-amber-500 to-orange-500' },
    { icon: <Users size={24} />, title: 'Direct Connect', desc: 'Wholesalers search and contact farmers directly via in-app messaging — no middleman.', color: 'from-cyan-500 to-sky-500' },
];

const stats = [
    { value: '10K+', label: 'Farmers Registered' },
    { value: '2.5K+', label: 'Wholesalers' },
    { value: '50+', label: 'Crop Varieties' },
    { value: '99%', label: 'Uptime' },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0a0f1e]">
            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                {/* Background blobs */}
                <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-6 text-center slide-in-up">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8">
                        <Star size={14} className="fill-current" />
                        India's Smart Agriculture Marketplace
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        From Farm to{' '}
                        <span className="gradient-text">Market</span>,<br />
                        Powered by AI
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        AgroMedius connects farmers and wholesalers with real-time market insights,
                        AI-driven crop recommendations, and seamless direct communication.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 transition-all pulse-glow text-lg"
                        >
                            Start for Free <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/crops"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-300 glass hover:bg-white/10 transition-all text-lg"
                        >
                            Browse Crops <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 border-y border-white/10">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-4xl font-black gradient-text">{s.value}</div>
                            <div className="text-slate-400 mt-1 text-sm">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Everything you need to grow</h2>
                        <p className="text-slate-400 text-lg">A complete ecosystem for modern agriculture commerce</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="glass rounded-2xl p-6 card-hover">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} bg-opacity-20 flex items-center justify-center mb-4 text-white`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-emerald-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-sky-500/10" />
                    <div className="relative">
                        <h2 className="text-4xl font-bold text-white mb-4">Ready to transform your farm?</h2>
                        <p className="text-slate-400 mb-8">Join thousands of farmers and wholesalers already on AgroMedius</p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 transition-all text-lg"
                        >
                            Join Now — It's Free <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Leaf size={16} className="text-emerald-500" />
                    <span className="font-semibold text-white">AgroMedius</span>
                </div>
                © 2026 AgroMedius. All rights reserved.
            </footer>
        </div>
    );
}
