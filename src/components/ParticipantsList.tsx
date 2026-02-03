'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Mic, MicOff, Video, VideoOff, ShieldCheck, Share2, Crown } from 'lucide-react';

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
                    initial={{ x: 450 }}
                    animate={{ x: 0 }}
                    exit={{ x: 450 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-[400px] bg-black/40 backdrop-blur-3xl z-[50] border-l border-white/5 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                >
                    <div className="px-8 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div>
                            <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter text-white">
                                <Users className="text-primary" size={24} />
                                Neural Collective
                            </h3>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                                <ShieldCheck size={12} className="text-success" />
                                Secure Synchronization
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all border border-white/5"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Session Host</label>
                        {/* Local User */}
                        <div className="flex items-center justify-between p-5 rounded-[2rem] bg-primary/5 border border-primary/20 shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px] font-black shadow-2xl">
                                    {localUser.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-white text-sm tracking-tight">{localUser}</p>
                                        <Crown size={12} className="text-primary" />
                                    </div>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">Primary Core (You)</p>
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-success">
                                    <Mic size={14} />
                                </div>
                                <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-success">
                                    <Video size={14} />
                                </div>
                            </div>
                        </div>

                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1 block mt-8">Synchronized Peers ({remotePeers.length})</label>
                        {/* Remote Users */}
                        <div className="space-y-3">
                            {remotePeers.map((peer, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-[10px] font-black border border-white/5 shadow-inner group-hover:bg-white/5 transition-colors">
                                            {peer.userId.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-100 text-sm tracking-tight">{peer.userId}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Active Link</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <div className="p-2 bg-black/40 rounded-xl border border-white/5 text-gray-500">
                                            <Mic size={14} />
                                        </div>
                                        <div className="p-2 bg-black/40 rounded-xl border border-white/5 text-gray-500">
                                            <Video size={14} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {remotePeers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5">
                                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                                    <Users size={32} className="opacity-20" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest opacity-30">Awaiting Peer Broadcast...</p>
                                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-6 hover:text-white transition-colors flex items-center gap-2">
                                    <Share2 size={12} /> Broadcast Link
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-white/5 mt-auto bg-black/20 backdrop-blur-3xl">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Synchronization Protocol Copied!");
                            }}
                            className="w-full py-5 bg-primary hover:bg-primary-hover text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 border border-white/10"
                        >
                            <Share2 size={18} />
                            Deploy Invitation
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ParticipantsList;
