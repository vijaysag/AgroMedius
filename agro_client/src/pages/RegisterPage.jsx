import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const roles = [
    { value: 'farmer', label: '🌾 I am a Farmer', desc: 'List my crops and get AI advice' },
    { value: 'wholesaler', label: '🏪 I am a Wholesaler', desc: 'Search & buy crops in bulk' },
];

export default function RegisterPage() {
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: '', phone: '', city: '', state: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const handleNext = (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) { setError('Please fill all fields'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setError('');
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.role) { setError('Please select your role'); return; }
        setError('');
        const payload = {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            phone: form.phone,
            location: { city: form.city, state: form.state }
        };
        const result = await register(payload);
        if (result.success) {
            navigate(form.role === 'farmer' ? '/farmer' : '/wholesaler');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 pt-16 pb-8">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">
                <div className="glass rounded-2xl p-8 border border-white/10">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center mx-auto mb-4">
                            <Leaf size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-slate-400 mt-1 text-sm">Step {step} of 2</p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex gap-2 mb-6">
                        <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-sky-500' : 'bg-white/10'}`} />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleNext} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="John Farmer" required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1.5 block">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="you@example.com" required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1.5 block">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••" required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm" />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit"
                                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 transition-all">
                                Next Step →
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Role */}
                            <div>
                                <label className="text-sm text-slate-400 mb-2 block">Select Your Role</label>
                                <div className="space-y-2">
                                    {roles.map(r => (
                                        <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                                            className={`w-full p-4 rounded-xl text-left border transition-all ${form.role === r.value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                            <div className="font-medium text-white text-sm">{r.label}</div>
                                            <div className="text-slate-400 text-xs mt-0.5">{r.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1.5 block">Phone (optional)</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1.5 block">City</label>
                                    <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                        placeholder="Mumbai"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1.5 block">State</label>
                                    <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                                        placeholder="Maharashtra"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setStep(1)}
                                    className="flex-1 py-3 rounded-xl font-medium text-slate-300 glass hover:bg-white/10 transition-all">
                                    ← Back
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? <span className="spinner" /> : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="text-center text-slate-400 text-sm mt-5">
                        Already have an account?{' '}
                        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
