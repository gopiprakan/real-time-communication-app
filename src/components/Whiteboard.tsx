'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pencil, Eraser, Trash2, Download, Square,
    Circle as CircleIcon, Slash, Palette, Settings2, Cpu
} from 'lucide-react';

interface WhiteboardProps {
    socket: any;
    roomId: string;
}

const Whiteboard = ({ socket, roomId }: WhiteboardProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#6366f1');
    const [brushSize, setBrushSize] = useState(3);
    const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas to fit container
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        socket.on('canvas-data', (data: string) => {
            const image = new Image();
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
            };
            image.src = data;
        });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            socket.off('canvas-data');
        };
    }, [socket]);

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();

        // Emit drawing data
        const base64Data = canvas.toDataURL();
        socket.emit('canvas-data', { roomId, data: base64Data });
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('canvas-data', { roomId, data: canvas.toDataURL() });
    };

    const downloadBoard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `nexus_collab_${roomId}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden relative group">
            {/* Sublte Branded Overlay */}
            <div className="absolute bottom-10 left-10 flex items-center gap-4 opacity-10 pointer-events-none grayscale">
                <Cpu size={24} className="text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-900 dark:text-white">Nexus_Engine // Spatial_Collab</span>
            </div>

            {/* Luxurious Floating Toolbar */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6 p-4 glass-card border-none bg-white/80 dark:bg-gray-800/80 rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]"
            >
                <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-white/5 rounded-[22px]">
                    <button
                        onClick={() => setTool('pencil')}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${tool === 'pencil' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Pencil size={20} />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${tool === 'eraser' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Eraser size={20} />
                    </button>
                </div>

                <div className="w-px h-8 bg-gray-100 dark:bg-white/10" />

                <div className="flex items-center gap-3">
                    {['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#000000'].map((c) => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setTool('pencil'); }}
                            className={`w-8 h-8 rounded-full border-4 border-white dark:border-gray-900 shadow-xl transition-all hover:scale-125 ${color === c && tool === 'pencil' ? 'scale-125 border-indigo-600/20' : ''}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="relative group/picker ml-2">
                        <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
                            <Palette size={18} />
                        </div>
                    </div>
                </div>

                <div className="w-px h-8 bg-gray-100 dark:bg-white/10" />

                <div className="flex items-center gap-4 px-4">
                    <Settings2 size={16} className="text-gray-300" />
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-24 accentuate-indigo-600"
                    />
                </div>

                <div className="w-px h-8 bg-gray-100 dark:bg-white/10" />

                <div className="flex items-center gap-2">
                    <button
                        onClick={clearCanvas}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        title="Purge Deck"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={downloadBoard}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl hover:scale-110 active:scale-95 transition-all"
                        title="Export Matrix"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </motion.div>

            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                className="flex-1 w-full h-full cursor-crosshair touch-none"
            />
        </div>
    );
};

export default Whiteboard;
