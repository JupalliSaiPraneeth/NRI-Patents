import { useState, useRef, useEffect } from "react";
import { Download, Upload as UploadIcon, FileSpreadsheet, ChevronLeft, Database, Info } from "lucide-react";
import toast from 'react-hot-toast';
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import UploadForm from "../components/forms/UploadForm";
import BulkImport from "../components/forms/BulkImport";
import PublicationsTable from "../components/data/PublicationsTable";
import SidePanel from "../components/common/SidePanel";
import api from "../api/axios";

const Upload = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  const [prefillData, setPrefillData] = useState(null);

  const tableRef = useRef();
  const hasUnsavedChanges = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleSuccess = () => {
    hasUnsavedChanges.current = false;
    setRefreshTrigger((prev) => prev + 1);
  };

  const onFormChange = (formattedData) => {
    const hasContent = Object.values(formattedData).some(v => v && String(v).trim().length > 0);
    hasUnsavedChanges.current = hasContent;

    const filters = {};
    let hasSearchable = false;

    const trackable = ['patentTitle', 'patentId', 'facultyName', 'email'];
    trackable.forEach(key => {
      if (formattedData[key]?.length > 0) { filters[key] = formattedData[key]; hasSearchable = true; }
    });

    ['designation', 'department'].forEach(key => {
      if (formattedData[key]?.length > 0) {
        filters[key] = formattedData[key];
        if (!formattedData[key].startsWith('Select')) hasSearchable = true;
      }
    });

    if (hasSearchable) { setSearchFilters(filters); setIsPanelOpen(true); }
    else if (Object.keys(filters).length > 0 && isPanelOpen) setSearchFilters(filters);
  };

  const handleClearPanel = () => setSearchFilters({});

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get("/form/downloadTemplate", { responseType: "arraybuffer" });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "patents_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download template");
    }
  };

  const handleExportData = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const currentFilters = tableRef.current?.getFilters() || {};
      const hasActiveFilters = Object.values(currentFilters).some(v => v && String(v).trim().length > 0);
      const params = {};
      if (hasActiveFilters) params.filters = JSON.stringify(currentFilters);

      const response = await api.get("/form/downloadExcel", { params, responseType: "arraybuffer" });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", hasActiveFilters ? "patents-filtered.xlsx" : "patents.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(hasActiveFilters ? "Filtered database exported" : "Database exported successfully");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Failed to export database");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f8]">
      <Header />

      <main className="flex-grow container mx-auto px-4 pt-28 pb-8 lg:pb-12 max-w-[1600px]">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            {/* Red accent */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-0.5 bg-[#b20e0e] rounded-full" />
              <span className="text-[#b20e0e] text-xs font-black uppercase tracking-widest">Patent Submission</span>
            </div>
            <h1 className="text-3xl font-black text-[#1a1a1a] tracking-tight">
              Submit Patent Entry
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">
              Enter details for a new patent or publication record.
            </p>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:border-[#b20e0e]/30 hover:text-[#b20e0e] hover:bg-[#b20e0e]/5 transition-all duration-200"
          >
            <ChevronLeft size={16} />
            Back to Home
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Form */}
          <div className="lg:col-span-8 space-y-6">
            <UploadForm onSuccess={handleSuccess} onFormChange={onFormChange} prefillData={prefillData} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-5 sticky top-24 h-fit">

            {/* Bulk Operations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-1.5 bg-[#b20e0e]/10 rounded-lg">
                  <Database size={16} className="text-[#b20e0e]" />
                </div>
                <h3 className="font-black text-[#1a1a1a] text-sm tracking-tight">Bulk Operations</h3>
              </div>

              <div className="space-y-2">
                {[
                  {
                    icon: UploadIcon,
                    title: "Bulk Import",
                    subtitle: "Upload via Excel file",
                    onClick: () => setIsBulkImportOpen(true),
                  },
                  {
                    icon: FileSpreadsheet,
                    title: "Download Template",
                    subtitle: "Get standard Excel format",
                    onClick: handleDownloadTemplate,
                  },
                ].map(({ icon: Icon, title, subtitle, onClick }) => (
                  <button
                    key={title}
                    onClick={onClick}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f8f8f8] border border-slate-100 hover:border-[#b20e0e]/20 hover:bg-[#b20e0e]/5 transition-all duration-200 text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white text-[#b20e0e]/60 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#b20e0e] group-hover:text-white transition-all duration-200">
                      <Icon size={14} />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-700 text-sm group-hover:text-[#b20e0e] transition-colors">{title}</span>
                      <span className="text-xs text-slate-400">{subtitle}</span>
                    </div>
                  </button>
                ))}

                <div className="my-2 border-t border-slate-100" />

                <button
                  onClick={handleExportData}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f8f8f8] border border-slate-100 hover:border-[#b20e0e]/20 hover:bg-[#b20e0e]/5 transition-all duration-200 text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white text-[#b20e0e]/60 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#b20e0e] group-hover:text-white transition-all duration-200">
                    <Download size={14} />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-700 text-sm group-hover:text-[#b20e0e] transition-colors">Export Database</span>
                    <span className="text-xs text-slate-400">Download all records</span>
                  </div>
                </button>

                <div className="my-2 border-t border-slate-100" />

                <button
                  onClick={() => setIsPanelOpen(!isPanelOpen)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                    isPanelOpen
                      ? "bg-[#b20e0e]/5 border-[#b20e0e]/20"
                      : "bg-[#f8f8f8] border-slate-100 hover:border-[#b20e0e]/20 hover:bg-[#b20e0e]/5"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all duration-200 ${
                    isPanelOpen ? "bg-[#b20e0e] text-white" : "bg-white text-[#b20e0e]/60"
                  }`}>
                    <Database size={14} />
                  </div>
                  <div>
                    <span className={`block font-bold text-sm transition-colors ${isPanelOpen ? "text-[#b20e0e]" : "text-slate-700"}`}>
                      {isPanelOpen ? "Hide Duplicates" : "Check Duplicates"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {isPanelOpen ? "Close side panel" : "View similar entries"}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-[#b20e0e]/10 rounded-lg mt-0.5 shrink-0">
                  <Info size={13} className="text-[#b20e0e]" />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Complete all required fields marked with <span className="text-[#b20e0e] font-bold">*</span>. The side panel activates automatically to check for duplicates as you type.
                </p>
              </div>
            </div>

          </div>
        </div>

      </main>

      <Footer />

      <BulkImport
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={handleSuccess}
      />

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title="Duplicate Check"
        onClear={handleClearPanel}
      >
        <div className="mb-4 text-sm text-slate-500 bg-white p-3 rounded-xl border border-slate-200 flex gap-2.5 items-center shadow-sm">
          <div className="w-1.5 h-1.5 bg-[#b20e0e] rounded-full animate-pulse shrink-0" />
          <span>Checking for similar entries...</span>
        </div>
        <PublicationsTable
          ref={tableRef}
          key={refreshTrigger}
          showActions={false}
          externalFilters={searchFilters}
          onRowClick={(row) => {
            setPrefillData(row);
            toast.success(`Autofilled details for ${row.facultyName}!`, { id: 'autofillToast' });
          }}
        />
      </SidePanel>
    </div>
  );
};

export default Upload;