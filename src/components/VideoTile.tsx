'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, VideoOff, Wifi, MicOff, Activity, Cpu } from 'lucide-react';

interface VideoTileProps {
    peer: any;
    userId: string;
    isLocal?: boolean;
    stream?: MediaStream;
    isMuted?: boolean;
}

const VideoTile = ({ peer, userId, isLocal, stream, isMuted }: VideoTileProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoActive, setIsVideoActive] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (isLocal && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                setIsVideoActive(videoTrack.enabled);
                const interval = setInterval(() => setIsVideoActive(videoTrack.enabled), 1000);
                return () => clearInterval(interval);
            }
        } else if (peer) {
            peer.on('stream', (incomingStream: MediaStream) => {
                if (videoRef.current) videoRef.current.srcObject = incomingStream;
                const videoTrack = incomingStream.getVideoTracks()[0];
                if (videoTrack) {
                    setIsVideoActive(videoTrack.enabled);
                    const interval = setInterval(() => setIsVideoActive(videoTrack.enabled), 1000);
                    return () => clearInterval(interval);
                }
            });
        }
    }, [peer, isLocal, stream]);

    if (!isClient) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group overflow-hidden rounded-[40px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 aspect-video flex items-center justify-center shadow-2xl transition-all duration-500 hover:border-indigo-600/50 hover:shadow-indigo-600/10"
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover transition-all duration-700 ${isVideoActive ? 'opacity-100 scale-100' : 'opacity-0 scale-110 blur-xl'}`}
            />

            <AnimatePresence>
                {!isVideoActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-black/80 backdrop-blur-3xl"
                    >
                        <div className="w-24 h-24 rounded-[32px] bg-indigo-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(99,102,241,0.3)] border border-white/20">
                            <span className="text-4xl font-black italic tracking-tighter">{userId.slice(0, 1).toUpperCase()}</span>
                        </div>
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Visual Link Suspended</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-4 py-1.5 rounded-full">Encrypted Identity Verification</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-3">
                {isMuted && (
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="p-2.5 bg-accent rounded-2xl text-white shadow-xl shadow-accent/20 border border-white/10"
                    >
                        <MicOff size={16} />
                    </motion.div>
                )}
                <div className="p-2.5 bg-white/70 dark:bg-black/50 backdrop-blur-md rounded-2xl text-indigo-600 dark:text-gray-300 border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-all">
                    <Wifi size={16} />
                </div>
            </div>

            {/* Identity Badge */}
            <div className="absolute bottom-6 left-6 px-5 py-3 bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-[22px] flex items-center gap-4 border border-white/20 shadow-2xl">
                <div className={`w-3 h-3 rounded-full ${isLocal ? 'bg-indigo-600 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_var(--success)]'}`} />
                <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white text-[11px] font-black uppercase tracking-widest leading-none">
                        {userId} {isLocal && '(LOCAL)'}
                    </span>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 grayscale">
                        <Activity size={10} /> Active_Session_Link
                    </span>
                </div>
            </div>

            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </motion.div>
    );
};

export default VideoTile;
