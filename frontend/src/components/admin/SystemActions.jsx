import { AlertCircle, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import OrphanedFilesPanel from './OrphanedFilesPanel';

const SystemActions = ({ isSuperAdmin, handleManualBackup, isBackingUp, api, toast, fetchLogs, fetchStats }) => {
    if (!isSuperAdmin) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden mt-6 relative z-10"
        >
            <div className="p-5 bg-white border-b border-[rgba(0,0,0,0.07)]">
                <h2 className="text-base font-black text-[#b20e0e] uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={18} className="text-[#b20e0e]" />
                    Danger Zone & System Actions
                </h2>
            </div>
            <div className="p-5 space-y-5 bg-[#f4f4f0]/30">
                {/* Manual Backup */}
                <div>
                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                        Manually trigger a full system backup (Database & Uploads).
                    </p>
                    <button
                        onClick={handleManualBackup}
                        disabled={isBackingUp}
                        className="w-full py-2.5 bg-white border border-[rgba(0,0,0,0.1)] text-[#1a1a1a] rounded-xl text-sm font-bold shadow-sm hover:border-[#16a34a]/40 hover:bg-[#16a34a]/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <FileText size={16} />
                        {isBackingUp ? "Backing up..." : "Create Backup"}
                    </button>
                </div>

                {/* Orphaned File Cleanup */}
                <OrphanedFilesPanel />

                {/* Reset Database */}
                <div className="pt-4 border-t border-[rgba(0,0,0,0.07)]">
                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">
                        Permanently wipe all patent entries. Ensure a backup has been exported first.
                    </p>
                    <button
                        onClick={() => {
                            const confirm = window.prompt("Type 'DELETE' to confirm destructive action:");
                            if (confirm === "DELETE") {
                                api.post("/admin/deleteAll")
                                    .then(() => {
                                        toast.success("Database reset complete");
                                        fetchLogs();
                                        fetchStats();
                                    })
                                    .catch(err => toast.error("Reset failed: " + (err.response?.data?.message || err.message)));
                            }
                        }}
                        className="w-full py-2.5 bg-white border border-[rgba(0,0,0,0.1)] text-[#b20e0e] rounded-xl text-sm font-bold shadow-sm hover:border-[#b20e0e]/40 hover:bg-[#b20e0e]/5 transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        Reset Database
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default SystemActions;
