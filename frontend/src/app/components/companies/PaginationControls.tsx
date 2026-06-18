"use client";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200/40 dark:border-slate-900/40">
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl bg-white dark:bg-[#080b10] border border-slate-200 dark:border-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#0f141c] transition-all font-black flex items-center gap-1 text-xs"
            >
                <ChevronRight size={16} />
                <span>السابق</span>
            </button>

            <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, index) => {
                    const pageNum = index + 1;
                    if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === pageNum
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                                    : "bg-white dark:bg-[#080b10] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-[#0f141c]"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                    ) {
                        return <span key={pageNum} className="text-slate-400 dark:text-slate-600 px-1 font-black">...</span>;
                    }
                    return null;
                })}
            </div>

            <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl bg-white dark:bg-[#080b10] border border-slate-200 dark:border-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#0f141c] transition-all font-black flex items-center gap-1 text-xs"
            >
                <span>التالي</span>
                <ChevronLeft size={16} />
            </button>
        </div>
    );
}