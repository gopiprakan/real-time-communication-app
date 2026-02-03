'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, VideoOff, Wifi, WifiOff } from 'lucide-react';

interface VideoTileProps {
    peer: any;
    userId: string;
    isLocal?: boolean;
    stream?: MediaStream;
}

const VideoTile = ({ peer, userId, isLocal, stream }: VideoTileProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoActive, setIsVideoActive] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (isLocal && stream && videoRef.current) {
            videoRef.current.srcObject = stream;

            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                const handleTrackStatus = () => setIsVideoActive(videoTrack.enabled);
                const interval = setInterval(() => {
                    setIsVideoActive(videoTrack.enabled);
                }, 500);
                return () => clearInterval(interval);
            }
        } else if (peer) {
            peer.on('stream', (incomingStream: MediaStream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = incomingStream;
                }
                const videoTrack = incomingStream.getVideoTracks()[0];
                if (videoTrack) {
                    const interval = setInterval(() => {
                        setIsVideoActive(videoTrack.enabled);
                    }, 500);
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
            className="relative group overflow-hidden rounded-[2.5rem] bg-secondary border border-white/5 shadow-2xl aspect-video flex items-center justify-center transition-all duration-500 hover:border-primary/40 hover:shadow-primary/10"
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover transition-opacity duration-700 ${isVideoActive ? 'opacity-100' : 'opacity-0'}`}
            />

            <AnimatePresence>
                {!isVideoActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-3xl"
                    >
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-primary/30 to-accent/30 flex items-center justify-center border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <span className="text-4xl font-black text-white italic tracking-tighter">{userId.slice(0, 1).toUpperCase()}</span>
                        </div>
                        <div className="mt-6 flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">
                            <VideoOff size={14} className="text-accent" />
                            Transmission Suspended
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Right Status */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="p-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl text-success">
                    <Wifi size={14} />
                </div>
            </div>

            {/* Bottom Identity Badge */}
            <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all group-hover:scale-105 group-hover:translate-x-1 group-hover:-translate-y-1">
                <div className="relative">
                    <div className={`w-2.5 h-2.5 rounded-full ${isLocal ? 'bg-success shadow-[0_0_10px_var(--success)]' : 'bg-primary shadow-[0_0_10px_var(--primary)]'}`} />
                    <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping ${isLocal ? 'bg-success/50' : 'bg-primary/50'}`} />
                </div>
                <span className="text-white text-xs font-black uppercase tracking-widest">{isLocal ? 'Local Core' : userId}</span>
            </div>

            {/* Visual Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </motion.div>
    );
};

export default VideoTile;
