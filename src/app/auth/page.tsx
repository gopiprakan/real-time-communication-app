'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Mail,
    Lock,
    User,
    ArrowRight,
    Fingerprint,
    Cpu,
    Sparkles
} from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('nexus_user', JSON.stringify({ name: name || 'User', email }));
        router.push('/');
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="mesh-bg" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={isLogin ? 'login' : 'signup'}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="w-full max-w-[480px] glass-card p-12 z-10 relative overflow-hidden"
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ rotate: -10 }}
                            animate={{ rotate: 0 }}
                            className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 border border-primary/20 shadow-2xl shadow-primary/10"
                        >
                            <Cpu className="text-primary w-10 h-10" />
                        </motion.div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                            {isLogin ? 'Nexus Core' : 'Initialize'}
                        </h2>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-3">
                            {isLogin ? 'Access secure connection' : 'Create unique identity'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="relative"
                            >
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Identity Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white/[0.03] border-white/5 focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Neural Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white/[0.03] border-white/5 focus:border-primary transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-1">Access Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full py-4 pl-12 pr-4 rounded-2xl bg-white/[0.03] border-white/5 focus:border-primary transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">
                            <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                <Fingerprint size={14} /> Biometric Key
                            </div>
                            {isLogin && (
                                <span className="hover:text-primary transition-colors cursor-pointer">Recover Key</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 bg-primary hover:bg-primary-hover rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 group transition-all shadow-xl shadow-primary/20 text-xs mt-8"
                        >
                            {isLogin ? 'Initiate Session' : 'Create Identity'}
                            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-12 text-center border-t border-white/5 pt-8">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-gray-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3 mx-auto"
                        >
                            <Sparkles size={14} className="text-accent" />
                            {isLogin ? "Need a new identity? Initialize" : "Existing core found? Synchronize"}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Visual Accents */}
            <div className="fixed top-12 left-12 text-[10px] font-black tracking-[0.3em] uppercase text-gray-700 pointer-events-none">
                Protocol: Secure_Sync_v4
            </div>
            <div className="fixed bottom-12 right-12 text-[10px] font-black tracking-[0.3em] uppercase text-gray-700 pointer-events-none">
                Node: {Math.random().toString(16).substring(2, 8).toUpperCase()}
            </div>
        </main>
    );
}
