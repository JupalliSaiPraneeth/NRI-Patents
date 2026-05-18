import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit } from 'lucide-react';
import UploadForm from './UploadForm';

const EditPublicationModal = ({ isOpen, onClose, publication, onSuccess }) => {
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
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            {/* Red top accent */}
            <div className="h-1 bg-[#b20e0e]" />

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#b20e0e]/10 rounded-xl">
                  <Edit size={18} className="text-[#b20e0e]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#1a1a1a] tracking-tight">Edit Patent</h2>
                  <p className="text-xs font-medium text-slate-400">Update the patent details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-[#b20e0e] hover:bg-[#b20e0e]/5 rounded-xl transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <UploadForm
                initialData={publication}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditPublicationModal;