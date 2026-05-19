import { useState } from 'react';
import { X, LogIn, Lock, Mail, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', {
        email: email.trim(),
        password
      });

      const { user, token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      login(user);

      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      console.error('Login error:', err.message || err);
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Login failed.';

      if (status) {
        setError(`[Error ${status}] ${message}`);
      } else {
        setError('Network Error: Cannot reach server. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Red top accent bar */}
            <div className="h-1 w-full bg-[#b20e0e]" />

            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <X size={18} />
              </button>

              <div className="w-14 h-14 bg-[#b20e0e] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#b20e0e]/30">
                <Lock size={22} className="text-white" />
              </div>

              <h2 className="text-2xl font-black text-[#1a1a1a] tracking-tight">Admin Portal</h2>
              <p className="text-slate-500 text-sm mt-1">Institutional access credentials</p>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-xl bg-[#b20e0e]/5 border border-[#b20e0e]/20 text-[#b20e0e] text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#b20e0e] focus:ring-2 focus:ring-[#b20e0e]/10 outline-none transition-all text-sm font-medium"
                      placeholder="admin@nriit.edu.in"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#b20e0e] focus:ring-2 focus:ring-[#b20e0e]/10 outline-none transition-all text-sm font-medium"
                      placeholder="••••••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#b20e0e] hover:bg-[#8a0a0a] text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-[#b20e0e]/25 hover:shadow-[#b20e0e]/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ChevronRight size={16} className="opacity-80" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;