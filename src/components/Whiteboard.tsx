'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil, Eraser, Trash2, Download, Minus, Plus, Palette, Layers, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WhiteboardProps {
    socket: any;
    roomId: string;
}

const COLORS = ['#8b5cf6', '#f472b6', '#f59e0b', '#10b981', '#ffffff', '#000000'];

const Whiteboard = ({ socket, roomId }: WhiteboardProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#8b5cf6');
    const [size, setSize] = useState(4);
    const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const tempImage = canvas.toDataURL();
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;

                const img = new Image();
                img.src = tempImage;
                img.onload = () => ctx.drawImage(img, 0, 0);
            }
        };

        resize();
        window.addEventListener('resize', resize);

        socket.on('drawing', (data: any) => {
            const { x0, y0, x1, y1, color, size } = data;
            drawLine(x0 * canvas.width, y0 * canvas.height, x1 * canvas.width, y1 * canvas.height, color, size, false);
        });

        return () => {
            window.removeEventListener('resize', resize);
            socket.off('drawing');
        };
    }, [socket]);

    const drawLine = (x0: number, y0: number, x1: number, y1: number, color: string, emitSize: number, emit: boolean) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color;
        ctx.lineWidth = emitSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.closePath();

        if (!emit) return;
        const w = canvasRef.current!.width;
        const h = canvasRef.current!.height;

        socket.emit('draw', {
            roomId,
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color,
            size: emitSize
        });
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        (canvasRef.current as any).lastX = offsetX;
        (canvasRef.current as any).lastY = offsetY;
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        const lastX = (canvasRef.current as any).lastX;
        const lastY = (canvasRef.current as any).lastY;

        drawLine(lastX, lastY, offsetX, offsetY, tool === 'eraser' ? '#030303' : color, size, true);

        (canvasRef.current as any).lastX = offsetX;
        (canvasRef.current as any).lastY = offsetY;
    };

    const onMouseUp = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const downloadBoard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `nexus-board-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    if (!isClient) return null;

    return (
        <div className="flex flex-col h-full bg-[#030303]/40 rounded-[2.5rem] border border-white/5 overflow-hidden relative shadow-2xl backdrop-blur-xl group">
            {/* Dynamic Scanline */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Premium Control Palette */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 p-3 glass-morphism border-white/10 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
            >
                <div className="flex items-center gap-1.5 border-r border-white/10 pr-3 mr-1">
                    <button
                        onClick={() => setTool('pencil')}
                        className={`p-3.5 rounded-2xl transition-all ${tool === 'pencil' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Pencil size={20} />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`p-3.5 rounded-2xl transition-all ${tool === 'eraser' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Eraser size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-3 px-3">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setTool('pencil'); }}
                            style={{ backgroundColor: c }}
                            className={`w-7 h-7 rounded-xl border-2 transition-all hover:scale-125 hover:-translate-y-1 shadow-lg ${color === c && tool === 'pencil' ? 'border-white scale-110 shadow-white/20' : 'border-transparent'}`}
                        />
                    ))}
                    <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/20 hover:scale-110 transition-transform cursor-pointer">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => { setColor(e.target.value); setTool('pencil'); }}
                            className="absolute -inset-2 w-12 h-12 cursor-pointer"
                        />
                        <Palette className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={14} />
                    </div>
                </div>

                <div className="flex items-center gap-4 border-l border-white/10 pl-5 ml-2">
                    <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-2 rounded-2xl border border-white/5 group/slider">
                        <Minus size={14} className="text-gray-600 transition-colors group-hover/slider:text-white" />
                        <input
                            type="range"
                            min="1" max="40"
                            value={size}
                            onChange={(e) => setSize(parseInt(e.target.value))}
                            className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary group-hover/slider:bg-white/20"
                        />
                        <Plus size={14} className="text-gray-600 transition-colors group-hover/slider:text-white" />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 ml-2">
                    <button onClick={downloadBoard} className="p-3.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all" title="Export Stream">
                        <Download size={20} />
                    </button>
                    <button onClick={clearCanvas} className="p-3.5 text-accent/50 hover:text-accent hover:bg-accent/10 rounded-2xl transition-all" title="Wipe Node">
                        <Trash2 size={20} />
                    </button>
                </div>
            </motion.div>

            <div className="flex-1 relative cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseOut={onMouseUp}
                    className="absolute inset-0 w-full h-full"
                />
            </div>

            <div className="absolute bottom-10 left-10 flex items-center gap-3 opacity-30">
                <Terminal size={14} className="text-primary" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] pointer-events-none">
                    Nexus_Matrix_System // Board_v2.4
                </span>
            </div>
        </div>
    );
};

export default Whiteboard;
