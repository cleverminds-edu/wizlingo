"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Upload, Download, X, ChevronDown, ChevronRight } from "lucide-react";

interface School {
  id: string;
  name: string;
  code: string;
  logoUrl: string | null;
  createdAt: string;
  totalStudents: number;
  totalClasses: number;
}

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  pin: string;
  createdAt: string;
  class: { grade: number; section: string };
}

interface ImportRow {
  name: string;
  grade: number;
  section: string;
  rollNumber: string;
  gender?: string;
}

export default function WizAdminDashboard() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState<{ created: Student[]; errors: { row: number; reason: string }[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [newSchool, setNewSchool] = useState({ name: "", code: "", logoUrl: "" });
  const [addingSchool, setAddingSchool] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetchSchools();
  }, []);

  async function fetchSchools() {
    setLoading(true);
    try {
      const res = await fetch("/api/wizadmin/schools");
      if (res.status === 401) { router.push("/wizadmin"); return; }
      const data = await res.json();
      setSchools(data.schools);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudents(school: School) {
    setSelectedSchool(school);
    setStudentsLoading(true);
    setImportResult(null);
    try {
      const res = await fetch(`/api/wizadmin/schools/${school.id}/students`);
      const data = await res.json();
      setStudents(data.students);
    } finally {
      setStudentsLoading(false);
    }
  }

  async function handleAddSchool(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddingSchool(true);
    try {
      const res = await fetch("/api/wizadmin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchool),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error); return; }
      setShowAddSchool(false);
      setNewSchool({ name: "", code: "", logoUrl: "" });
      await fetchSchools();
    } finally {
      setAddingSchool(false);
    }
  }

  function parseCSV(text: string): ImportRow[] {
    const lines = text.trim().split("\n").filter(Boolean);
    const start = lines[0]?.toLowerCase().startsWith("name") ? 1 : 0;
    return lines.slice(start).map((line) => {
      const [name, grade, section, rollNumber, gender] = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      return { name, grade: Number(grade), section, rollNumber, gender };
    });
  }

  function handleCSVFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setImportPreview(parseCSV(text));
      setImportResult(null);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!selectedSchool || importPreview.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/wizadmin/schools/${selectedSchool.id}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: importPreview }),
      });
      const data = await res.json();
      setImportResult(data);
      setImportPreview([]);
      if (fileRef.current) fileRef.current.value = "";
      await fetchStudents(selectedSchool);
      await fetchSchools();
    } finally {
      setImporting(false);
    }
  }

  function downloadCredentials() {
    if (!students.length || !selectedSchool) return;
    const header = "Name,Admission Number,PIN,Grade,Section\n";
    const rows = students.map((s) =>
      `"${s.name}",${s.admissionNumber},${s.pin},${s.class.grade},${s.class.section}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedSchool.code}_credentials.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    await fetch("/api/wizadmin/auth", { method: "DELETE" });
    router.push("/wizadmin");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧙</span>
          <div>
            <p className="font-black text-lg leading-none">WizLingo Admin</p>
            <p className="text-gray-400 text-xs">Internal school management</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Left sidebar — schools list */}
        <aside className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <p className="font-bold text-sm text-gray-300 uppercase tracking-wider">Schools</p>
            <button
              onClick={() => setShowAddSchool(true)}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <Plus size={14} /> Add School
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading…</div>
            ) : schools.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-3xl mb-2">🏫</p>
                <p className="text-sm">No schools yet</p>
              </div>
            ) : (
              schools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => fetchStudents(school)}
                  className={`w-full text-left px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center justify-between ${selectedSchool?.id === school.id ? "bg-indigo-900/30 border-l-2 border-l-indigo-400" : ""}`}
                >
                  <div>
                    <p className="font-semibold text-sm">{school.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{school.code} · {school.totalStudents} students</p>
                  </div>
                  {selectedSchool?.id === school.id ? <ChevronDown size={16} className="text-indigo-400" /> : <ChevronRight size={16} className="text-gray-600" />}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto p-8">
          {!selectedSchool ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <p className="text-5xl mb-4">👈</p>
              <p className="text-lg font-semibold">Select a school to manage students</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-5xl">
              {/* School header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black">{selectedSchool.name}</h1>
                  <p className="text-gray-400 text-sm">Code: {selectedSchool.code} · {selectedSchool.totalStudents} students · {selectedSchool.totalClasses} classes</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowImport(true); setImportPreview([]); setImportResult(null); }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Upload size={16} /> Import CSV
                  </button>
                  {students.length > 0 && (
                    <button
                      onClick={downloadCredentials}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Download size={16} /> Download Credentials
                    </button>
                  )}
                </div>
              </div>

              {/* Import result */}
              {importResult && (
                <div className={`rounded-xl p-4 border ${importResult.errors.length === 0 ? "bg-emerald-900/20 border-emerald-500/30" : "bg-amber-900/20 border-amber-500/30"}`}>
                  <p className="font-bold text-sm mb-1">
                    Import complete: {importResult.created.length} created, {importResult.errors.length} skipped
                  </p>
                  {importResult.errors.map((e) => (
                    <p key={e.row} className="text-amber-300 text-xs">Row {e.row}: {e.reason}</p>
                  ))}
                </div>
              )}

              {/* Students table */}
              {studentsLoading ? (
                <div className="text-gray-400 text-center py-12">Loading students…</div>
              ) : students.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-4xl mb-3">📋</p>
                  <p>No students yet — import a CSV to get started</p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="grid grid-cols-5 text-xs font-bold uppercase tracking-wider text-gray-400 px-6 py-3 border-b border-white/10">
                    <span>Name</span>
                    <span>Admission No.</span>
                    <span>PIN</span>
                    <span>Grade</span>
                    <span>Section</span>
                  </div>
                  <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                    {students.map((s) => (
                      <div key={s.id} className="grid grid-cols-5 px-6 py-3 text-sm hover:bg-white/5">
                        <span className="font-medium">{s.name}</span>
                        <span className="font-mono text-indigo-300">{s.admissionNumber}</span>
                        <span className="font-mono text-emerald-300">{s.pin}</span>
                        <span>{s.class.grade}</span>
                        <span>{s.class.section}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add School Modal */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg">Add New School</h2>
              <button onClick={() => setShowAddSchool(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">School Name</label>
                <input value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. St. Mary's School" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">School Code</label>
                <input value={newSchool.code} onChange={(e) => setNewSchool({ ...newSchool, code: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                  placeholder="e.g. STMARY" required />
                <p className="text-gray-500 text-xs mt-1">Used as prefix for student admission numbers</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Logo URL <span className="text-gray-500">(optional)</span></label>
                <input value={newSchool.logoUrl} onChange={(e) => setNewSchool({ ...newSchool, logoUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://school.com/logo.png" type="url" />
              </div>
              {addError && <p className="text-red-400 text-sm">{addError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddSchool(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addingSchool}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>
                  {addingSchool ? "Creating…" : "Create School"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImport && selectedSchool && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg">Import Students — {selectedSchool.name}</h2>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 mb-5 border border-gray-700">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">CSV Format</p>
              <code className="text-xs text-emerald-300 font-mono">name,grade,section,rollNumber,gender</code>
              <p className="text-gray-400 text-xs mt-1.5">Example: <span className="font-mono text-gray-300">Priya Sharma,5,A,12,F</span></p>
              <p className="text-gray-500 text-xs mt-0.5">Gender is optional (M/F). Used to match AI speaking partner.</p>
              <p className="text-gray-500 text-xs mt-1">Admission number will be auto-generated: <span className="font-mono">{selectedSchool.code}5A012</span></p>
            </div>

            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSVFile}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 mb-4" />

            {importPreview.length > 0 && (
              <>
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-4">
                  <div className="grid grid-cols-4 text-xs font-bold uppercase tracking-wider text-gray-400 px-4 py-2 border-b border-gray-700">
                    <span>Name</span><span>Grade</span><span>Section</span><span>Roll</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-700">
                    {importPreview.slice(0, 20).map((row, i) => (
                      <div key={i} className="grid grid-cols-4 px-4 py-2 text-sm">
                        <span>{row.name}</span><span>{row.grade}</span><span>{row.section}</span><span>{row.rollNumber}</span>
                      </div>
                    ))}
                    {importPreview.length > 20 && (
                      <div className="px-4 py-2 text-xs text-gray-500">+{importPreview.length - 20} more rows</div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-4">{importPreview.length} students ready to import</p>
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowImport(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleImport} disabled={importing || importPreview.length === 0}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                {importing ? "Importing…" : `Import ${importPreview.length} Students`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
