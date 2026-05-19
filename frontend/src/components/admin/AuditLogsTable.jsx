import { Activity, RefreshCw, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import NumericPagination from '../common/NumericPagination';

const AuditLogsTable = ({ logs, fetchLogs, logPage, totalPages, isRefreshing }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col flex-1 h-full overflow-hidden relative z-10"
        >
            <div className="p-6 border-b border-[rgba(0,0,0,0.07)] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#f4f4f0]/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white shadow-sm border border-[rgba(0,0,0,0.06)] text-[#1a1a1a] rounded-xl">
                        <Activity size={22} className="text-[#b20e0e]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#1a1a1a] uppercase tracking-widest">Audit Trail</h2>
                        <p className="text-xs font-bold text-slate-400">System activity log</p>
                    </div>
                </div>
                <button
                    onClick={() => fetchLogs(1, true)}
                    disabled={isRefreshing}
                    className={`p-2.5 bg-white border border-[rgba(0,0,0,0.1)] text-[#1a1a1a] rounded-xl font-bold hover:border-[#b20e0e]/40 hover:bg-[#b20e0e]/5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center gap-2 ${isRefreshing ? 'opacity-80' : ''}`}
                    aria-label="Refresh audit logs"
                >
                    <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="flex-1 overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20">
                        <tr style={{ background: 'linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)' }}>
                            <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-widest w-24">Action</th>
                            <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-widest w-56">User</th>
                            <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-widest">Details</th>
                            <th className="px-6 py-4 text-xs font-black text-white uppercase tracking-widest w-40 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(0,0,0,0.04)]">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                                            <Search size={28} className="text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium text-sm">No activity recorded yet</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log, index) => {
                                const isDanger = log.action === 'DELETE' || log.action === 'DELETE_ALL';
                                const isSuccess = log.action === 'CREATE' || log.action.includes('CREATE');
                                const isWarning = log.action === 'UPDATE' || log.action === 'BATCH_UPDATE' || log.action.includes('UPDATE') || log.action.includes('PASSWORD');
                                
                                return (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="hover:bg-[linear-gradient(90deg,rgba(178,14,14,0.04)_0%,rgba(178,14,14,0.01)_100%)] transition-colors group relative"
                                    style={{ transform: 'translateX(0)', transition: 'transform 0.2s ease, background 0.15s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(3px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                >
                                    <td className="px-6 py-4 align-top relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#b20e0e] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                                            isDanger ? 'bg-[rgba(178,14,14,0.1)] text-[#b20e0e] border-[rgba(178,14,14,0.2)]' :
                                            isSuccess ? 'bg-[rgba(22,163,74,0.1)] text-[#16a34a] border-[rgba(22,163,74,0.2)]' :
                                            isWarning ? 'bg-[rgba(217,119,6,0.1)] text-[#d97706] border-[rgba(217,119,6,0.2)]' :
                                            'bg-[rgba(0,0,0,0.04)] text-[#1a1a1a] border-[rgba(0,0,0,0.1)]'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                isDanger ? 'bg-[#b20e0e]' :
                                                isSuccess ? 'bg-[#16a34a]' :
                                                isWarning ? 'bg-[#d97706]' :
                                                'bg-[#1a1a1a]'
                                                }`}></span>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-[#f4f4f0] border border-[rgba(0,0,0,0.1)] flex items-center justify-center text-[10px] font-black text-[#1a1a1a] shadow-sm">
                                                {log.user_email?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-[#1a1a1a]">{log.user_email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600 leading-relaxed">
                                        {log.details}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-500 text-right whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <br />
                                        <span className="opacity-75">{new Date(log.timestamp).toLocaleDateString()}</span>
                                    </td>
                                </motion.tr>
                            );
                        })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-[rgba(0,0,0,0.06)] bg-[#f4f4f0]/50">
                <NumericPagination
                    currentPage={logPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchLogs(page)}
                    disabled={isRefreshing}
                />
            </div>
        </motion.div>
    );
};

export default AuditLogsTable;
