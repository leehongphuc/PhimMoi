import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (!totalPages || totalPages <= 1) return null;

    const getVisiblePages = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push("...");
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-[#a0a0b8] hover:text-white hover:bg-white/10 hover:border-[#8b5cf6]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {getVisiblePages().map((page, i) =>
                page === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-[#6b6b80]">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${page === currentPage
                                ? "bg-gradient-to-r from-[#e50914] to-[#8b5cf6] text-white shadow-lg shadow-red-500/20"
                                : "bg-white/5 border border-white/10 text-[#a0a0b8] hover:text-white hover:bg-white/10 hover:border-[#8b5cf6]/30"
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-[#a0a0b8] hover:text-white hover:bg-white/10 hover:border-[#8b5cf6]/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
        </div>
    );
}
