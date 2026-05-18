const LoadingSkeleton = ({ rows = 5 }) => {
    return (
        <div className="space-y-3 animate-pulse">
            {/* Table Header Skeleton */}
            <div className="grid grid-cols-6 gap-4 bg-[#f8f8f8] p-4 rounded-xl border border-slate-100">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-slate-200 rounded-lg"></div>
                ))}
            </div>

            {/* Table Rows Skeleton */}
            {[...Array(rows)].map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="grid grid-cols-6 gap-4 bg-white border border-slate-100 p-4 rounded-xl"
                    style={{ opacity: 1 - rowIndex * 0.12 }}
                >
                    {[...Array(6)].map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="h-4 bg-slate-100 rounded-lg"
                            style={{ width: `${Math.random() * 40 + 60}%` }}
                        ></div>
                    ))}
                </div>
            ))}

            {/* Red accent shimmer at bottom */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#b20e0e]/20 to-transparent rounded-full" />
        </div>
    );
};

export default LoadingSkeleton;