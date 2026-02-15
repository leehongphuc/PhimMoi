import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCountryMovies } from "../api/useMovies";
import MovieGrid from "../components/MovieGrid";
import Pagination from "../components/Pagination";
import TopViewedSidebar from "../components/TopViewedSidebar";
import FilterBar from "../components/FilterBar";
import { Globe } from "lucide-react";

// Map slug to display name
const COUNTRY_NAMES = {
    "trung-quoc": "Trung Quốc",
    "han-quoc": "Hàn Quốc",
    "nhat-ban": "Nhật Bản",
    "thai-lan": "Thái Lan",
    "au-my": "Âu Mỹ",
    "dai-loan": "Đài Loan",
    "hong-kong": "Hồng Kông",
    "an-do": "Ấn Độ",
    anh: "Anh",
    phap: "Pháp",
    canada: "Canada",
    duc: "Đức",
    nga: "Nga",
    "viet-nam": "Việt Nam",
    indonesia: "Indonesia",
};

export default function CountryPage() {
    const { slug } = useParams();
    const [page, setPage] = useState(1);
    const { data, isLoading } = useCountryMovies(slug, page);

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};
    const displayName = COUNTRY_NAMES[slug] || data?.data?.titlePage || slug;

    return (
        <div style={{ padding: '0 5%' }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e50914] to-[#ff4757] flex items-center justify-center shadow-lg shrink-0">
                    <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
                        Phim {displayName}
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
