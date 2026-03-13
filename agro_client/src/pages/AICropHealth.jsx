import { useState } from 'react';
import { Upload, Stethoscope, AlertTriangle, CheckCircle, RefreshCcw, Camera } from 'lucide-react';
import api from '../api';

export default function AICropHealth() {
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(URL.createObjectURL(file));
        setResult(null);
    };

    const startAnalysis = async () => {
        setAnalyzing(true);
        try {
            const { data } = await api.post('/crops/ai-analyze-health');
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    const riskColors = {
        low: 'text-emerald-400 bg-emerald-500/10',
        medium: 'text-amber-400 bg-amber-500/10',
        high: 'text-red-400 bg-red-500/10'
    };

    return (
        <div className="min-h-screen bg-[#0a0f1e] pt-24 px-4 pb-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                        <Stethoscope className="text-emerald-400" size={32} />
                        AI Crop Doctor
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Upload a photo of your crop to detect diseases and get instant recommendations</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
                        {!image ? (
                            <label className="cursor-pointer flex flex-col items-center group">
                                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-4">
                                    <Camera size={38} />
                                </div>
                                <span className="text-white font-semibold text-lg">Tap to Upload Photo</span>
                                <span className="text-slate-500 text-sm mt-1 mb-4">Supports JPG, PNG</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />

                                <div className="w-full flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                                    <button type="button" onClick={() => { setImage('https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400'); startAnalysis(); }}
                                        className="flex-1 py-2 rounded-xl text-xs font-medium glass text-emerald-400 hover:bg-emerald-500/10 transition-all">
                                        Try Demo Scan
                                    </button>
                                </div>
                            </label>
                        ) : (
                            <div className="w-full h-full flex flex-col">
                                <div className="relative rounded-2xl overflow-hidden aspect-square mb-6 border border-white/10">
                                    <img src={image} className="w-full h-full object-cover" alt="Crop preview" />
                                    <button onClick={() => { setImage(null); setResult(null); }}
                                        className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md rounded-xl text-white hover:bg-black/70">
                                        Change
                                    </button>
                                </div>
                                {!result && (
                                    <button onClick={startAnalysis} disabled={analyzing}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                        {analyzing ? <><RefreshCcw className="animate-spin" size={20} /> Analyzing...</> : 'Scan for Diseases'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Result Section */}
                    <div className="glass rounded-3xl p-8 border border-white/5 min-h-[400px]">
                        {!result ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <Stethoscope size={64} className="text-slate-500 mb-4" />
                                <h3 className="text-white font-semibold text-xl">Diagnosis Report</h3>
                                <p className="text-slate-400 mt-2">Analysis results will appear here after scanning</p>
                            </div>
                        ) : (
                            <div className="space-y-6 slide-in-up">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-bold text-2xl">Health Report</h3>
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${riskColors[result.risk]}`}>
                                        {result.risk} RISK
                                    </span>
                                </div>

                                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                    <label className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-2">Diagnosis</label>
                                    <div className="flex items-center gap-3 text-white text-xl font-semibold">
                                        {result.risk === 'low' ? <CheckCircle className="text-emerald-400" /> : <AlertTriangle className="text-amber-400" />}
                                        {result.diagnosis}
                                    </div>
                                    <div className="text-emerald-400 text-sm mt-1 font-medium italic">Confidence Score: {result.confidence}%</div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                    <label className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-2">Recommendation</label>
                                    <p className="text-slate-300 leading-relaxed text-lg">{result.recommendation}</p>
                                </div>

                                <button onClick={() => { setImage(null); setResult(null); }}
                                    className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <RefreshCcw size={18} /> New Analysis
                                </button>

                                <p className="text-center text-slate-600 text-xs italic">
                                    * This is an AI-generated diagnosis. For critical issues, please consult with a local agricultural officer.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
