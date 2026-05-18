import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Mail } from 'lucide-react';

const DeveloperModal = ({ isOpen, onClose }) => {
  const developers = [
    { name: 'Amman Fawaz', email: 'ammanfawaz272@gmail.com' },
    { name: 'Mukesh Babu', email: 'nmbabu309@gmail.com' },
    { name: 'Rahul Dovari', email: 'rahuldovari90@gmail.com' },
    { name: 'Shyam Raju', email: 'shyamraju1012@gmail.com' },
    { name: 'Sekhar Varma', email: 'varma07a@gmail.com' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full text-center overflow-hidden"
          >
            {/* Red accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#b20e0e]" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-[#b20e0e] rounded-2xl shadow-lg shadow-[#b20e0e]/30 mx-auto flex items-center justify-center mb-6">
                <Code size={28} className="text-white" />
              </div>

              <h3 className="text-2xl font-black text-[#1a1a1a] tracking-tight mb-1">Designed & Developed by</h3>
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-8 h-px bg-[#b20e0e]/30" />
                <p className="text-slate-500 text-sm">CSE · Batch of 2027</p>
                <div className="w-8 h-px bg-[#b20e0e]/30" />
              </div>

              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {developers.map((dev, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="flex flex-col items-center group"
                  >
                    <div className="w-10 h-10 bg-[#b20e0e]/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-[#b20e0e] transition-colors duration-300">
                      <span className="text-sm font-black text-[#b20e0e] group-hover:text-white transition-colors duration-300">
                        {dev.name.charAt(0)}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#1a1a1a] mb-1 text-sm">{dev.name}</h4>
                    <a
                      href={`mailto:${dev.email}`}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 hover:border-[#b20e0e]/30 hover:bg-[#b20e0e]/5 transition-all"
                    >
                      <Mail size={10} className="text-slate-400" />
                      <span className="text-[10px] text-slate-500">{dev.email}</span>
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#b20e0e] hover:bg-[#b20e0e]/5 rounded-full transition-all"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeveloperModal;