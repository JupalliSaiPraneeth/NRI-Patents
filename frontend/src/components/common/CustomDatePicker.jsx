import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const CustomDatePicker = ({ value, onChange, label, required, maxDate, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const containerRef = useRef(null);

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setViewDate(date);
            }
        }
    }, [isOpen, value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrevMonth = (e) => { e.preventDefault(); e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); };
    const handleNextMonth = (e) => { e.preventDefault(); e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); };
    const handlePrevYear = (e) => { e.preventDefault(); e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1)); };
    const handleNextYear = (e) => { e.preventDefault(); e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1)); };

    const handleToday = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setViewDate(new Date());
    };

    const handleDateSelect = (day) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const offset = selectedDate.getTimezoneOffset();
        const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
        const dateStr = localDate.toISOString().split('T')[0];

        if (maxDate && new Date(dateStr) > new Date(maxDate)) return;

        onChange(dateStr);
        setIsOpen(false);
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return 'Select a date...';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Select a date...';
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const daysArray = [];

        for (let i = 0; i < firstDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className="aspect-square"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(year, month, day);
            const offset = currentDayDate.getTimezoneOffset();
            const localDate = new Date(currentDayDate.getTime() - (offset * 60 * 1000));
            const dateStr = localDate.toISOString().split('T')[0];

            const isSelected = value === dateStr;
            const isToday = new Date().toDateString() === currentDayDate.toDateString();
            const isFuture = maxDate && new Date(dateStr) > new Date(maxDate);

            daysArray.push(
                <div
                    key={day}
                    onClick={(e) => { e.stopPropagation(); if (!isFuture) handleDateSelect(day); }}
                    className={`
                        aspect-square flex items-center justify-center text-sm font-semibold rounded-xl transition-all duration-150 relative cursor-pointer select-none
                        ${isSelected
                            ? 'bg-[#b20e0e] text-white shadow-md shadow-[#b20e0e]/30'
                            : isFuture
                                ? 'text-slate-200 cursor-default'
                                : 'text-slate-700 hover:bg-[#b20e0e]/10 hover:text-[#b20e0e]'
                        }
                        ${!isSelected && isToday ? 'text-[#b20e0e] font-black after:content-[""] after:absolute after:bottom-1.5 after:w-1 after:h-1 after:bg-[#b20e0e] after:rounded-full' : ''}
                    `}
                >
                    {day}
                </div>
            );
        }
        return daysArray;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && (
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                    {label}
                    {required && <span className="text-[#b20e0e]">*</span>}
                </label>
            )}

            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full bg-white border-2 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-all duration-200 select-none
                    ${error ? 'border-[#b20e0e] bg-[#b20e0e]/5' : (isOpen ? 'border-[#b20e0e] shadow-[0_0_0_3px_rgba(178,14,14,0.1)]' : 'border-slate-200 hover:border-[#b20e0e]/40')}
                `}
            >
                <Calendar size={18} className={error ? "text-[#b20e0e]" : isOpen ? "text-[#b20e0e]" : "text-slate-400"} />
                <span className={`flex-grow text-sm font-medium ${value ? 'text-slate-800' : 'text-slate-400'}`}>
                    {formatDateDisplay(value)}
                </span>
                <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#b20e0e]' : ''}`} />
            </div>
            {error && <span className="text-xs text-[#b20e0e] mt-1.5 block font-medium">{error}</span>}

            {/* Calendar Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-[calc(100%+10px)] left-0 w-full sm:w-[340px] bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/80 p-5 z-50 select-none"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="font-black text-[#1a1a1a] text-sm px-1">
                                {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </div>
                            <div className="flex gap-0.5">
                                {[
                                    { icon: ChevronsLeft, handler: handlePrevYear, title: "Previous Year" },
                                    { icon: ChevronLeft, handler: handlePrevMonth, title: "Previous Month" },
                                    { icon: ChevronRight, handler: handleNextMonth, title: "Next Month" },
                                    { icon: ChevronsRight, handler: handleNextYear, title: "Next Year" },
                                ].map(({ icon: Icon, handler, title }) => (
                                    <button
                                        key={title}
                                        type="button"
                                        onClick={handler}
                                        title={title}
                                        className="p-1.5 rounded-lg text-slate-400 hover:bg-[#b20e0e]/5 hover:text-[#b20e0e] transition-colors"
                                    >
                                        <Icon size={16} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {daysOfWeek.map(day => (
                                <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase py-1.5 tracking-widest">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {renderDays()}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                            <button
                                type="button"
                                onClick={handleToday}
                                className="text-sm font-bold text-[#b20e0e] hover:bg-[#b20e0e]/5 px-4 py-2 rounded-lg transition-colors"
                            >
                                Jump to Today
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDatePicker;