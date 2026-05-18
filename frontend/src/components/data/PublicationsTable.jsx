import { useState, useEffect, useRef } from 'react';
import {
  Trash2, Edit, Search, Download, ChevronLeft, ChevronRight,
  X, Filter, SlidersHorizontal, FileText, Award
} from 'lucide-react';
import api from '../../api/axios';

/* ══════════════════════════════════════════════════════
   SVG ICONS FOR TABLE HEADERS
══════════════════════════════════════════════════════ */
const Icons = {
  user: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
    </svg>
  ),
  department: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022zM6 8.694 1 10.36V15h5V8.694zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5V15z" />
      <path d="M2 11h1v1H2v-1zm2 0h1v1H4v-1zm-2 2h1v1H2v-1zm2 0h1v1H4v-1zm4-4h1v1H8V9zm2 0h1v1h-1V9zm-2 2h1v1H8v-1zm2 0h1v1h-1v-1zm2-2h1v1h-1V9zm0 2h1v1h-1v-1zM8 7h1v1H8V7zm2 0h1v1h-1V7zm2 0h1v1h-1V7zM8 5h1v1H8V5zm2 0h1v1h-1V5zm2 0h1v1h-1V5zm0-2h1v1h-1V3z" />
    </svg>
  ),
  designation: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M5.5 2A3.5 3.5 0 0 0 2 5.5v5A3.5 3.5 0 0 0 5.5 14h5a3.5 3.5 0 0 0 3.5-3.5V8a.5.5 0 0 1 1 0v2.5a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 1 10.5v-5A4.5 4.5 0 0 1 5.5 1H8a.5.5 0 0 1 0 1H5.5z" />
      <path d="M16 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  ),
  category: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
    </svg>
  ),
  patentId: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2z" />
      <path d="M4.5 11H3V5h1.5a1.5 1.5 0 0 1 0 3H3" />
    </svg>
  ),
  title: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
    </svg>
  ),
  authorPos: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  ),
  coApplicants: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  ),
  type: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    </svg>
  ),
  gender: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path fillRule="evenodd" d="M8 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM3 5a5 5 0 1 1 5.5 4.975V12h2a.5.5 0 0 1 0 1h-2v2.5a.5.5 0 0 1-1 0V13h-2a.5.5 0 0 1 0-1h2V9.975A5 5 0 0 1 3 5z" />
    </svg>
  ),
  date: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
    </svg>
  ),
  country: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.1.152.194.229.226.393.167 1.15-.434 1.634-.833.28-.231.494-.408.621-.408.387 0 .796 1.5 2.25 1.5.568 0 .687-.711.803-1.405.065-.392.129-.779.272-.595.08.1.192.146.315.194.206.079.44.169.565.481.137.34.065 1.015-.012 1.627-.042.337-.083.669-.083.873 0 .204.183.465.426.793.295.4.646.877.824 1.457.234.768-.124 1.638-.593 1.834-.281.117-.639.04-1.01-.041-.35-.077-.711-.157-.987-.072-.525.163-.908 1.168-1.252 2.075C10.473 15.156 9.31 16 8 16c-4.418 0-8-3.582-8-8 0-1.04.204-2.033.572-2.94.367.26.686.565.96.915.39.498.6 1.063.508 1.351z" />
    </svg>
  ),
  number: (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
      <path d="M9.283 4.002V12H7.971V5.338h-.065L6.072 6.656V5.385l1.899-1.383h1.312z" />
      <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2z" />
    </svg>
  ),
};

/* ══════════════════════════════════════════════════════
   ALL COLUMNS
   minW reduced to create tighter uniform column spacing
   matching the reference screenshot
══════════════════════════════════════════════════════ */
const COLUMNS = [
  { key: 'facultyName', label: 'Faculty Name', icon: Icons.user, minW: 240 },
  { key: 'email', label: 'Email', icon: Icons.email, minW: 280 },
  { key: 'phoneNumber', label: 'Phone', icon: Icons.phone, minW: 180 },
  { key: 'gender', label: 'Gender', icon: Icons.gender, minW: 150 },
  { key: 'department', label: 'Department', icon: Icons.department, minW: 180 },
  { key: 'designation', label: 'Designation', icon: Icons.designation, minW: 220 },
  { key: 'caste', label: 'Category', icon: Icons.category, minW: 150 },
  { key: 'patentId', label: 'Patent ID', icon: Icons.patentId, minW: 200 },
  { key: 'patentTitle', label: 'Patent Title', icon: Icons.title, minW: 350 },
  { key: 'authorPosition', label: 'Author Pos.', icon: Icons.authorPos, minW: 180 },
  { key: 'coApplicants', label: 'Co-Applicants', icon: Icons.coApplicants, minW: 260 },
  { key: 'patentType', label: 'Type', icon: Icons.type, minW: 180 },
  { key: 'filingDate', label: 'Filing Date', icon: Icons.date, minW: 180 },
  { key: 'country', label: 'Country', icon: Icons.country, minW: 150 },
  { key: 'applicationNo', label: 'App. No.', icon: Icons.number, minW: 150 },
];

/* ─── Mock data ─────────────────────────────────────── */
const MOCK_DATA = [
  {
    id: '1',
    facultyName: 'Dr. A. Kumar', email: 'akumar@college.edu', phoneNumber: '9876543210',
    gender: 'Male', department: 'CSE', designation: 'Professor', caste: 'OC',
    patentId: 'IN202301234', patentTitle: 'AI-based Smart Traffic Management System',
    authorPosition: '1', coApplicants: 'B. Rao, C. Singh', patentType: 'Published',
    filingDate: '2023-03-15', country: 'India', applicationNo: 'APP2023001',
  },
  {
    id: '2',
    facultyName: 'Dr. S. Reddy', email: 'sreddy@college.edu', phoneNumber: '9123456789',
    gender: 'Female', department: 'ECE', designation: 'Associate Professor', caste: 'BC',
    patentId: 'IN202305678', patentTitle: 'Low Power IoT Sensor Node Design',
    authorPosition: '1', coApplicants: 'D. Mehta', patentType: 'Granted',
    filingDate: '2023-06-20', country: 'India', applicationNo: 'APP2023002',
  },
  {
    id: '3',
    facultyName: 'Prof. R. Sharma', email: 'rsharma@college.edu', phoneNumber: '9988776655',
    gender: 'Male', department: 'MECH', designation: 'Assistant Professor', caste: 'SC',
    patentId: 'IN202309999', patentTitle: 'Renewable Energy Harvesting Device',
    authorPosition: '2', coApplicants: 'E. Patel, F. Nair', patentType: 'Filed',
    filingDate: '2023-09-10', country: 'India', applicationNo: 'APP2023003',
  },
];

/* ─── Utility ──────────────────────────────────────── */
const exportCSV = (data) => {
  if (!data.length) return;
  const headers = COLUMNS.map(c => c.label).join(',');
  const rows = data.map(r =>
    COLUMNS.map(c => `"${(r[c.key] || '').toString().replace(/"/g, '""')}"`).join(',')
  );
  const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'patents.csv'; a.click();
  URL.revokeObjectURL(url);
};

/* ─── Badge colors ─────────────────────────────────── */
const typeMeta = (type = '') => {
  return { bg: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', text: '#1a1a1a' };
};

/* ─── Cell renderer ─────────────────────────────────── */
const renderCell = (row, key) => {
  const val = row[key] || '—';

  if (key === 'facultyName') return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white shadow-sm"
        style={{ background: 'linear-gradient(135deg,#1a1a1a,#444)' }}>
        {val[0].toUpperCase()}
      </div>
      <span className="text-base font-black text-[#1a1a1a] truncate">{val}</span>
    </div>
  );

  if (key === 'email') return (
    <span className="text-sm text-slate-700 truncate block font-bold">{val}</span>
  );

  if (key === 'department') return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-black whitespace-nowrap"
      style={{ background: 'rgba(0,0,0,0.04)', color: '#1a1a1a', border: '1px solid rgba(0,0,0,0.1)' }}>
      {val}
    </span>
  );

  if (key === 'gender') return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-black whitespace-nowrap"
      style={{
        background: 'rgba(0,0,0,0.04)',
        color: '#1a1a1a',
        border: '1px solid rgba(0,0,0,0.1)',
      }}>
      {val}
    </span>
  );

  if (key === 'patentId' || key === 'applicationNo') return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-black tracking-wider"
      style={{ background: 'rgba(0,0,0,0.04)', color: '#1a1a1a', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'monospace' }}>
      {val}
    </span>
  );

  if (key === 'patentTitle') return (
    <span className="text-sm font-black text-[#1a1a1a] block"
      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}
      title={val}>
      {val}
    </span>
  );

  if (key === 'authorPosition') return (
    <span className="w-9 h-9 rounded-full text-sm font-black inline-flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#1a1a1a,#444)', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
      {val}
    </span>
  );

  if (key === 'patentType') {
    const tm = typeMeta(val);
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-black whitespace-nowrap"
        style={{ background: tm.bg, color: tm.text, border: `1px solid ${tm.border}` }}>
        {val}
      </span>
    );
  }

  return <span className="text-sm text-slate-900 font-bold whitespace-nowrap">{val}</span>;
};

// Cell renderer and other helpers removed for brevity...

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const PublicationsTable = ({
  showActions = true,
  isAuthenticated = false,
  isAdmin = false,
  initialData = MOCK_DATA,
  externalFilters = null,
  onRowClick = null,
}) => {
  /* NOTE: useNavigate removed — add back when inside a Router context:
     import { useNavigate } from 'react-router-dom';
     const navigate = useNavigate();                              */

  const [allData, setAllData] = useState(initialData);
  const [filtered, setFiltered] = useState(initialData);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Sync external filters
  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters);
    }
  }, [externalFilters]);

  // Fetch live patents from the database
  useEffect(() => {
    const fetchPatents = async () => {
      try {
        const response = await api.get('/form/formGet');
        const patents = response.data;
        if (Array.isArray(patents)) {
          const camelCased = patents.map(row => ({
            id: row.id,
            facultyName: row.facultyname || row.facultyName || '',
            email: row.email || '',
            department: row.department || '',
            designation: row.designation || '',
            caste: row.caste || '',
            patentId: row.patentid || row.patentId || '',
            patentTitle: row.patenttitle || row.patentTitle || '',
            authors: row.authors || '',
            coApplicants: row.coapplicants || row.coApplicants || '',
            patentType: row.patenttype || row.patentType || 'Utility',
            approvalType: row.approvaltype || row.approvalType || 'Published',
            filingDate: row.filingdate || row.filingDate || '',
            publishingDate: row.publishingdate || row.publishingDate || '',
            grantingDate: row.grantingdate || row.grantingDate || '',
            documentLink: row.documentlink || row.documentLink || '',
            grantDocumentLink: row.grantdocumentlink || row.grantDocumentLink || '',
          }));
          setAllData(camelCased);
        }
      } catch (err) {
        console.error("Failed to fetch patents from database:", err);
      }
    };
    fetchPatents();
  }, []);

  /* ── Drag-to-scroll ── */
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftSt, setScrollLeftState] = useState(0);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeftSt - walk;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      // If there's horizontal movement (deltaX) or Shift is held
      if (e.deltaX !== 0 || e.shiftKey) {
        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        if (
          (delta > 0 && el.scrollLeft < el.scrollWidth - el.clientWidth) ||
          (delta < 0 && el.scrollLeft > 0)
        ) {
          e.preventDefault();
          e.stopPropagation();
          el.scrollLeft += delta;
        }
      }
      // Standard vertical scroll
      else if (e.deltaY !== 0) {
        // Only trap the scroll if the table CAN actually scroll further in that direction
        const canScrollDown = el.scrollTop < el.scrollHeight - el.clientHeight - 1;
        const canScrollUp = el.scrollTop > 0;

        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
          e.preventDefault();
          e.stopPropagation();
          el.scrollTop += e.deltaY;
        } else {
          // FORCE the window to scroll if the table is at its limit
          // This ensures the user can ALWAYS reach the footer.
          window.scrollBy({ top: e.deltaY, behavior: 'auto' });
        }
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    let res = [...allData];
    Object.entries(filters).forEach(([k, v]) => {
      if (v?.trim())
        res = res.filter(r => (r[k] || '').toString().toLowerCase().includes(v.toLowerCase()));
    });
    setFiltered(res);
    setPage(1);
  }, [filters, allData]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageData = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const handleDelete = (id) => { setAllData(prev => prev.filter(r => r.id !== id)); setDeleteId(null); };
  const activeFilters = Object.values(filters).filter(v => v?.trim()).length;

  /* ── Uniform cell padding — matches reference screenshot ── */
  const cellPx = 'px-3 py-3';   // 12px horizontal, 12px vertical — tight & uniform

  return (
    <>
      <div className="w-full">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Patents', value: allData.length, icon: <Award size={18} />, color: '#b20e0e' },
            { label: 'Departments', value: new Set(allData.map(d => d.department)).size, icon: <FileText size={18} />, color: '#2563eb' },
            { label: 'Filtered Results', value: filtered.length, icon: <Search size={18} />, color: '#16a34a' },
            { label: 'This Page', value: pageData.length, icon: <SlidersHorizontal size={18} />, color: '#d97706' },
          ].map((s, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl p-5 cursor-default group"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/60 mb-2">{s.label}</p>
                  <p className="text-4xl font-black text-[#1a1a1a] tracking-tighter leading-none">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TOOLBAR ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilter(p => !p)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
              style={{
                background: showFilter ? '#b20e0e' : 'white', color: showFilter ? 'white' : '#1a1a1a',
                border: showFilter ? 'none' : '1px solid rgba(0,0,0,0.1)',
                boxShadow: showFilter ? '0 4px 16px rgba(178,14,14,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
              }}>
              <Filter size={14} /> Search Filters
              {activeFilters > 0 && (
                <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                  style={{ background: showFilter ? 'rgba(255,255,255,0.25)' : '#b20e0e', color: 'white' }}>
                  {activeFilters}
                </span>
              )}
            </button>
            {activeFilters > 0 && (
              <button onClick={() => setFilters({})}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#b20e0e] hover:bg-[#b20e0e]/5 transition-colors border border-[#b20e0e]/20">
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">Rows</span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(+e.target.value); setPage(1); }}
              className="text-sm font-bold text-[#1a1a1a] bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-[#b20e0e]/40 transition-colors">
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={() => exportCSV(filtered)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#1a1a1a,#333)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* ── FILTER ROW ── */}
        {showFilter && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5 p-4 rounded-2xl"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', animation: 'slideDown 0.25s ease' }}>
            <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
            {COLUMNS.map(col => (
              <div key={col.key} className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                <input type="text" placeholder={col.label} value={filters[col.key] || ''}
                  onChange={e => setFilters(p => ({ ...p, [col.key]: e.target.value }))}
                  className="w-full pl-6 pr-2 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#b20e0e]/50 focus:bg-white transition-all placeholder-slate-300" />
              </div>
            ))}
          </div>
        )}

        {/* ── TABLE CARD ── */}
        <div className="rounded-2xl overflow-hidden relative z-10"
          style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`overflow-auto custom-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            style={{ WebkitOverflowScrolling: 'touch', maxHeight: '600px' }}>

            <table className="w-full border-collapse" style={{ tableLayout: 'fixed', pointerEvents: isDragging ? 'none' : 'auto' }}>

              {/* ── colgroup: drives uniform column widths ── */}
              <colgroup>
                <col style={{ width: '42px' }} />
                {COLUMNS.map(col => <col key={col.key} style={{ width: `${col.minW}px` }} />)}
                {showActions && (isAuthenticated || isAdmin) && <col style={{ width: '80px' }} />}
              </colgroup>

              {/* THEAD */}
              <thead className="sticky top-0 z-20">
                <tr style={{ background: 'linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%)' }}>
                  {/* # */}
                  <th className={`${cellPx} text-left`}>
                    <span className="text-xs font-black text-white/70 uppercase tracking-widest">#</span>
                  </th>
                  {COLUMNS.map(col => (
                    <th key={col.key} className={`${cellPx} text-left`}>
                      <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">
                        {col.label}
                      </span>
                    </th>
                  ))}
                  {showActions && (isAuthenticated || isAdmin) && (
                    <th className={`${cellPx} text-center`}>
                      <span className="text-xs font-black text-white uppercase tracking-widest">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>

              {/* TBODY */}
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length + 2} className="text-center py-20">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ background: 'rgba(178,14,14,0.08)', border: '2px dashed rgba(178,14,14,0.2)' }}>
                          <FileText size={24} className="text-[#b20e0e]/40" />
                        </div>
                        <div>
                          <p className="font-black text-slate-400">No patents found</p>
                          <p className="text-slate-300 text-sm mt-1">
                            {activeFilters > 0 ? 'Try adjusting your filters' : 'Be the first to submit a patent entry!'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : pageData.map((row, i) => {
                  const globalIndex = (page - 1) * rowsPerPage + i + 1;
                  const isHovered = hoveredRow === i;
                  return (
                    <tr key={row.id}
                      onClick={() => onRowClick && onRowClick(row)}
                      className="relative group cursor-pointer"
                      style={{
                        background: isHovered
                          ? 'linear-gradient(90deg,rgba(178,14,14,0.04) 0%,rgba(178,14,14,0.01) 100%)'
                          : i % 2 === 0 ? 'white' : 'rgba(248,248,250,0.8)',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                        transition: 'transform 0.2s ease, background 0.15s ease',
                      }}
                      onMouseEnter={() => setHoveredRow(i)}
                      onMouseLeave={() => setHoveredRow(null)}>

                      {/* Row # */}
                      <td className={`relative ${cellPx}`}>
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 transition-opacity duration-200"
                          style={{ background: '#b20e0e', opacity: isHovered ? 1 : 0 }} />
                        <span className="text-xs font-black text-slate-500">{globalIndex}</span>
                      </td>

                      {/* Data cells */}
                      {COLUMNS.map(col => (
                        <td key={col.key} className={cellPx}>
                          {renderCell(row, col.key)}
                        </td>
                      ))}

                      {/* Actions */}
                      {showActions && (isAuthenticated || isAdmin) && (
                        <td className={cellPx}>
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              onClick={() => { /* navigate(`/edit/${row.id}`) */ }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:-translate-y-0.5 transition-all duration-150"
                              style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.2)' }} title="Edit">
                              <Edit size={12} />
                            </button>
                            {isAdmin && (
                              <button onClick={() => setDeleteId(row.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:-translate-y-0.5 transition-all duration-150"
                                style={{ background: 'rgba(178,14,14,0.1)', color: '#b20e0e', border: '1px solid rgba(178,14,14,0.2)' }} title="Delete">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION ── */}
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-xs text-slate-400 font-semibold">
                Showing{' '}
                <span className="text-[#1a1a1a] font-black">{(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)}</span>
                {' '}of <span className="text-[#1a1a1a] font-black">{filtered.length}</span> records
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <ChevronLeft size={15} className="text-slate-600" />
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let p;
                  if (totalPages <= 7) p = i + 1;
                  else if (page <= 4) p = i + 1;
                  else if (page >= totalPages - 3) p = totalPages - 6 + i;
                  else p = page - 3 + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-xl text-xs font-black hover:-translate-y-0.5 transition-all duration-150"
                      style={{
                        background: p === page ? 'linear-gradient(135deg,#1a1a1a,#333)' : 'rgba(0,0,0,0.03)',
                        color: p === page ? 'white' : '#64748b',
                        border: p === page ? 'none' : '1px solid rgba(0,0,0,0.08)',
                        boxShadow: p === page ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                      }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <ChevronRight size={15} className="text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── DELETE MODAL ── */}
        {deleteId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteId(null)}>
            <div className="w-full max-w-sm rounded-2xl p-8 text-center"
              style={{ background: 'white', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
              onClick={e => e.stopPropagation()}>
              <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}`}</style>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(178,14,14,0.08)', border: '2px solid rgba(178,14,14,0.15)' }}>
                <Trash2 size={22} className="text-[#b20e0e]" />
              </div>
              <h3 className="text-xl font-black text-[#1a1a1a] mb-2">Delete Patent?</h3>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                This action is permanent and cannot be undone. The record will be removed from the database.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:-translate-y-0.5 transition-all"
                  style={{ background: 'linear-gradient(135deg,#b20e0e,#d41515)', boxShadow: '0 4px 16px rgba(178,14,14,0.35)' }}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PublicationsTable;