'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Mic, Speaker, Check, Cpu, Zap, Activity } from 'lucide-react';

interface DeviceSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    stream: MediaStream | null;
    onDeviceChange: (type: 'video' | 'audio', deviceId: string) => void;
}

const DeviceSettings = ({ isOpen, onClose, stream, onDeviceChange }: DeviceSettingsProps) => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState('');
    const [selectedAudio, setSelectedAudio] = useState('');

    useEffect(() => {
        const getDevices = async () => {
            try {
                const dev = await navigator.mediaDevices.enumerateDevices();
                setDevices(dev);

                const videoTrack = stream?.getVideoTracks()[0];
                const audioTrack = stream?.getAudioTracks()[0];

                if (videoTrack) setSelectedVideo(videoTrack.getSettings().deviceId || '');
                if (audioTrack) setSelectedAudio(audioTrack.getSettings().deviceId || '');
            } catch (err) {
                console.error("Error listing devices:", err);
            }
        };

        if (isOpen) {
            getDevices();
        }
    }, [isOpen, stream]);

    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    const audioDevices = devices.filter(d => d.kind === 'audioinput');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="mesh-bg opacity-30" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-xl glass-card p-12 relative overflow-hidden"
                    >
                        {/* Visual Accents */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all border border-white/5"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center mb-12">
                            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
                                <Cpu className="text-primary" size={32} />
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white text-center">
                                Hardware Interface
                            </h2>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-3">
                                Configure peripheral synchronization
                            </p>
                        </div>

                        <div className="space-y-10">
                            {/* Camera Selection */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-5 flex items-center gap-3 ml-1">
                                    <Camera size={14} className="text-primary" /> Visual Capture Source
                                </label>
                                <div className="grid gap-3">
                                    {videoDevices.map((device) => (
                                        <button
                                            key={device.deviceId}
                                            onClick={() => {
                                                setSelectedVideo(device.deviceId);
                                                onDeviceChange('video', device.deviceId);
                                            }}
                                            className={`group w-full flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-500 ${selectedVideo === device.deviceId
                                                ? 'border-primary bg-primary/10 text-primary shadow-xl shadow-primary/10'
                                                : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-400'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedVideo === device.deviceId ? 'bg-primary/20' : 'bg-black/20 border border-white/5'}`}>
                                                    <Activity size={18} className={selectedVideo === device.deviceId ? 'text-primary' : 'text-gray-600'} />
                                                </div>
                                                <span className="text-sm font-black tracking-tight uppercase truncate max-w-[280px]">
                                                    {device.label || `Nexus_CAM_${device.deviceId.slice(0, 5)}`}
                                                </span>
                                            </div>
                                            {selectedVideo === device.deviceId && <div className="p-1 px-3 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full">Active</div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Microphone Selection */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-5 flex items-center gap-3 ml-1">
                                    <Mic size={14} className="text-accent" /> Neural Audio Stream
                                </label>
                                <div className="grid gap-3">
                                    {audioDevices.map((device) => (
                                        <button
                                            key={device.deviceId}
                                            onClick={() => {
                                                setSelectedAudio(device.deviceId);
                                                onDeviceChange('audio', device.deviceId);
                                            }}
                                            className={`group w-full flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-500 ${selectedAudio === device.deviceId
                                                ? 'border-accent bg-accent/10 text-accent shadow-xl shadow-accent/10'
                                                : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-400'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedAudio === device.deviceId ? 'bg-accent/20' : 'bg-black/20 border border-white/5'}`}>
                                                    <Zap size={18} className={selectedAudio === device.deviceId ? 'text-accent' : 'text-gray-600'} />
                                                </div>
                                                <span className="text-sm font-black tracking-tight uppercase truncate max-w-[280px]">
                                                    {device.label || `Nexus_MIC_${device.deviceId.slice(0, 5)}`}
                                                </span>
                                            </div>
                                            {selectedAudio === device.deviceId && <div className="p-1 px-3 bg-accent text-white text-[9px] font-black uppercase tracking-widest rounded-full">Active</div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full mt-12 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all text-xs shadow-2xl active:scale-95 flex items-center justify-center gap-3 group"
                        >
                            Synchronize & Return
                            <Check size={18} className="group-hover:scale-125 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeviceSettings;
