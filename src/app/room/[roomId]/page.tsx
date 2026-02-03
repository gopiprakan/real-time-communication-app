'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video, VideoOff, Mic, MicOff, Monitor, PhoneOff,
    MessageSquare, Edit2, Users, Settings, Share2, Circle,
    Cpu, Layers, Layout, ChevronRight
} from 'lucide-react';
import VideoTile from '@/components/VideoTile';
import Chat from '@/components/Chat';
import Whiteboard from '@/components/Whiteboard';
import DeviceSettings from '@/components/DeviceSettings';
import ParticipantsList from '@/components/ParticipantsList';

export default function RoomPage() {
    const params = useParams();
    const roomId = params?.roomId as string;
    const router = useRouter();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [peers, setPeers] = useState<{ peerId: string; peer: any; userId: string }[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [activeTab, setActiveTab] = useState<'video' | 'whiteboard'>('video');
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const [userId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('nexus_user');
            if (user) return JSON.parse(user).name;
        }
        return `User_${Math.random().toString(36).substring(7)}`;
    });

    const socketRef = useRef<any>(null);
    const peersRef = useRef<{ peerId: string; peer: any; userId: string }[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:3002');

        const initMedia = async () => {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(userStream);
                if (videoRef.current) videoRef.current.srcObject = userStream;

                socketRef.current.emit('join-room', roomId, userId);

                socketRef.current.on('all-users', (users: { socketId: string; userId: string }[]) => {
                    const newPeers: { peerId: string; peer: any; userId: string }[] = [];
                    users.forEach((user) => {
                        const peer = createPeer(user.socketId, socketRef.current.id, userStream);
                        peersRef.current.push({ peerId: user.socketId, peer, userId: user.userId });
                        newPeers.push({ peerId: user.socketId, peer, userId: user.userId });
                    });
                    setPeers(newPeers);
                });

                socketRef.current.on('user-joined-signal', (payload: any) => {
                    const peer = addPeer(payload.signal, payload.callerId, userStream);
                    peersRef.current.push({ peerId: payload.callerId, peer, userId: 'Remote User' });
                    setPeers(prev => [...prev, { peerId: payload.callerId, peer, userId: 'Remote User' }]);
                });

                socketRef.current.on('receiving-returned-signal', (payload: any) => {
                    const item = peersRef.current.find(p => p.peerId === payload.id);
                    if (item) item.peer.signal(payload.signal);
                });

                socketRef.current.on('user-left', (id: string) => {
                    const peerObj = peersRef.current.find(p => p.peerId === id);
                    if (peerObj) peerObj.peer.destroy();
                    const updatedPeers = peersRef.current.filter(p => p.peerId !== id);
                    peersRef.current = updatedPeers;
                    setPeers([...updatedPeers]);
                });
            } catch (err) {
                console.error("Error accessing media devices:", err);
            }
        };

        initMedia();

        return () => {
            peersRef.current.forEach(({ peer }) => peer.destroy());
            socketRef.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [stream]);

    function createPeer(userToSignal: string, callerId: string, stream: MediaStream) {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peer.on('signal', signal => {
            socketRef.current.emit('sending-signal', { userToSignal, callerId, signal });
        });
        return peer;
    }

    function addPeer(incomingSignal: any, callerId: string, stream: MediaStream) {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on('signal', signal => {
            socketRef.current.emit('returning-signal', { signal, callerId });
        });
        peer.signal(incomingSignal);
        return peer;
    }

    const handleDeviceChange = async (type: 'video' | 'audio', deviceId: string) => {
        if (!stream) return;

        try {
            const constraints = {
                video: type === 'video' ? { deviceId: { exact: deviceId } } : stream.getVideoTracks()[0].getConstraints(),
                audio: type === 'audio' ? { deviceId: { exact: deviceId } } : stream.getAudioTracks()[0].getConstraints(),
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            const videoTrack = newStream.getVideoTracks()[0];
            const audioTrack = newStream.getAudioTracks()[0];

            setStream(newStream);

            peersRef.current.forEach(({ peer }) => {
                try {
                    if (type === 'video') {
                        peer.replaceTrack(stream.getVideoTracks()[0], videoTrack, stream);
                    } else {
                        peer.replaceTrack(stream.getAudioTracks()[0], audioTrack, stream);
                    }
                } catch (e) { console.error("Track replacement failed", e); }
            });

            if (type === 'video') stream.getVideoTracks()[0].stop();
            else stream.getAudioTracks()[0].stop();

        } catch (err) {
            console.error("Failed to change device:", err);
        }
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsVideoOff(!isVideoOff);
        }
    };

    const shareScreen = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true } as any);
                const screenTrack = screenStream.getVideoTracks()[0];

                peersRef.current.forEach(({ peer }) => {
                    try {
                        peer.replaceTrack(
                            stream?.getVideoTracks()[0],
                            screenTrack,
                            stream
                        );
                    } catch (e) { console.error(e); }
                });

                screenTrack.onended = () => {
                    peersRef.current.forEach(({ peer }) => {
                        try {
                            peer.replaceTrack(screenTrack, stream?.getVideoTracks()[0], stream);
                        } catch (e) { console.error(e); }
                    });
                    setIsScreenSharing(false);
                };

                setIsScreenSharing(true);
            } catch (err) {
                console.error("Screen share error:", err);
            }
        }
    };

    const endCall = () => {
        router.push('/');
    };

    return (
        <div className="flex h-screen bg-[#030303] overflow-hidden">
            <div className="mesh-bg" />

            {/* Ultra-Minimal Sidebar */}
            <nav className="w-20 bg-secondary/20 backdrop-blur-3xl border-r border-white/5 flex flex-col items-center py-10 gap-10 z-30">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-lg cursor-pointer hover:rotate-6 transition-transform group">
                    <Cpu className="text-primary group-hover:scale-110 transition-transform" size={24} />
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`p-4 rounded-2xl transition-all relative group ${activeTab === 'video' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Layout size={22} />
                        {activeTab === 'video' && <motion.div layoutId="activeTab" className="absolute -left-1 w-1 h-6 bg-primary rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('whiteboard')}
                        className={`p-4 rounded-2xl transition-all relative group ${activeTab === 'whiteboard' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Edit2 size={22} />
                        {activeTab === 'whiteboard' && <motion.div layoutId="activeTab" className="absolute -left-1 w-1 h-6 bg-primary rounded-full" />}
                    </button>
                </div>

                <div className="mt-auto flex flex-col gap-6 items-center">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="text-gray-600 hover:text-white p-2 transition-colors"
                    >
                        <Settings size={22} />
                    </button>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary/40 to-accent/40 border border-white/10 flex items-center justify-center font-black text-[10px] tracking-tighter uppercase cursor-pointer hover:scale-110 transition-all">
                        {userId.slice(0, 2).toUpperCase()}
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex flex-col relative min-w-0">
                {/* Refined Header */}
                <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-black/40 backdrop-blur-3xl z-20">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h2 className="font-black text-xs uppercase tracking-[0.3em] text-gray-500">Core Session</h2>
                                <ChevronRight size={12} className="text-gray-700" />
                                <span className="text-primary font-black text-xs uppercase tracking-widest">{roomId}</span>
                            </div>
                            <h3 className="text-xl font-black text-white mt-1.5 tracking-tight flex items-center gap-3">
                                <Cpu size={24} className="text-primary" />
                                Nexus Multi-Node Interface
                            </h3>
                        </div>

                        <div className="h-12 w-px bg-white/5 hidden xl:block" />

                        <div className="hidden xl:flex items-center gap-8">
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-success/5 border border-success/10 text-success rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-inner">
                                <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping shadow-[0_0_8px_var(--success)]" />
                                Sync Active
                            </div>

                            {isRecording && (
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-accent/5 border border-accent/10 text-accent rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">
                                    <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_var(--accent)]" />
                                    Archiving
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setShowParticipants(true)}
                            className="flex items-center gap-4 cursor-pointer group p-2 pr-6 bg-white/[0.02] hover:bg-white/5 rounded-2xl transition-all border border-white/5"
                        >
                            <div className="flex -space-x-4">
                                <div className="w-10 h-10 rounded-xl border-2 border-black bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary shadow-2xl">
                                    {userId.slice(0, 1).toUpperCase()}
                                </div>
                                {peers.slice(0, 2).map((peer, i) => (
                                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-black bg-secondary flex items-center justify-center text-[10px] font-black shadow-2xl">
                                        {peer.userId.slice(0, 1).toUpperCase()}
                                    </div>
                                ))}
                                {peers.length > 2 && (
                                    <div className="w-10 h-10 rounded-xl border-2 border-black bg-accent flex items-center justify-center text-[10px] font-black shadow-2xl">
                                        +{peers.length - 2}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white text-[10px] font-black uppercase tracking-widest leading-none">{peers.length + 1} Units</span>
                                <span className="text-gray-600 text-[8px] font-bold uppercase tracking-widest mt-1">Collective</span>
                            </div>
                        </motion.div>

                        <div className="h-10 w-px bg-white/5" />

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(roomId);
                                    alert("Synchronization Code Copied!");
                                }}
                                className="p-3.5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-2xl transition-all border border-white/5 group shadow-inner"
                                title="Copy Node Protocol"
                            >
                                <Share2 size={18} className="group-active:scale-75 transition-transform" />
                            </button>
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className={`p-3.5 rounded-2xl transition-all duration-500 relative border ${showChat ? 'bg-primary border-primary/40 text-white shadow-2xl shadow-primary/30 scale-110' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
                            >
                                <MessageSquare size={18} />
                                <AnimatePresence>
                                    {showChat && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-[#030303] shadow-lg"
                                        />
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeTab === 'video' ? (
                            <motion.div
                                key="video"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className={`grid gap-10 h-full content-start overflow-y-auto pb-40 scrollbar-hide ${peers.length === 0 ? 'grid-cols-1 max-w-5xl mx-auto' :
                                        peers.length === 1 ? 'grid-cols-1 md:grid-cols-2' :
                                            peers.length === 2 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                                                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    }`}
                            >
                                <VideoTile userId={userId} isLocal stream={stream || undefined} peer={null} />

                                {peers.map((peerObj) => (
                                    <VideoTile
                                        key={peerObj.peerId}
                                        peer={peerObj.peer}
                                        userId={peerObj.userId}
                                    />
                                ))}

                                {peers.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="col-span-full flex flex-col items-center justify-center py-24 glass-card border-dashed border-primary/20"
                                    >
                                        <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-primary/20">
                                            <Users size={32} className="text-primary" />
                                        </div>
                                        <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Ghost Node</h3>
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-10 opacity-70">Awaiting peer synchronization</p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(roomId);
                                                alert("Protocol Copied!");
                                            }}
                                            className="px-10 py-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all"
                                        >
                                            Infect Peers: {roomId}
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="whiteboard"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                className="h-full pb-32"
                            >
                                <Whiteboard socket={socketRef.current} roomId={roomId as string} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Floating Controls Overlay */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-6">
                        {/* User Guidance Tooltip */}
                        <AnimatePresence>
                            {peers.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-6 py-2 bg-primary/10 border border-primary/20 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3 shadow-2xl shadow-primary/20"
                                >
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                                    Operational Tip: Broadcast node link to initialize collective
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center gap-3 px-6 py-4 glass-morphism border-white/10 rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
                        >
                            <button
                                onClick={toggleMute}
                                className={`p-5 rounded-3xl transition-all duration-500 ${isMuted ? 'bg-accent text-white shadow-xl shadow-accent/20 scale-110' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button
                                onClick={toggleVideo}
                                className={`p-5 rounded-3xl transition-all duration-500 ${isVideoOff ? 'bg-accent text-white shadow-xl shadow-accent/20 scale-110' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}
                            >
                                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                            </button>

                            <div className="w-px h-10 bg-white/10 mx-2" />

                            <button
                                onClick={shareScreen}
                                className={`p-5 rounded-3xl transition-all duration-500 ${isScreenSharing ? 'bg-success text-white shadow-xl shadow-success/20' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}
                            >
                                <Monitor size={24} />
                            </button>
                            <button
                                onClick={() => setIsRecording(!isRecording)}
                                className={`p-5 rounded-3xl transition-all duration-500 ${isRecording ? 'bg-accent text-white border-none animate-pulse' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                            >
                                <Circle size={24} fill={isRecording ? 'currentColor' : 'none'} />
                            </button>

                            <div className="w-px h-10 bg-white/10 mx-2" />

                            <button
                                onClick={endCall}
                                className="p-5 bg-gradient-to-tr from-accent to-[#eb144c] hover:scale-110 text-white rounded-[2rem] shadow-2xl shadow-accent/40 transition-all active:scale-90"
                            >
                                <PhoneOff size={24} />
                            </button>
                        </motion.div>
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ x: 500 }}
                        animate={{ x: 0 }}
                        exit={{ x: 500 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                        className="w-[450px] border-l border-white/5 bg-black/40 backdrop-blur-3xl z-40 overflow-hidden"
                    >
                        <Chat socket={socketRef.current} roomId={roomId as string} userId={userId} />
                    </motion.div>
                )}
            </AnimatePresence>

            <ParticipantsList
                isOpen={showParticipants}
                onClose={() => setShowParticipants(false)}
                localUser={userId}
                remotePeers={peers}
            />

            <DeviceSettings
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                stream={stream}
                onDeviceChange={handleDeviceChange}
            />
        </div>
    );
}
