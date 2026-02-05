'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, FileText, Download, User, Paperclip, MoreVertical, Search, Check, CheckCheck, Cpu } from 'lucide-react';
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
    status?: 'sent' | 'delivered' | 'read';
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
                text: decryptData(message.text) || message.text,
                status: 'read' as const
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
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: 'sent'
        };

        socket.emit('send-message', { ...message, roomId });
        setMessages(prev => [...prev, { ...message, text: input }]);
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
                text: `Deployment File Sharing: ${file.name}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                file: {
                    name: file.name,
                    url: event.target?.result as string,
                    type: file.type
                }
            };
            socket.emit('send-message', { ...message, roomId });
            setMessages(prev => [...prev, message]);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 font-sans overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-black/50 backdrop-blur-3xl">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-[13px] text-gray-900 dark:text-white uppercase tracking-[0.2em]">Neural Stream</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">E2E Matrix Encrypted</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all"><Search size={20} /></button>
                    <button className="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Matrix Messages area */}
            <div
                ref={scrollRef}
                className="flex-1 p-8 overflow-y-auto space-y-10 scrollbar-hide bg-gray-50/30 dark:bg-black/30"
            >
                <div className="flex justify-center mb-12">
                    <div className="h-px w-20 bg-gradient-to-r from-transparent to-gray-200 dark:to-white/10" />
                    <span className="px-6 py-2 bg-white dark:bg-gray-900 rounded-full text-[9px] font-black text-gray-400 shadow-sm uppercase tracking-[0.4em] mx-4 border border-gray-100 dark:border-white/5">
                        Historical_Sync
                    </span>
                    <div className="h-px w-20 bg-gradient-to-l from-transparent to-gray-200 dark:to-white/10" />
                </div>

                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        const isMe = msg.sender === userId;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                {!isMe && (
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-3 ml-2">{msg.sender}</span>
                                )}
                                <div className={`group relative max-w-[85%] px-6 py-4 rounded-[28px] shadow-sm transition-all ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/20'
                                        : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5'
                                    }`}>
                                    {msg.file ? (
                                        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl mb-1 min-w-[240px] border border-white/5">
                                            <div className={`p-3 rounded-xl ${isMe ? 'bg-white/20' : 'bg-indigo-600 text-white'}`}><FileText size={24} /></div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-[11px] font-black uppercase tracking-tight truncate">{msg.file.name}</p>
                                                <p className="text-[9px] opacity-70 font-bold uppercase tracking-widest mt-0.5">Application/Data</p>
                                            </div>
                                            <a href={msg.file.url} download={msg.file.name} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                                                <Download size={20} />
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-[14px] leading-relaxed font-medium tracking-tight pr-12">{msg.text}</p>
                                    )}

                                    <div className="absolute right-4 bottom-3 flex items-center gap-2 opacity-50">
                                        <span className="text-[9px] font-black tracking-widest uppercase">{msg.timestamp}</span>
                                        {isMe && (
                                            msg.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Control area */}
            <div className="px-10 py-8 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-white/5">
                <form onSubmit={handleSendMessage} className="flex items-center gap-6">
                    <label className="text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        <Paperclip size={22} />
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="DEPLOY MESSAGE..."
                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-[28px] py-5 px-8 text-[13px] font-black focus:outline-none focus:ring-2 focus:ring-indigo-600/20 placeholder:text-gray-300 dark:placeholder:text-gray-700 uppercase tracking-widest dark:text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all group"
                    >
                        <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
