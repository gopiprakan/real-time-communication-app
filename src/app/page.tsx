'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Plus,
  Link as LinkIcon,
  LogOut,
  CheckCircle2,
  Globe,
  Cpu
} from 'lucide-react';
import Image from 'next/image';

interface UserData {
  name: string;
  isGuest: boolean;
}

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
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

  const logout = () => {
    localStorage.removeItem('nexus_user');
    setUser(null);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    { icon: <Shield className="text-primary" />, title: "Quantum Security", desc: "Military-grade E2E encryption for every interaction." },
    { icon: <Zap className="text-accent" />, title: "Ultra Low Latency", desc: "Engineered for real-time collaboration with zero lag." },
    { icon: <Users className="text-blue-400" />, title: "Smart Collaboration", desc: "Integrated whiteboard and multi-user sync tools." }
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-white">
      <div className="mesh-bg" />

      {/* Header */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-background/80 backdrop-blur-xl border-b border-white/5' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.refresh()}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <Cpu className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">Nexus</span>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-semibold tracking-tight uppercase">{user.name}</span>
                </div>
                <button onClick={logout} className="p-2 hover:bg-accent/10 text-accent rounded-full transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-20 pb-40">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="z-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-8">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Next Gen Communication 2026</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 tracking-tighter uppercase">
                Connect <br />
                <span className="gradient-text">Beyond</span> <br />
                Limits.
              </h1>

              <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12 max-w-lg">
                Experience the pinnacle of real-time collaboration. Video, whiteboard, and chat seamlessly woven into one immersive environment.
              </p>

              <div className="flex flex-col sm:flex-row gap-8 mb-16 px-1">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createRoom}
                  className="group relative flex items-center justify-center gap-4 px-10 py-6 bg-primary text-white rounded-[2rem] text-lg font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all border border-white/10"
                >
                  <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                  New Session
                </motion.button>

                <form onSubmit={joinRoom} className="flex-1 max-w-lg relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                    <LinkIcon size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Protocol ID..."
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 py-6 pl-[4.5rem] pr-36 rounded-[2rem] text-lg font-black focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all placeholder:text-gray-700 placeholder:uppercase placeholder:text-xs placeholder:tracking-[0.3em] shadow-inner"
                  />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-90"
                  >
                    Link
                  </button>
                </form>
              </div>

              <div className="flex flex-wrap items-center gap-10 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                <div className="flex items-center gap-3"><Globe size={14} className="text-primary/40" /> Neural Edge Network</div>
                <div className="flex items-center gap-3"><CheckCircle2 size={14} className="text-success/40" /> Nexus_OS v4.2</div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  Global Status: Operational
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-accent/20 to-transparent blur-3xl opacity-30 animate-pulse" />
              <div className="relative z-10 glass-card p-4">
                <Image
                  src="/hero.png"
                  alt="Nexus Hero"
                  width={700}
                  height={700}
                  className="rounded-2xl object-cover shadow-2xl shadow-black/80 grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                  priority
                />

                <div className="absolute top-1/2 -left-12 p-6 glass-morphism rounded-3xl shadow-2xl float-anim border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg"><Users size={24} className="text-white" /></div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">Active Users</p>
                      <p className="text-[10px] text-primary uppercase font-black">1.2k connected</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-12 -right-8 p-5 glass-morphism rounded-2xl shadow-2xl float-anim [animation-delay:1s] border-accent/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center"><Video size={20} className="text-white" /></div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white">4K Sync</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-40 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase">Powering your <br /> <span className="gradient-text">digital synergy</span></h2>
              <p className="text-gray-500 font-medium text-lg max-w-xl mx-auto">Everything you need for seamless remote collaboration, optimized for the speed of light.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-10 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-500">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">{f.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                  <div className="mt-8 flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform cursor-pointer">
                    Learn more <ArrowRight size={14} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-white/5 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><Cpu className="text-white" size={16} /></div>
              <span className="text-xl font-black tracking-tighter uppercase">Nexus</span>
            </div>

            <div className="flex gap-12 text-sm text-gray-500 font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">API</a>
            </div>

            <div className="text-xs text-gray-700 font-black tracking-widest uppercase italic">
              &copy; 2026 Nexus Infrastructure. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
