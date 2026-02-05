'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, Users, Settings, Share2,
    Layout, Maximize2, Monitor, Home, ChevronRight, Cpu, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Chat from '@/components/Chat';
import Whiteboard from '@/components/Whiteboard';
import VideoTile from '@/components/VideoTile';
import ParticipantsList from '@/components/ParticipantsList';
import DeviceSettings from '@/components/DeviceSettings';

interface PeerState {
    peerId: string;
    peer: Peer.Instance;
    userId: string;
}

const RoomPage = () => {
    const { roomId } = useParams() as { roomId: string };
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [socket, setSocket] = useState<any>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [peers, setPeers] = useState<PeerState[]>([]);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [activeTab, setActiveTab] = useState<'video' | 'whiteboard'>('video');
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('nexus_user');
        if (!storedUser) {
            router.push('/auth');
            return;
        }
        const { name } = JSON.parse(storedUser);
        setUserId(name);

        const newSocket = io('http://localhost:3002');
        setSocket(newSocket);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(s => {
                setStream(s);
                newSocket.emit('join-room', { roomId, userId: name });
            });

        newSocket.on('user-joined', ({ userId: joinedUserId, socketId }) => {
            const peer = createPeer(socketId, newSocket.id!, stream!);
            setPeers(prev => [...prev, { peerId: socketId, peer, userId: joinedUserId }]);
        });

        newSocket.on('receiving-returned-signal', ({ signal, id }) => {
            const item = peers.find(p => p.peerId === id);
            if (item) item.peer.signal(signal);
        });

        newSocket.on('all-users', (users: { userId: string; socketId: string }[]) => {
            const peersList: PeerState[] = [];
            users.forEach(({ userId: uId, socketId }) => {
                if (socketId !== newSocket.id) {
                    const peer = addPeer(newSocket.id!, socketId, stream!);
                    peersList.push({ peerId: socketId, peer, userId: uId });
                }
            });
            setPeers(peersList);
        });

        return () => {
            newSocket.disconnect();
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const createPeer = (userToSignal: string, callerId: string, stream: MediaStream) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peer.on('signal', signal => {
            socket.emit('sending-signal', { userToSignal, callerId, signal });
        });
        return peer;
    };

    const addPeer = (callerId: string, userToSignal: string, stream: MediaStream) => {
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on('signal', signal => {
            socket.emit('returning-signal', { signal, callerId: userToSignal });
        });
        return peer;
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !isMicOn;
            setIsMicOn(!isMicOn);
        }
    };

    const toggleCam = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !isCamOn;
            setIsCamOn(!isCamOn);
        }
    };

    const leaveRoom = () => {
        router.push('/');
    };

    if (!socket || !userId) return null;

    return (
        <div className="flex h-screen bg-secondary dark:bg-black text-foreground overflow-hidden">
            {/* Platinum Navigation Dock */}
            <nav className="w-24 border-r border-gray-100 dark:border-white/5 flex flex-col items-center py-10 gap-10 bg-white dark:bg-gray-900 z-50">
                <div
                    onClick={() => router.push('/')}
                    className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white cursor-pointer hover:rotate-6 transition-all duration-300 shadow-xl shadow-indigo-600/20"
                >
                    <MessageCircle size={28} />
                </div>

                <div className="flex flex-col gap-6">
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all ${activeTab === 'video' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        title="Vision Grid"
                    >
                        <Layout size={24} />
                    </button>
                    <button
                        onClick={() => setActiveTab('whiteboard')}
                        className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all ${activeTab === 'whiteboard' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        title="Collab Engine"
                    >
                        <Monitor size={24} />
                    </button>
                </div>

                <div className="mt-auto flex flex-col gap-6">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-14 h-14 text-gray-400 hover:text-indigo-600 rounded-[20px] flex items-center justify-center transition-all"
                    >
                        <Settings size={24} />
                    </button>
                </div>
            </nav>

            <div className="flex-1 flex flex-col relative min-w-0">
                {/* Platinum Header */}
                <header className="h-24 border-b border-gray-100 dark:border-white/5 bg-white/70 dark:bg-black/70 backdrop-blur-3xl flex items-center justify-between px-10 z-20 shadow-sm">
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h2 className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400">Secure Synchronized Node</h2>
                                <ChevronRight size={14} className="text-gray-300" />
                                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-[10px] border border-indigo-100 dark:border-indigo-500/20">{roomId}</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2 tracking-tighter flex items-center gap-4 italic uppercase">
                                <Cpu size={24} className="text-indigo-600" />
                                Multi-Layered Interface
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div
                            onClick={() => setShowParticipants(true)}
                            className="flex items-center gap-5 cursor-pointer group p-3 pr-8 glass-card border-none bg-indigo-50/50 dark:bg-white/5 rounded-[24px] transition-all hover:scale-105 active:scale-95 translate-x-1"
                        >
                            <div className="flex -space-x-5">
                                {[userId, ...peers.map(p => p.userId)].slice(0, 3).map((name, i) => (
                                    <div key={i} className="w-11 h-11 rounded-[16px] border-4 border-white dark:border-gray-900 bg-indigo-600 flex items-center justify-center text-[11px] font-black text-white shadow-xl">
                                        {name.slice(0, 1).toUpperCase()}
                                    </div>
                                ))}
                                {peers.length > 2 && (
                                    <div className="w-11 h-11 rounded-[16px] border-4 border-white dark:border-gray-900 bg-gray-900 dark:bg-white flex items-center justify-center text-[11px] font-black text-white dark:text-gray-900 shadow-xl">
                                        +{peers.length - 2}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-900 dark:text-white text-[11px] font-black uppercase tracking-widest leading-none">{peers.length + 1} Identifiers</span>
                                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-1.5 opacity-50 flex items-center gap-2">
                                    <Activity size={10} /> Active_Link
                                </span>
                            </div>
                        </div>

                        <div className="w-px h-10 bg-gray-100 dark:bg-white/5" />

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(roomId);
                                    alert("Synchronization Code Copied!");
                                }}
                                className="w-14 h-14 bg-gray-100 dark:bg-white/5 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white text-gray-500 rounded-[20px] transition-all flex items-center justify-center group"
                            >
                                <Share2 size={24} className="group-active:scale-75 transition-transform" />
                            </button>
                            <button
                                onClick={() => setShowChat(!showChat)}
                                className={`w-14 h-14 rounded-[20px] transition-all relative flex items-center justify-center ${showChat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                            >
                                <MessageSquare size={24} />
                                <AnimatePresence>
                                    {showChat && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full border-2 border-white dark:border-gray-900 shadow-lg"
                                        />
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-10 relative overflow-hidden bg-white/40 dark:bg-black/40 backdrop-blur-[50px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'video' ? (
                            <motion.div
                                key="video"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className={`grid gap-12 h-full content-start overflow-y-auto pb-48 scrollbar-hide ${peers.length === 0 ? 'grid-cols-1 max-w-5xl mx-auto' :
                                        peers.length === 1 ? 'grid-cols-1 lg:grid-cols-2' :
                                            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    }`}
                            >
                                <VideoTile userId={userId} isLocal stream={stream || undefined} peer={null} />
                                {peers.map((peerObj) => (
                                    <VideoTile key={peerObj.peerId} peer={peerObj.peer} userId={peerObj.userId} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="whiteboard"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="h-full glass-card border-none overflow-hidden relative shadow-2xl bg-white/60 dark:bg-gray-900/60"
                            >
                                <Whiteboard socket={socket} roomId={roomId} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Impressive Floating Controls */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-10">
                        <AnimatePresence>
                            {peers.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-8 py-3 glass-card border-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]"
                                >
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                                    Deployment Operational: Waiting for peer synchronization
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-4 px-8 py-5 glass-card border-none bg-white/90 dark:bg-gray-900/90 rounded-[36px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)]">
                            <button
                                onClick={toggleMic}
                                className={`w-14 h-14 rounded-[22px] transition-all flex items-center justify-center ${isMicOn ? 'bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-white' : 'bg-accent text-white shadow-xl shadow-accent/30'}`}
                            >
                                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                            </button>
                            <button
                                onClick={toggleCam}
                                className={`w-14 h-14 rounded-[22px] transition-all flex items-center justify-center ${isCamOn ? 'bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-white' : 'bg-accent text-white shadow-xl shadow-accent/30'}`}
                            >
                                {isCamOn ? <Video size={24} /> : <VideoOff size={24} />}
                            </button>

                            <div className="w-px h-10 bg-gray-100 dark:bg-white/5 mx-2" />

                            <button
                                onClick={leaveRoom}
                                className="h-14 px-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[22px] shadow-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 flex items-center gap-4"
                            >
                                <PhoneOff size={20} />
                                Terminate
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Impressive Side Panels */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ x: 450 }}
                        animate={{ x: 0 }}
                        exit={{ x: 450 }}
                        className="w-[450px] border-l border-gray-100 dark:border-white/10 flex flex-col shadow-[-40px_0_80px_-20px_rgba(0,0,0,0.1)] z-40 bg-white dark:bg-gray-950"
                    >
                        <Chat socket={socket} roomId={roomId} userId={userId} />
                    </motion.div>
                )}
            </AnimatePresence>

            <ParticipantsList
                isOpen={showParticipants}
                onClose={() => setShowParticipants(false)}
                localUser={userId}
                remotePeers={peers.map(p => ({ userId: p.userId, peerId: p.peerId }))}
            />

            <DeviceSettings
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                stream={stream}
                onDeviceChange={(type, id) => {
                    console.log(`Hardware Shift: ${type} -> ${id}`);
                }}
            />
        </div>
    );
};

export default RoomPage;
