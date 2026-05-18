import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#b20e0e]/3 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#b20e0e]/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-md w-full text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Giant 404 */}
                    <div className="relative mb-8">
                        <h1 className="text-[10rem] font-black text-[#f8f8f8] leading-none select-none">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-xl font-black text-[#1a1a1a] tracking-tight">Page Not Found</span>
                                <div className="w-8 h-1 bg-[#b20e0e] rounded-full mx-auto mt-2" />
                            </div>
                        </div>
                    </div>

                    <p className="text-slate-500 mb-10 text-sm leading-relaxed max-w-xs mx-auto">
                        The page you're looking for might have been moved, renamed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-bold hover:border-[#b20e0e]/30 hover:text-[#b20e0e] hover:bg-[#b20e0e]/5 transition-all duration-300"
                        >
                            <ArrowLeft size={16} />
                            Go Back
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#b20e0e] hover:bg-[#8a0a0a] text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#b20e0e]/25 hover:shadow-[#b20e0e]/40 hover:-translate-y-0.5"
                        >
                            <Home size={16} />
                            Home Page
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFound;