import { useState, useRef, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidEmailDomain, getEmailDomainError, DEPARTMENTS } from '../../config/constants';
import api from '../../api/axios';

const BulkImport = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [errors, setErrors] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleWindowDragEnter = (e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setIsDragging(true); } };
    const handleWindowDragOver = (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); };
    const handleWindowDragLeave = (e) => { if (e.clientX === 0 && e.clientY === 0) setIsDragging(false); };
    const handleWindowDrop = (e) => { e.preventDefault(); setIsDragging(false); };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [isOpen]);

  const generateResultExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Import Results');

    const headers = ['Row #', 'Status', 'Error Message', 'Email', 'Faculty Name', 'Department', 'Designation', 'Caste', 'Patent ID', 'Patent Title', 'Co-Applicants', 'Patent Type', 'Approval Type', 'Filing Date', 'Publishing Date', 'Granting Date', 'Document Link', 'Grant Document Link', 'Authors'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB20E0E' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    resultData.forEach((result) => {
      const row = worksheet.addRow([result.rowNumber, result.status === 'success' ? '✅ SUCCESS' : '❌ FAILED', result.error || '', result.data['Email'] || result.data['email'] || '', result.data['Faculty Name'] || result.data['facultyName'] || '', result.data['Department'] || result.data['department'] || '', result.data['Designation'] || result.data['designation'] || '', result.data['Caste'] || result.data['caste'] || '', result.data['Patent ID'] || result.data['patentId'] || '', result.data['Patent Title'] || result.data['patentTitle'] || '', result.data['Co-Applicants'] || result.data['coApplicants'] || '', result.data['Patent Type'] || result.data['patentType'] || '', result.data['Approval Type'] || result.data['approvalType'] || '', result.data['Filing Date'] || result.data['filingDate'] || '', result.data['Publishing Date'] || result.data['publishingDate'] || '', result.data['Granting Date'] || result.data['grantingDate'] || '', result.data['Document Link'] || result.data['documentLink'] || '', result.data['Grant Document Link'] || result.data['grantDocumentLink'] || '', result.data['Authors'] || result.data['authors'] || '']);
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: result.status === 'success' ? 'FFC6EFCE' : 'FFFFC7CE' } };
    });

    worksheet.columns.forEach(c => c.width = 15);
    worksheet.getColumn(3).width = 30;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `import-results-${new Date().getTime()}.xlsx`);
  };

  const handleFileUpload = async (fileOrEvent) => {
    let file = fileOrEvent instanceof File ? fileOrEvent : fileOrEvent.target?.files?.[0];
    if (!file) return;

    setLoading(true);
    setStats({ total: 0, success: 0, failed: 0 });
    setErrors([]);
    setResultData([]);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target.result;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        if (!worksheet || worksheet.rowCount <= 1) throw new Error('Sheet is empty');

        const data = [];
        const headers = worksheet.getRow(1).values;
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            let cellValue = cell.value;
            if (cellValue && typeof cellValue === 'object' && cellValue.richText) cellValue = cellValue.richText.map(rt => rt.text).join('');
            const header = headers[colNumber];
            if (header) rowData[header] = cellValue;
          });
          data.push(rowData);
        });

        setStats(prev => ({ ...prev, total: data.length }));

        let successCount = 0, failCount = 0;
        const newErrors = [], results = [];

        for (let i = 0; i < data.length; i++) {
          const normalizedRow = {};
          Object.keys(data[i]).forEach(key => { normalizedRow[key.split('(')[0].trim()] = data[i][key]; });
          const row = normalizedRow;
          const rowNumber = i + 2;

          try {
            const email = String(row['Email'] || row['email'] || '').trim();
            const payload = { email, facultyName: row['Faculty Name'] || row['facultyName'] || '', department: row['Department'] || row['department'] || '', designation: row['Designation'] || row['designation'] || '', caste: row['Caste'] || row['caste'] || '', patentId: row['Patent ID'] || row['patentId'] || '', patentTitle: row['Patent Title'] || row['patentTitle'] || '', coApplicants: row['Co-Applicants'] || row['coApplicants'] || '', patentType: row['Patent Type'] || row['patentType'] || 'Utility', approvalType: row['Approval Type'] || row['approvalType'] || 'Published', filingDate: row['Filing Date'] || row['filingDate'] || '', publishingDate: row['Publishing Date'] || row['publishingDate'] || '', grantingDate: row['Granting Date'] || row['grantingDate'] || '', documentLink: row['Document Link'] || row['documentLink'] || '', grantDocumentLink: row['Grant Document Link'] || row['grantDocumentLink'] || '', authors: row['Authors'] || row['authors'] || '' };

            if (!payload.filingDate) throw new Error('Filing date is required');
            if (!payload.publishingDate) throw new Error('Publishing date is required');
            if (!payload.email || !payload.email.includes('@')) throw new Error('Invalid email format');
            if (!isValidEmailDomain(payload.email)) throw new Error(getEmailDomainError());
            if (payload.facultyName && !/^[a-zA-Z0-9\s.]*$/.test(String(payload.facultyName))) throw new Error(`Invalid Faculty Name`);
            if (payload.department) {
              const upperDept = payload.department.trim().toUpperCase();
              if (!DEPARTMENTS.includes(upperDept)) throw new Error(`Invalid department: '${payload.department}'`);
              payload.department = upperDept;
            }

            await api.post('/form/bulkImport', [payload]);
            successCount++;
            results.push({ rowNumber, status: 'success', data: row, error: null });
          } catch (err) {
            failCount++;
            const errorMsg = err.response?.data?.message || err.message || 'Upload failed';
            newErrors.push(`Row ${rowNumber}: ${errorMsg}`);
            results.push({ rowNumber, status: 'failed', data: row, error: errorMsg });
          }
          setStats({ total: data.length, success: successCount, failed: failCount });
        }

        setResultData(results);
        if (newErrors.length > 0) setErrors(newErrors);
        if (successCount > 0 && onSuccess) onSuccess();

      } catch (err) {
        console.error('File parsing error', err);
        setErrors(['Failed to parse Excel file. Ensure standard format.']);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleModalDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) handleFileUpload(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onDrop={handleModalDrop}>
          {/* Drag Overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-[#1a1a1a]/95 flex flex-col items-center justify-center"
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="p-8 bg-[#b20e0e]/20 rounded-3xl border-4 border-dashed border-[#b20e0e]/50">
                    <FileSpreadsheet size={80} className="text-[#b20e0e]" strokeWidth={1.5} />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-white mb-2">Drop to upload</p>
                    <p className="text-sm text-white/50">Excel files only (.xlsx, .xls)</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden z-10"
          >
            {/* Red accent bar */}
            <div className="h-1 bg-[#b20e0e]" />

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-black text-[#1a1a1a] tracking-tight flex items-center gap-2.5">
                <div className="p-2 bg-[#b20e0e]/10 rounded-xl">
                  <FileSpreadsheet size={16} className="text-[#b20e0e]" />
                </div>
                Bulk Import Patents
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-[#b20e0e]">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-slate-500 leading-relaxed">
                  Upload an Excel file (.xlsx) containing multiple patent records. Ensure column names match the standard format.
                </p>

                <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="bulk-import-modal-input" disabled={loading} />
                <label
                  htmlFor="bulk-import-modal-input"
                  className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-dashed font-bold w-full cursor-pointer transition-all duration-200 ${
                    loading
                      ? 'opacity-50 cursor-not-allowed border-slate-200 text-slate-400'
                      : 'border-[#b20e0e]/30 bg-[#b20e0e]/5 text-[#b20e0e] hover:bg-[#b20e0e]/10 hover:border-[#b20e0e]/50'
                  }`}
                >
                  {!loading && <Upload size={18} />}
                  {loading ? 'Processing...' : 'Click to Upload or Drag & Drop Excel File'}
                </label>
              </div>

              {(stats.success > 0 || stats.failed > 0) && (
                <div className="p-4 bg-[#f8f8f8] rounded-xl border border-slate-100 text-sm">
                  <div className="flex justify-between items-center mb-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span>Import Status</span>
                    <span>Total: {stats.total}</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-white p-3 rounded-xl border border-emerald-100 text-emerald-700 shadow-sm">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <div className="flex flex-col leading-none">
                        <span className="font-black text-lg">{stats.success}</span>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Success</span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2 bg-white p-3 rounded-xl border border-[#b20e0e]/20 text-[#b20e0e] shadow-sm">
                      <AlertCircle size={16} className="text-[#b20e0e]" />
                      <div className="flex flex-col leading-none">
                        <span className="font-black text-lg">{stats.failed}</span>
                        <span className="text-[10px] text-[#b20e0e] font-bold uppercase tracking-wider">Failed</span>
                      </div>
                    </div>
                  </div>

                  {errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-[#b20e0e] uppercase tracking-wider">{errors.length} row{errors.length > 1 ? 's' : ''} failed</p>
                        <span className="text-[10px] text-slate-400">{errors.length} error{errors.length > 1 ? 's' : ''}</span>
                      </div>
                      <ul className="text-xs text-[#b20e0e] space-y-1 max-h-48 overflow-y-auto pr-1">
                        {errors.map((e, i) => {
                          const colonIdx = e.indexOf(':');
                          const rowPart = colonIdx > -1 ? e.slice(0, colonIdx) : `Row ${i + 1}`;
                          const reason = colonIdx > -1 ? e.slice(colonIdx + 1).trim() : e;
                          return (
                            <li key={i} className="flex items-start gap-1.5 bg-[#b20e0e]/5 border border-[#b20e0e]/20 rounded-lg px-2 py-1.5">
                              <span className="shrink-0 bg-[#b20e0e] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">{rowPart}</span>
                              <span className="text-[#b20e0e]/80">{reason}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {resultData.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <button
                        onClick={generateResultExcel}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#b20e0e] hover:bg-[#8a0a0a] text-white font-black rounded-xl shadow-md shadow-[#b20e0e]/25 hover:shadow-[#b20e0e]/40 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <Download size={16} />
                        Download Result Report
                      </button>
                      <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">Green = Success · Red = Failed</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BulkImport;