import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NumericPagination = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const renderContent = () => {
        if (totalPages <= 1) {
            return (
                <div className="flex items-center justify-center gap-1 opacity-40 pointer-events-none">
                    <span className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-400">
                        <ChevronLeft size={15} /> Previous
                    </span>
                    <div className="flex items-center gap-1 mx-2">
                        <span className="w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg border-2 border-[#b20e0e] text-[#b20e0e] bg-white">
                            1
                        </span>
                    </div>
                    <span className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-400">
                        Next <ChevronRight size={15} />
                    </span>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || disabled}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-400 hover:text-[#b20e0e] disabled:opacity-30 transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={15} /> Previous
                </button>

                <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-slate-300">···</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                disabled={disabled}
                                className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg transition-all duration-200 ${
                                    currentPage === page
                                        ? 'bg-[#b20e0e] text-white shadow-md shadow-[#b20e0e]/25'
                                        : 'text-slate-500 hover:bg-[#b20e0e]/5 hover:text-[#b20e0e]'
                                }`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || disabled}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-slate-400 hover:text-[#b20e0e] disabled:opacity-30 transition-colors"
                    aria-label="Next page"
                >
                    Next <ChevronRight size={15} />
                </button>
            </div>
        );
    };

    return (
        <div className="w-full flex justify-center py-2">
            {renderContent()}
        </div>
    );
};

export default NumericPagination;