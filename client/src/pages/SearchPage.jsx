import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchMovies } from "../api/useMovies";
import MovieGrid from "../components/MovieGrid";
import Pagination from "../components/Pagination";
import { Search } from "lucide-react";

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page")) || 1;

    const [inputValue, setInputValue] = useState(keyword);

    const { data, isLoading } = useSearchMovies(keyword, page);

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};

    // Sync input with URL param
    useEffect(() => {
        setInputValue(keyword);
    }, [keyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchParams({ q: inputValue.trim(), page: "1" });
        }
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ q: keyword, page: String(newPage) });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div style={{ padding: '0 5%' }}>
            <div className="flex-1 min-w-0">
                {/* Header with centered search */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center shadow-lg shrink-0">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
                                Tìm Kiếm Phim
                            </h1>
                            <p className="text-sm text-[#6b6b80]">
                                {keyword && pagination.totalItems
                                    ? `${pagination.totalItems.toLocaleString()} kết quả cho "${keyword}"`
                                    : "Nhập từ khóa để tìm kiếm"}
                            </p>
                        </div>
                    </div>

                    {/* Centered Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nhập tên phim, diễn viên, đạo diễn..."
                                className="w-full pl-12 pr-32 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b6b80] focus:outline-none focus:border-[#8b5cf6]/50 focus:bg-white/8 transition-all text-base"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 btn-gradient py-2.5 px-6 rounded-xl text-sm font-semibold"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results */}
                {keyword && (
                    <>
                        <MovieGrid movies={movies} isLoading={isLoading} />

                        <Pagination
                            currentPage={pagination.currentPage || page}
                            totalPages={pagination.pageRanges || 1}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}

                {!keyword && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#1a1a2e] flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-[#6b6b80]" />
                        </div>
                        <p className="text-lg text-[#a0a0b8]">
                            Nhập từ khóa để tìm kiếm phim
                        </p>
                        <p className="text-sm text-[#6b6b80] mt-1">
                            Tìm theo tên phim, tên gốc, diễn viên...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
