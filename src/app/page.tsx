'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ArrowRight, MessageCircle, Laptop, ShieldCheck,
  Zap, Users, Globe, Video, User
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('nexus_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const createRoom = () => {
    if (!user) return router.push('/auth');
    const id = Math.random().toString(36).substring(2, 9);
    router.push(`/room/${id}`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push('/auth');
    if (roomId.trim()) router.push(`/room/${roomId.trim()}`);
  };

  return (
    <div className="min-h-screen relative selection:bg-indigo-100 selection:text-indigo-600">
      {/* Impressive Background Layer */}
      <div className="background-blur">
        <div className="blur-orb orb-1" />
        <div className="blur-orb orb-2" />
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[100px]" />
      </div>

      {/* Floating Header */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-100 dark:border-white/5' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-10 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-xl shadow-indigo-600/20 group-hover:rotate-6 transition-all duration-500">
              <MessageCircle className="text-white" size={24} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase italic">Nexus</span>
          </div>

          <div className="flex items-center gap-8">
            {user ? (
              <div className="flex items-center gap-4 group">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Core</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">{user.name}</span>
                </div>
                <div className="w-11 h-11 rounded-full bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600 font-bold">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                className="px-8 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-full font-bold text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95 border border-gray-100 dark:border-white/5"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-40">
        {/* Dynamic Hero Section */}
        <section className="px-6 pb-40">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-12 border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
                Protocol 2026 // Active Synchronization
              </div>

              <h1 className="text-6xl md:text-9xl font-black text-gray-900 dark:text-white mb-10 tracking-tighter leading-[0.85] uppercase">
                Connect <br />
                <span className="gradient-text">Unfiltered.</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-16 max-w-2xl mx-auto">
                The next evolution of real-time synergy. Secure, seamless, and stunningly collaborative.
              </p>

              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <button
                  onClick={createRoom}
                  className="premium-btn px-12 py-6 text-lg"
                >
                  <Plus size={24} /> Initialize Session
                </button>

                <form onSubmit={joinRoom} className="w-full sm:w-[450px] relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <Zap size={22} />
                  </div>
                  <input
                    type="text"
                    placeholder="ENTER NODE ID..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full h-20 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-100 dark:border-white/10 pl-16 pr-40 rounded-[28px] text-lg font-black tracking-widest focus:outline-none focus:border-indigo-600 transition-all shadow-2xl placeholder:text-gray-300 dark:placeholder:text-gray-700 placeholder:italic dark:text-white uppercase"
                  />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[22px] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl"
                  >
                    Link
                  </button>
                </form>
              </div>

              <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto">
                <div className="flex flex-col items-center gap-4 group">
                  <div className="w-16 h-16 rounded-[22px] bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Laptop size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">WebRTC Core</span>
                </div>
                <div className="flex flex-col items-center gap-4 group">
                  <div className="w-16 h-16 rounded-[22px] bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">E2E Secure</span>
                </div>
                <div className="flex flex-col items-center gap-4 group">
                  <div className="w-16 h-16 rounded-[22px] bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Globe size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Edge Sync</span>
                </div>
                <div className="flex flex-col items-center gap-4 group">
                  <div className="w-16 h-16 rounded-[22px] bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Zap size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Zero Lag</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Tease Section */}
        <section className="py-40 bg-gray-50/50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-10">
            <div className="grid lg:grid-cols-2 gap-32 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase italic leading-none">
                  Modern Synergy <br />
                  <span className="text-indigo-600 italic">Redefined.</span>
                </h2>
                <p className="text-xl text-gray-500 mb-12 leading-relaxed font-medium">
                  Built with the ultimate stack to provide military-grade security and silicon-level performance. Collaborative tools like you've never seen before.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-5 p-6 glass-card border-none rounded-[32px] hover:bg-white transition-all">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><Video size={24} /></div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight">4K Video Stream</h4>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">Peer-to-Peer Protocol</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 p-6 glass-card border-none rounded-[32px] hover:bg-white transition-all">
                    <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-white"><Users size={24} /></div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight">Rapid Presence</h4>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">Socket.io Synchronization</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-10 bg-indigo-600/10 rounded-[60px] blur-3xl group-hover:bg-indigo-600/20 transition-all duration-700" />
                <div className="relative glass-card p-10 rounded-[50px] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-white dark:bg-gray-900 overflow-hidden">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Live Interface Preview</span>
                  </div>
                  <div className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-[30px] flex items-center justify-center border-dashed border-2 border-gray-200 dark:border-white/5 relative group cursor-pointer">
                    <Plus size={40} className="text-indigo-600/20 group-hover:scale-125 transition-transform" />
                    <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[30px]" />
                  </div>
                  <div className="mt-10 flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-gray-800" />
                    <div className="flex-1 h-12 rounded-2xl bg-indigo-50 dark:bg-gray-800" />
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impressive Footer */}
        <footer className="py-24 bg-white dark:bg-black border-t border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-10 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-12 grayscale opacity-50">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><MessageCircle size={28} /></div>
              <span className="text-3xl font-black tracking-tighter uppercase italic text-gray-900 dark:text-white">Nexus</span>
            </div>

            <div className="flex flex-wrap justify-center gap-12 text-sm font-black uppercase tracking-[0.3em] text-gray-400 mb-16">
              <a href="#" className="hover:text-indigo-600 transition-colors">Digital Identity</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Security Layer</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Global Node</a>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-white/5 to-transparent mb-16" />

            <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.5em] italic">
              Nexus Infrastructure © 2026 // Connect Beyond Limits
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
