import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCategories, useCountries } from "../api/useMovies";
import { Filter } from "lucide-react";

export default function FilterBar() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { data: catData } = useCategories();
    const { data: countryData } = useCountries();

    const [selectedCat, setSelectedCat] = useState(searchParams.get("category") || "");
    const [selectedCountry, setSelectedCountry] = useState(searchParams.get("country") || "");
    const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "");

    useEffect(() => {
        setSelectedCat(searchParams.get("category") || "");
        setSelectedCountry(searchParams.get("country") || "");
        setSelectedYear(searchParams.get("year") || "");
    }, [searchParams]);

    const categories = catData?.data?.items || [];
    const countries = countryData?.data?.items || [];
    const startYear = 2000;
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (selectedCat) params.set("category", selectedCat);
        if (selectedCountry) params.set("country", selectedCountry);
        if (selectedYear) params.set("year", selectedYear);
        navigate(`/loc-phim?${params.toString()}`);
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center gap-4 p-4 bg-[#12121a] rounded-xl border border-white/5 shadow-sm">
                {/* Category Select */}
                <div className="flex-1 min-w-[140px] relative">
                    <select
                        className="w-full px-4 py-2.5 bg-[#1a1a2e] text-white border border-white/10 rounded-lg outline-none focus:border-purple-500/50 appearance-none cursor-pointer pr-8"
                        value={selectedCat}
                        onChange={(e) => setSelectedCat(e.target.value)}
                    >
                        <option value="">-- Thể Loại --</option>
                        {categories.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                </div>

                {/* Country Select */}
                <div className="flex-1 min-w-[140px] relative">
                    <select
                        className="w-full px-4 py-2.5 bg-[#1a1a2e] text-white border border-white/10 rounded-lg outline-none focus:border-purple-500/50 appearance-none cursor-pointer pr-8"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                        <option value="">-- Quốc Gia --</option>
                        {countries.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                </div>

                {/* Year Select */}
                <div className="flex-1 min-w-[140px] relative">
                    <select
                        className="w-full px-4 py-2.5 bg-[#1a1a2e] text-white border border-white/10 rounded-lg outline-none focus:border-purple-500/50 appearance-none cursor-pointer pr-8"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="">-- Năm Phát Hành --</option>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                </div>

                {/* Filter Button */}
                <button
                    onClick={handleFilter}
                    className="px-6 py-2.5 bg-[#e50914] hover:bg-[#b20710] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                >
                    <Filter className="w-4 h-4" />
                    Lọc Phim
                </button>
            </div>

            {/* Spacer Div to force distance */}
            <div className="h-5 w-full"></div>
        </div>
    );
}
