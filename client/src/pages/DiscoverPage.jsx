import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDiscoverMovies } from "../api/useMovies";
import MovieGrid from "../components/MovieGrid";
import Pagination from "../components/Pagination";
import TopViewedSidebar from "../components/TopViewedSidebar";
import FilterBar from "../components/FilterBar";
import { SlidersHorizontal } from "lucide-react";

export default function DiscoverPage() {
    const [searchParams] = useSearchParams();
    const category = searchParams.get("category");
    const country = searchParams.get("country");
    const year = searchParams.get("year");

    const [page, setPage] = useState(1);
    const { data, isLoading } = useDiscoverMovies({ category, country, year, page });

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};

    return (
        <div style={{ padding: '0 5%' }}>
            <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e50914] to-[#b91c8a] flex items-center justify-center shadow-lg shrink-0">
                            <SlidersHorizontal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
                                Lọc Phim
                            </h1>
                            <p className="text-sm text-[#6b6b80]">
                                {pagination.totalItems
                                    ? `${pagination.totalItems.toLocaleString()} kết quả`
                                    : "Đang tải..."}
                            </p>
                        </div>
                    </div>

                    <FilterBar />

                    <MovieGrid movies={movies} isLoading={isLoading} />

                    <Pagination
                        currentPage={pagination.currentPage || page}
                        totalPages={pagination.pageRanges || pagination.totalPages || 1}
                        onPageChange={(p) => {
                            setPage(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    />
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block w-[280px] shrink-0">
                    <div className="sticky top-[90px]">
                        <TopViewedSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}
