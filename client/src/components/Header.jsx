import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    Film,
    Menu,
    X,
    ChevronDown,
    Globe,
    Layers,
    Play,
    Calendar,
    Loader2,
} from "lucide-react";
import { useCategories, useCountries, useSearchMovies } from "../api/useMovies";
import { getImageUrl } from "../api/apiClient";

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [showCountries, setShowCountries] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showYears, setShowYears] = useState(false);
    const navigate = useNavigate();
    const catRef = useRef(null);
    const yearRef = useRef(null);

    const startYear = 2000;
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
    const countryRef = useRef(null);
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);

    const { data: catData } = useCategories();
    const { data: countryData } = useCountries();
    const categories = catData?.data?.items || [];
    const countries = countryData?.data?.items || [];

    // Debounce search query (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Live search results
    const { data: searchData, isLoading: searchLoading } = useSearchMovies(debouncedQuery, 1);
    const suggestions = searchData?.data?.items?.slice(0, 8) || [];

    // Show suggestions when typing
    useEffect(() => {
        setShowSuggestions(debouncedQuery.length >= 2 && suggestions.length > 0);
    }, [debouncedQuery, suggestions.length]);

    // Handle scroll effect
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (catRef.current && !catRef.current.contains(e.target))
                setShowCategories(false);
            if (countryRef.current && !countryRef.current.contains(e.target))
                setShowCountries(false);
            if (
                searchRef.current && !searchRef.current.contains(e.target) &&
                mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setShowSuggestions(false);
            setMobileMenu(false);
        }
    };

    const handleSelectMovie = (slug) => {
        navigate(`/phim/${slug}`);
        setSearchQuery("");
        setShowSuggestions(false);
        setMobileMenu(false);
    };

    // Suggestion dropdown component
    const SuggestionDropdown = ({ mobile = false }) => {
        if (!showSuggestions && !searchLoading) return null;
        if (debouncedQuery.length < 2) return null;

        return (
            <div className={`absolute left-0 right-0 ${mobile ? "top-full mt-2" : "top-full mt-3"} bg-[#12121a] border border-white/10 rounded-xl shadow-2xl shadow-purple-500/10 overflow-hidden animate-slide-down z-[60]`}>
                {searchLoading ? (
                    <div className="flex items-center justify-center py-8 gap-3 text-[#a0a0b8]">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                        <span className="text-sm font-medium">Đang tìm kiếm...</span>
                    </div>
                ) : suggestions.length > 0 ? (
                    <>
                        <div className="px-2 py-2 grid gap-1">
                            {suggestions.map((movie) => (
                                <button
                                    key={movie._id || movie.slug}
                                    onClick={() => handleSelectMovie(movie.slug)}
                                    className="group w-full flex items-center gap-4 px-3 py-2.5 hover:bg-white/5 rounded-lg transition-all text-left border border-transparent hover:border-white/5"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative shrink-0">
                                        <img
                                            src={getImageUrl(movie.poster_url || movie.thumb_url)}
                                            alt={movie.name}
                                            className="w-11 h-16 rounded-md object-cover bg-[#1a1a24] shadow-md group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => { e.target.src = getImageUrl(movie.thumb_url); }}
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors rounded-md" />
                                    </div>
                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-[15px] font-medium text-white/90 group-hover:text-purple-400 line-clamp-1 transition-colors">
                                            {movie.name}
                                        </h4>
                                        <p className="text-xs text-gray-400 line-clamp-1 mt-1 font-medium">
                                            {movie.origin_name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            {movie.year && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5">
                                                    {movie.year}
                                                </span>
                                            )}
                                            {movie.quality && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/10 font-medium">
                                                    {movie.quality}
                                                </span>
                                            )}
                                            {movie.lang && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/10 font-medium">
                                                    {movie.lang}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Play icon */}
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:scale-110 opacity-0 group-hover:opacity-100">
                                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                    </div>
                                </button>
                            ))}
                        </div>
                        {/* View all results */}
                        <div className="p-2 border-t border-white/5 bg-white/[0.02]">
                            <button
                                onClick={handleSearch}
                                className="w-full py-2.5 text-center text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                Xem tất cả kết quả cho <span className="text-white">"{debouncedQuery}"</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center text-sm text-gray-400">
                        Không tìm thấy phim nào phù hợp
                    </div>
                )}
            </div>
        );
    };

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 border-b border-white/5 ${scrolled
                ? "bg-[#06060b]/95 backdrop-blur-2xl shadow-2xl shadow-black/40"
                : "bg-[#06060b]/95 backdrop-blur-md"
                }`}
        >
            <div className="px-4 sm:px-6 lg:px-12 xl:px-20">
                <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e50914] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-all group-hover:scale-105">
                            <Film className="w-5 h-5 text-white fill-white/20" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight hidden sm:block">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">Mot</span>
                            <span className="text-[#e50914]">Phim</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-2">
                        <Link
                            to="/"
                            className="px-4 py-2 text-[15px] font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                        >
                            Trang Chủ
                        </Link>

                        {/* Categories Dropdown */}
                        <div ref={catRef} className="relative group/nav">
                            <button
                                onClick={() => {
                                    setShowCategories(!showCategories);
                                    setShowCountries(false);
                                }}
                                className={`flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium transition-colors rounded-lg hover:bg-white/5 ${showCategories ? "text-white bg-white/5" : "text-gray-300 hover:text-white"}`}
                            >
                                <Layers className="w-4 h-4 opacity-80" />
                                Thể Loại
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-300 ${showCategories ? "rotate-180" : "group-hover/nav:translate-y-0.5"}`}
                                />
                            </button>
                            {showCategories && (
                                <div className="absolute top-full left-0 mt-3 w-[560px] p-5 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl animate-slide-down grid grid-cols-4 gap-2 z-50">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.slug}
                                            to={`/the-loai/${cat.slug}`}
                                            onClick={() => setShowCategories(false)}
                                            className="px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-center"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Countries Dropdown */}
                        <div ref={countryRef} className="relative group/nav">
                            <button
                                onClick={() => {
                                    setShowCountries(!showCountries);
                                    setShowCategories(false);
                                }}
                                className={`flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium transition-colors rounded-lg hover:bg-white/5 ${showCountries ? "text-white bg-white/5" : "text-gray-300 hover:text-white"}`}
                            >
                                <Globe className="w-4 h-4 opacity-80" />
                                Quốc Gia
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-300 ${showCountries ? "rotate-180" : "group-hover/nav:translate-y-0.5"}`}
                                />
                            </button>
                            {showCountries && (
                                <div className="absolute top-full left-0 mt-3 w-[560px] p-5 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl animate-slide-down grid grid-cols-4 gap-2 z-50">
                                    {countries.slice(0, 32).map((c) => (
                                        <Link
                                            key={c.slug}
                                            to={`/quoc-gia/${c.slug}`}
                                            onClick={() => setShowCountries(false)}
                                            className="px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-center"
                                        >
                                            {c.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Years Dropdown */}
                        <div ref={yearRef} className="relative group/nav">
                            <button
                                onClick={() => {
                                    setShowYears(!showYears);
                                    setShowCategories(false);
                                    setShowCountries(false);
                                }}
                                className={`flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium transition-colors rounded-lg hover:bg-white/5 ${showYears ? "text-white bg-white/5" : "text-gray-300 hover:text-white"}`}
                            >
                                <Calendar className="w-4 h-4 opacity-80" />
                                Năm
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-300 ${showYears ? "rotate-180" : "group-hover/nav:translate-y-0.5"}`}
                                />
                            </button>
                            {showYears && (
                                <div className="absolute top-full left-0 mt-3 w-[400px] p-5 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl animate-slide-down grid grid-cols-5 gap-2 z-50">
                                    {years.map((year) => (
                                        <Link
                                            key={year}
                                            to={`/nam-phat-hanh/${year}`}
                                            onClick={() => setShowYears(false)}
                                            className="px-2 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-center"
                                        >
                                            {year}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Desktop Search Bar with Suggestions */}
                    <div ref={searchRef} className="hidden md:block flex-1 max-w-lg mx-8 relative group">
                        <form onSubmit={handleSearch}>
                            <div className="relative transform transition-all duration-300 group-focus-within:scale-[1.02]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => debouncedQuery.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                                    placeholder="Tìm tên phim, diễn viên..."
                                    className="w-full pl-11 pr-4 py-3 bg-[#13131c] border border-[rgba(255,255,255,0.08)] rounded-xl text-[15px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-[#1a1a24] focus:ring-4 focus:ring-purple-500/10 transition-all shadow-inner"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </form>
                        <SuggestionDropdown />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenu(!mobileMenu)}
                        className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors bg-white/5 rounded-lg active:scale-95"
                    >
                        {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenu && (
                <div className="lg:hidden bg-[#0a0a0f]/95 backdrop-blur-3xl border-t border-white/5 animate-slide-down h-[calc(100vh-64px)] overflow-y-auto">
                    <div className="px-4 py-6 space-y-6">
                        {/* Mobile Search with Suggestions */}
                        <div ref={mobileSearchRef} className="relative">
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => debouncedQuery.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                                        placeholder="Tìm phim..."
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-base text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all focus:bg-white/10"
                                    />
                                </div>
                            </form>
                            <SuggestionDropdown mobile />
                        </div>

                        <div className="space-y-1">
                            <Link
                                to="/"
                                onClick={() => setMobileMenu(false)}
                                className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-white bg-white/5 rounded-xl border border-white/5"
                            >
                                <Film className="w-5 h-5 text-purple-500" />
                                Trang Chủ
                            </Link>
                        </div>

                        <div className="space-y-3">
                            <div className="px-1 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <Layers className="w-3.5 h-3.5" />
                                Thể Loại
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.slice(0, 14).map((cat) => (
                                    <Link
                                        key={cat.slug}
                                        to={`/the-loai/${cat.slug}`}
                                        onClick={() => setMobileMenu(false)}
                                        className="px-4 py-3 text-sm text-gray-400 bg-white/[0.03] hover:text-white hover:bg-white/10 rounded-lg transition-colors text-center border border-white/[0.02]"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pb-8">
                            <div className="px-1 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <Globe className="w-3.5 h-3.5" />
                                Quốc Gia
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {countries.slice(0, 8).map((c) => (
                                    <Link
                                        key={c.slug}
                                        to={`/quoc-gia/${c.slug}`}
                                        onClick={() => setMobileMenu(false)}
                                        className="px-4 py-3 text-sm text-gray-400 bg-white/[0.03] hover:text-white hover:bg-white/10 rounded-lg transition-colors text-center border border-white/[0.02]"
                                    >
                                        {c.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
