
import { Link, useSearchParams } from "react-router-dom";
import { useNewMovies } from "../api/useMovies";
import MovieGrid from "../components/MovieGrid";
import Pagination from "../components/Pagination";
import HeroBanner from "../components/HeroBanner";
import TopViewedSidebar from "../components/TopViewedSidebar";
import { Flame } from "lucide-react";

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page")) || 1;
    const { data, isLoading } = useNewMovies(page);

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};

    return (
        <div>
            {/* Hero Banner */}
            {!isLoading && movies.length > 0 && (
                <HeroBanner movies={movies} />
            )}

            {/* Main Layout: Content + Sidebar */}
            <div style={{ padding: '0 5%' }}>
                <div className="flex gap-6 lg:gap-8 items-start relative">
                    {/* Left - Movie Grid */}
                    <div className="flex-1 min-w-0">
                        {/* Section Header */}
                        <div className="flex items-center gap-3 mb-5 sm:mb-7">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e50914]/20 to-[#8b5cf6]/20 flex items-center justify-center border border-[#e50914]/10">
                                    <Flame className="w-4 h-4 text-[#e50914]" />
                                </div>
                                <div>
                                    <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-tight">
                                        Phim Mới Cập Nhật
                                    </h1>
                                </div>
                            </div>
                            {pagination.totalItems && (
                                <span className="hidden sm:inline text-[10px] text-[#5a5a72] bg-white/[0.03] px-2.5 py-1 rounded-full ml-auto border border-white/[0.04]">
                                    {pagination.totalItems.toLocaleString()} phim
                                </span>
                            )}
                        </div>

                        <MovieGrid movies={movies} isLoading={isLoading} />

                        <Pagination
                            currentPage={pagination.currentPage || page}
                            totalPages={pagination.pageRanges || pagination.totalPages || 1}
                            onPageChange={(p) => {
                                setSearchParams({ page: String(p) });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        />
                    </div>

                    {/* Right - Sidebar -*/}
                    <div className="hidden lg:block w-[280px] shrink-0">
                        <div className="sticky top-[90px]">
                            <TopViewedSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}