import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';

const SidePanel = ({ isOpen, onClose, title, children, onClear }) => {
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(window.innerHeight - 200);

    const isResizingWidth = useRef(false);
    const isResizingHeight = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizingWidth.current) {
                const newWidth = window.innerWidth - e.clientX;
                if (newWidth > 300 && newWidth < window.innerWidth - 50) {
                    setWidth(newWidth);
                }
            }
            if (isResizingHeight.current) {
                const newHeight = e.clientY - 80;
                if (newHeight > 200 && newHeight < window.innerHeight - 80) {
                    setHeight(newHeight);
                }
            }
        };

        const handleMouseUp = () => {
            isResizingWidth.current = false;
            isResizingHeight.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startResizeWidth = (e) => {
        e.preventDefault();
        isResizingWidth.current = true;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
    };

    const startResizeHeight = (e) => {
        e.preventDefault();
        isResizingHeight.current = true;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 220 }}
                    className="fixed right-0 top-[130px] z-40 bg-white shadow-2xl border-l-2 border-b border-[#b20e0e]/10 flex flex-col rounded-l-2xl rounded-b-2xl overflow-hidden"
                    style={{ width: `${width}px`, height: `${height}px` }}
                >
                    {/* Resize Handle (Left - Width) */}
                    <div
                        onMouseDown={startResizeWidth}
                        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-[#b20e0e]/20 transition-colors z-50 flex items-center justify-center group"
                    >
                        <div className="h-8 w-1 bg-[#b20e0e]/20 rounded-full group-hover:bg-[#b20e0e]/50 transition-colors" />
                    </div>

                    {/* Resize Handle (Bottom - Height) */}
                    <div
                        onMouseDown={startResizeHeight}
                        className="absolute left-0 bottom-0 right-0 h-1.5 cursor-ns-resize hover:bg-[#b20e0e]/20 transition-colors z-50 flex items-center justify-center group"
                    >
                        <div className="w-8 h-1 bg-[#b20e0e]/20 rounded-full group-hover:bg-[#b20e0e]/50 transition-colors" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#f8f8f8] shrink-0">
                        <div className="flex items-center gap-2.5 text-slate-700 ml-2">
                            <div className="p-1.5 bg-[#b20e0e]/10 rounded-lg">
                                <Search className="w-4 h-4 text-[#b20e0e]" />
                            </div>
                            <h2 className="font-black text-[#1a1a1a] tracking-tight">{title}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {onClear && (
                                <button
                                    onClick={onClear}
                                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-[#b20e0e] hover:bg-[#b20e0e]/5 rounded-lg transition-colors border border-slate-200 hover:border-[#b20e0e]/20"
                                >
                                    Clear Search
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[#b20e0e]/5 rounded-full transition-colors text-slate-400 hover:text-[#b20e0e]"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 bg-[#f8f8f8]/50 mb-1">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SidePanel;