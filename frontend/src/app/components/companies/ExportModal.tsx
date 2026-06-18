"use client";
import { useState, useMemo } from "react";
import { X, Download, Loader2, CheckSquare, Square } from "lucide-react";

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableKeywords: string[];
    onExport: (keywords: string[], fileName: string) => Promise<void>; // إضافة fileName هنا
}

export default function ExportModal({ isOpen, onClose, availableKeywords, onExport }: ExportModalProps) {
    const [fileName, setFileName] = useState("Companies_Export");
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // منطق تحديد الكل
    const allSelected = useMemo(() => selected.length === availableKeywords.length && availableKeywords.length > 0, [selected, availableKeywords]);

    const toggleSelectAll = () => {
        if (allSelected) setSelected([]);
        else setSelected(availableKeywords);
    };

    const toggleKeyword = (kw: string) => {
        setSelected(prev => prev.includes(kw) ? prev.filter(i => i !== kw) : [...prev, kw]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            {/* Container - تم زيادة الطول عبر h-[80vh] ومطابقة الحجم عبر max-w-lg */}
            <div className="bg-white dark:bg-[#080b10] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#0d1117]">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">تصدير البيانات</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
                </div>

                {/* Content Area - مساحة أكبر للكلمات */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-3 text-sm font-black text-indigo-500 hover:text-indigo-600 transition-colors mb-4"
                    >
                        {allSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                        {allSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}
                    </button>

                    <div className="mb-6">
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            اسم الملف
                        </label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            maxLength={255} // قيد الـ 255 حرفاً
                            placeholder="أدخل اسم الملف..."
                            className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">{fileName.length}/255</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableKeywords.map(kw => (
                            <label key={kw} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${selected.includes(kw) ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500" : "bg-slate-50 dark:bg-[#161b22] border-transparent hover:border-slate-300"}`}>
                                <input type="checkbox" checked={selected.includes(kw)} onChange={() => toggleKeyword(kw)} className="accent-indigo-600 w-4 h-4" />
                                <span className={`text-sm font-bold ${selected.includes(kw) ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-400"}`}>{kw}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0d1117]">
                    <button
                        onClick={async () => { setLoading(true); await onExport(selected, fileName); setLoading(false); onClose(); }}
                        disabled={loading || selected.length === 0}
                        className="w-full bg-slate-950 dark:bg-white text-white dark:text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {loading ? "جاري التصدير..." : `تصدير (${selected.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
}