'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Mic, MicOff, Video, VideoOff, Search, MoreHorizontal, User, ShieldCheck, Activity } from 'lucide-react';

interface Participant {
    userId: string;
    socketId: string;
}

interface ParticipantsListProps {
    isOpen: boolean;
    onClose: () => void;
    localUser: string;
    remotePeers: { userId: string; peerId: string }[];
}

const ParticipantsList = ({ isOpen, onClose, localUser, remotePeers }: ParticipantsListProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 500 }}
                    animate={{ x: 0 }}
                    exit={{ x: 500 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-[450px] bg-white dark:bg-gray-950 z-[60] border-l border-gray-100 dark:border-white/10 flex flex-col shadow-[-100px_0_100px_-50px_rgba(0,0,0,0.1)]"
                >
                    <div className="p-10 bg-white/50 dark:bg-black/50 backdrop-blur-3xl flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">
                                IDENTIFIER PRESENCE
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-2 flex items-center gap-2">
                                <Activity size={12} /> {remotePeers.length + 1} ACTIVE NODE UNITS
                            </span>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-white/5 rounded-2xl text-gray-400 transition-all border border-gray-100 dark:border-white/5">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-10 border-b border-gray-50 dark:border-white/5">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="FILTER NODE IDENTIFIERS..."
                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-[22px] py-5 pl-16 pr-6 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
                        <div className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Collective Unit Roster</div>

                        {/* Local User Card */}
                        <div className="p-8 flex items-center justify-between glass-card border-none bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[32px] hover:scale-[1.02] transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-600/20">
                                    {localUser.slice(0, 1).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tight italic">{localUser} (HOST)</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Protocol Secured</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 text-indigo-600 opacity-30">
                                <Mic size={18} />
                                <Video size={18} />
                            </div>
                        </div>

                        {/* Remote Users */}
                        {remotePeers.map((peer, i) => (
                            <div key={i} className="p-8 flex items-center justify-between glass-card border-none hover:bg-gray-50/50 dark:hover:bg-white/5 rounded-[32px] hover:scale-[1.02] transition-all cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 font-black text-xl">
                                        {peer.userId.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tight">{peer.userId}</p>
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 flex items-center gap-2 italic">
                                            <ShieldCheck size={12} /> Synchronized
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-gray-300">
                                    <Mic size={18} />
                                    <Video size={18} />
                                </div>
                            </div>
                        ))}

                        {remotePeers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-16 space-y-6 grayscale opacity-30">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[30px] flex items-center justify-center">
                                    <Users size={32} className="text-gray-900 dark:text-white" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                                    Awaiting Peer Synchronisation Protocol
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-10 bg-white/50 dark:bg-black/50 border-t border-gray-100 dark:border-white/5 mt-auto">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Broadcast Link Synchronized!");
                            }}
                            className="premium-btn w-full py-6 flex items-center justify-center gap-4 text-sm"
                        >
                            <ShieldCheck size={20} />
                            Deploy Connection Code
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ParticipantsList;
