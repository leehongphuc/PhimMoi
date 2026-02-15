import { useState } from "react";
import { useParams } from "react-router-dom";
import { useYearMovies } from "../api/useMovies";
import MovieGrid from "../components/MovieGrid";
import Pagination from "../components/Pagination";
import TopViewedSidebar from "../components/TopViewedSidebar";
import FilterBar from "../components/FilterBar";
import { Calendar } from "lucide-react";

export default function YearPage() {
    const { year } = useParams();
    const [page, setPage] = useState(1);
    const { data, isLoading } = useYearMovies(year, page);

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};

    return (
        <div style={{ padding: '0 5%' }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center shadow-lg shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
                        Phim Năm {year}
                    </h1>
                    <p className="text-sm text-[#6b6b80]">
                        {pagination.totalItems
                            ? `${pagination.totalItems.toLocaleString()} phim`
                            : "Đang tải..."}
                    </p>
                </div>
            </div>



            <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <FilterBar />
                    <div className="mb-8"></div>

                    <MovieGrid movies={movies} isLoading={isLoading} />

                    <Pagination
                        currentPage={pagination.currentPage || page}
                        totalPages={pagination.pageRanges || 1}
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
