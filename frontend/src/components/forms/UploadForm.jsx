import { useState, useEffect } from "react";
import {
    Upload, FileText, CheckCircle, X,
    Calendar, User, Building2, Hash, FileCheck,
    Users, BookOpen, Clock, ShieldCheck
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import CustomDatePicker from "../common/CustomDatePicker";
import { DEPARTMENTS } from "../../config/constants";

const TextField = ({ label, name, icon: Icon, placeholder, required = false, type = "text", value, onChange, error }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            {Icon && <Icon size={13} className="text-[#b20e0e]/60" />}
            {label}
            {required && <span className="text-[#b20e0e]">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white focus:ring-2 focus:ring-[#b20e0e]/10 focus:border-[#b20e0e] transition-all outline-none text-sm font-medium placeholder:text-slate-300 ${
                error ? "border-[#b20e0e] bg-[#b20e0e]/5" : "border-slate-200 hover:border-slate-300"
            }`}
        />
        {error && <span className="text-xs text-[#b20e0e] font-medium">{error}</span>}
    </div>
);

const SelectField = ({ label, name, options, icon: Icon, required = false, value, onChange, error }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            {Icon && <Icon size={13} className="text-[#b20e0e]/60" />}
            {label}
            {required && <span className="text-[#b20e0e]">*</span>}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2.5 rounded-xl border-2 bg-white focus:ring-2 focus:ring-[#b20e0e]/10 focus:border-[#b20e0e] transition-all outline-none appearance-none text-sm font-medium ${
                    error ? "border-[#b20e0e] bg-[#b20e0e]/5" : "border-slate-200 hover:border-slate-300"
                }`}
            >
                <option value="">Select {label}</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
        {error && <span className="text-xs text-[#b20e0e] font-medium">{error}</span>}
    </div>
);

const FileField = ({ label, name, fileState, accept = ".pdf", onChange, onRemove }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText size={13} className="text-[#b20e0e]/60" />
            {label}
        </label>
        <div className="relative group">
            <input
                type="file"
                id={name}
                className="hidden"
                accept={accept}
                onChange={(e) => onChange(e, name)}
            />
            <label
                htmlFor={name}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                    fileState
                        ? "border-emerald-300 bg-emerald-50/50 text-emerald-700"
                        : "border-slate-200 hover:border-[#b20e0e]/40 hover:bg-[#b20e0e]/5 text-slate-500"
                }`}
            >
                <div className="flex items-center gap-2">
                    {fileState ? <CheckCircle size={16} className="text-emerald-500" /> : <Upload size={16} className="text-slate-400" />}
                    <span className="text-sm font-medium truncate max-w-[200px]">
                        {fileState ? fileState.name : "Choose PDF file"}
                    </span>
                </div>
                {fileState && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); onRemove(name); }}
                        className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors"
                    >
                        <X size={13} />
                    </button>
                )}
            </label>
        </div>
    </div>
);

// Section header component
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="p-2 bg-[#b20e0e]/10 rounded-xl">
            <Icon size={18} className="text-[#b20e0e]" />
        </div>
        <div>
            <h2 className="text-base font-black text-[#1a1a1a] tracking-tight">{title}</h2>
            <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        </div>
    </div>
);

const UploadForm = ({ onSuccess, onFormChange, prefillData }) => {
    const [formData, setFormData] = useState({
        facultyName: "",
        email: "",
        department: "",
        designation: "",
        caste: "",
        patentId: "",
        patentTitle: "",
        patentType: "Utility",
        approvalType: "Published",
        authors: "",
        coApplicants: "",
        filingDate: "",
        publishingDate: "",
        grantingDate: "",
    });

    const [files, setFiles] = useState({ document: null, grantDocument: null });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Handle prefill data from duplicate check clicks
    useEffect(() => {
        if (prefillData) {
            const newData = {
                ...formData,
                facultyName: prefillData.facultyName || "",
                email: prefillData.email || "",
                department: prefillData.department || "",
                designation: prefillData.designation || "",
                caste: prefillData.caste || "",
            };
            setFormData(newData);
            // Clear errors for prefills
            setErrors(prev => ({
                ...prev,
                facultyName: null,
                email: null,
                department: null,
                designation: null,
            }));
            if (onFormChange) onFormChange(newData);
        }
    }, [prefillData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };
        setFormData(newData);
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        if (onFormChange) onFormChange(newData);
    };

    const handleDateChange = (name, dateValue) => {
        const newData = { ...formData, [name]: dateValue };
        setFormData(newData);
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        if (onFormChange) onFormChange(newData);
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") { toast.error("Only PDF files are allowed"); return; }
            if (file.size > 5 * 1024 * 1024) { toast.error("File size must be less than 5MB"); return; }
            setFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    const handleFileRemove = (name) => setFiles(prev => ({ ...prev, [name]: null }));

    const validateForm = () => {
        const newErrors = {};
        if (!formData.facultyName) newErrors.facultyName = "Faculty name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.department) newErrors.department = "Department is required";
        if (!formData.designation) newErrors.designation = "Designation is required";
        if (!formData.patentTitle) newErrors.patentTitle = "Patent title is required";
        if (!formData.patentId) newErrors.patentId = "Patent ID is required";
        if (!formData.filingDate) newErrors.filingDate = "Filing date is required";
        if (!formData.publishingDate) newErrors.publishingDate = "Publishing date is required";
        if (formData.approvalType === "Granted" && !formData.grantingDate) {
            newErrors.grantingDate = "Granting date is required for granted patents";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) { toast.error("Please fill in all required fields"); return; }

        setLoading(true);
        try {
            const formPayload = new FormData();
            Object.keys(formData).forEach(key => formPayload.append(key, formData[key]));
            if (files.document) formPayload.append("documentFile", files.document);
            if (files.grantDocument) formPayload.append("grantDocumentFile", files.grantDocument);

            await api.post("/form/formEntry", formPayload, { headers: { "Content-Type": "multipart/form-data" } });

            toast.success("Patent entry submitted successfully!");
            if (onSuccess) onSuccess();

            const empty = { facultyName: "", email: "", department: "", designation: "", caste: "", patentId: "", patentTitle: "", patentType: "Utility", approvalType: "Published", authors: "", coApplicants: "", filingDate: "", publishingDate: "", grantingDate: "" };
            setFormData(empty);
            setFiles({ document: null, grantDocument: null });
        } catch (err) {
            console.error("Submission error:", err);
            toast.error(err.response?.data?.message || "Failed to submit entry");
        } finally {
            setLoading(false);
        }
    };

    const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Research Scholar'];
    const PATENT_TYPES = ['Utility', 'Design'];
    const APPROVAL_TYPES = ['Published', 'Granted'];
    const CASTES = ['OC', 'BC', 'SC', 'ST', 'Others'];

    const resetForm = () => {
        const empty = { facultyName: "", email: "", department: "", designation: "", caste: "", patentId: "", patentTitle: "", patentType: "Utility", approvalType: "Published", authors: "", coApplicants: "", filingDate: "", publishingDate: "", grantingDate: "" };
        setFormData(empty);
        setFiles({ document: null, grantDocument: null });
        setErrors({});
        if (onFormChange) onFormChange({});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Faculty Information */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <SectionHeader icon={User} title="Faculty Information" subtitle="Personal and departmental details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <TextField label="Faculty Name" name="facultyName" placeholder="Dr. John Doe" required icon={User} value={formData.facultyName} onChange={handleChange} error={errors.facultyName} />
                    <TextField label="Email Address" name="email" type="email" placeholder="faculty@nri.edu.in" required icon={User} value={formData.email} onChange={handleChange} error={errors.email} />
                    <SelectField label="Department" name="department" options={DEPARTMENTS} required icon={Building2} value={formData.department} onChange={handleChange} error={errors.department} />
                    <SelectField label="Designation" name="designation" options={DESIGNATIONS} required icon={User} value={formData.designation} onChange={handleChange} error={errors.designation} />
                    <SelectField label="Caste" name="caste" options={CASTES} icon={Users} value={formData.caste} onChange={handleChange} error={errors.caste} />
                </div>
            </section>

            {/* 2. Patent Documentation */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <SectionHeader icon={BookOpen} title="Patent Documentation" subtitle="Core details about the patent" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <TextField label="Patent Title" name="patentTitle" placeholder="Enter the full title of the invention" required icon={BookOpen} value={formData.patentTitle} onChange={handleChange} error={errors.patentTitle} />
                    </div>
                    <TextField label="Patent ID / Application No." name="patentId" placeholder="e.g. 202341012345" required icon={Hash} value={formData.patentId} onChange={handleChange} error={errors.patentId} />
                    <TextField label="Authors / Inventors" name="authors" placeholder="Enter all author names" icon={Users} value={formData.authors} onChange={handleChange} error={errors.authors} />
                    <TextField label="Co-Applicants" name="coApplicants" placeholder="Enter co-applicant names" icon={Users} value={formData.coApplicants} onChange={handleChange} error={errors.coApplicants} />
                    <SelectField label="Patent Type" name="patentType" options={PATENT_TYPES} required icon={FileCheck} value={formData.patentType} onChange={handleChange} error={errors.patentType} />
                    <SelectField label="Approval Status" name="approvalType" options={APPROVAL_TYPES} required icon={ShieldCheck} value={formData.approvalType} onChange={handleChange} error={errors.approvalType} />
                </div>
            </section>

            {/* 3. Timeline & Dates */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <SectionHeader icon={Clock} title="Timeline & Dates" subtitle="Important milestones" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <CustomDatePicker label="Filing Date" required value={formData.filingDate} onChange={(date) => handleDateChange("filingDate", date)} error={errors.filingDate} maxDate={new Date().toISOString().split('T')[0]} />
                    <CustomDatePicker label="Publishing Date" required value={formData.publishingDate} onChange={(date) => handleDateChange("publishingDate", date)} error={errors.publishingDate} />
                    <CustomDatePicker label="Granting Date" value={formData.grantingDate} onChange={(date) => handleDateChange("grantingDate", date)} error={errors.grantingDate} />
                </div>
            </section>

            {/* 4. Supporting Documents */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <SectionHeader icon={FileText} title="Supporting Documents" subtitle="Upload proofs (PDF only, max 5MB)" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FileField label="Proof of Publication" name="document" fileState={files.document} onChange={handleFileChange} onRemove={handleFileRemove} />
                    <FileField label="Proof of Grant" name="grantDocument" fileState={files.grantDocument} onChange={handleFileChange} onRemove={handleFileRemove} />
                </div>
            </section>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-2">
                <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                    Reset Form
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#b20e0e] text-white font-black shadow-lg shadow-[#b20e0e]/25 hover:shadow-[#b20e0e]/40 hover:bg-[#8a0a0a] hover:-translate-y-0.5 transition-all duration-300 ${
                        loading ? "opacity-75 cursor-wait" : ""
                    }`}
                >
                    {loading ? "Submitting..." : "Confirm & Publish"}
                    {!loading && <CheckCircle size={16} />}
                </button>
            </div>
        </form>
    );
};

export default UploadForm;