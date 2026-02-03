'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, FileText, Download, User, Paperclip, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { encryptData, decryptData } from '@/lib/crypto';

interface Message {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
    file?: {
        name: string;
        url: string;
        type: string;
    };
}

interface ChatProps {
    socket: any;
    roomId: string;
    userId: string;
}

const Chat = ({ socket, roomId, userId }: ChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socket.on('receive-message', (message: Message) => {
            const decryptedMessage = {
                ...message,
                text: decryptData(message.text) || message.text
            };
            setMessages(prev => [...prev, decryptedMessage]);
        });

        return () => socket.off('receive-message');
    }, [socket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const encryptedText = encryptData(input);

        const message: Message = {
            id: Date.now().toString(),
            sender: userId,
            text: encryptedText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        socket.emit('send-message', { ...message, roomId });
        setInput('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const message: Message = {
                id: Date.now().toString(),
                sender: userId,
                text: `Shared a file: ${file.name}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                file: {
                    name: file.name,
                    url: event.target?.result as string,
                    type: file.type
                }
            };
            socket.emit('send-message', { ...message, roomId });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col h-full bg-[#030303]/60 backdrop-blur-3xl overflow-hidden font-sans">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                        <User size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-base tracking-tight uppercase">Neural Stream</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck size={12} className="text-success" />
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em]">Quantum Secured</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 text-success rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping" />
                    Active
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: msg.sender === userId ? 20 : -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            className={`flex flex-col ${msg.sender === userId ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`flex items-center gap-2 mb-2 px-2 ${msg.sender === userId ? 'flex-row-reverse' : 'flex-row'}`}>
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                    {msg.sender === userId ? 'Local Node' : msg.sender}
                                </span>
                                <span className="text-[9px] text-gray-700 font-bold tracking-tighter">{msg.timestamp}</span>
                            </div>

                            <div className={`group relative max-w-[90%] px-6 py-4 rounded-[2rem] text-sm leading-relaxed transition-all shadow-2xl ${msg.sender === userId
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white/[0.03] text-gray-200 border border-white/5 rounded-tl-none'
                                }`}>
                                {msg.file ? (
                                    <div className="flex items-center gap-5 py-2">
                                        <div className="bg-white/10 p-4 rounded-3xl border border-white/5 shadow-inner">
                                            <FileText size={28} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black truncate text-xs uppercase tracking-tight">{msg.file.name}</p>
                                            <a
                                                href={msg.file.url}
                                                download={msg.file.name}
                                                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
                                            >
                                                <Download size={14} /> Synchronize
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="font-medium tracking-tight">{msg.text}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a neural packet..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all placeholder:text-gray-600 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em]"
                        />
                        <label className="absolute left-5 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                            <Paperclip size={20} className="text-gray-500 group-hover:text-primary transition-colors" />
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-5 bg-primary hover:bg-primary-hover disabled:opacity-30 disabled:grayscale rounded-[2rem] text-white shadow-2xl shadow-primary/30 transition-all active:scale-90"
                    >
                        <Send size={24} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
