import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Play, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { getImageUrl } from "../api/apiClient";

export default function HeroBanner({ movies = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const bannerMovies = movies.slice(0, 6);

    const goToSlide = useCallback(
        (index) => {
            if (isTransitioning || bannerMovies.length === 0) return;
            setIsTransitioning(true);
            setCurrentIndex(index);
            setTimeout(() => setIsTransitioning(false), 600);
        },
        [isTransitioning, bannerMovies.length]
    );

    const nextSlide = useCallback(() => {
        goToSlide((currentIndex + 1) % bannerMovies.length);
    }, [currentIndex, bannerMovies.length, goToSlide]);

    const prevSlide = useCallback(() => {
        goToSlide((currentIndex - 1 + bannerMovies.length) % bannerMovies.length);
    }, [currentIndex, bannerMovies.length, goToSlide]);

    useEffect(() => {
        if (bannerMovies.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide, bannerMovies.length]);

    // Mobile Swipe Logic
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) nextSlide();
        if (isRightSwipe) prevSlide();
    };

    if (bannerMovies.length === 0) return null;

    const movie = bannerMovies[currentIndex];

    return (
        <div
            className="relative w-full overflow-hidden mb-6 sm:mb-8 group select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Slides */}
            <div className="relative h-[220px] sm:h-[300px] md:h-[380px] lg:h-[440px]">
                {bannerMovies.map((m, i) => (
                    <div
                        key={m.slug || i}
                        className={`absolute inset-0 transition-all duration-700 ease-out ${i === currentIndex
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-105"
                            }`}
                    >
                        <img
                            src={getImageUrl(m.thumb_url || m.poster_url)}
                            alt={m.name}
                            className="w-full h-full object-cover"
                            loading={i === 0 ? "eager" : "lazy"}
                        />
                    </div>
                ))}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#06060b] via-[#06060b]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06060b] via-[#06060b]/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#06060b]/40 to-transparent h-20" />

                {/* Content */}
                <Link to={`/phim/${movie.slug}`} className="absolute inset-0 flex items-end sm:items-center p-4 sm:p-6 md:p-8 lg:p-12">
                    <div className="max-w-xl animate-fade-in" key={currentIndex}>
                        {/* Badges */}
                        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
                            <span className="px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#e50914] text-white rounded-md shadow-md shadow-red-900/30">
                                HOT
                            </span>
                            {movie.quality && (
                                <span className="px-3 py-1 text-[10px] sm:text-xs font-bold bg-white/10 backdrop-blur-sm text-white rounded-md border border-white/10">
                                    {movie.quality}
                                </span>
                            )}
                            {movie.lang && (
                                <span className="px-3 py-1 text-[10px] sm:text-xs font-bold bg-[#8b5cf6]/20 backdrop-blur-sm text-[#c4b5fd] rounded-md border border-[#8b5cf6]/20">
                                    {movie.lang}
                                </span>
                            )}
                            {movie.year && (
                                <span className="px-3 py-1 text-[10px] sm:text-xs font-medium bg-white/5 text-white/60 rounded-md">
                                    {movie.year}
                                </span>
                            )}
                            {movie.episode_current && (
                                <span className="px-3 py-1 text-[10px] sm:text-xs font-medium bg-amber-500/15 text-amber-400 rounded-md border border-amber-500/15">
                                    {movie.episode_current}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black text-white leading-[1.1] line-clamp-2 mb-1.5 sm:mb-2 drop-shadow-lg">
                            {movie.name}
                        </h2>

                        {movie.origin_name && (
                            <p className="text-xs sm:text-sm text-white/40 italic line-clamp-1 mb-3 sm:mb-5">
                                {movie.origin_name}
                            </p>
                        )}

                        {/* Actions */}

                    </div>
                </Link>

                {/* Nav Arrows */}
                {bannerMovies.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/50 hover:border-white/15 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/50 hover:border-white/15 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* Progress Dots */}
                {bannerMovies.length > 1 && (
                    <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 flex items-center gap-1.5">
                        {bannerMovies.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`rounded-full transition-all duration-400 ${i === currentIndex
                                    ? "w-7 h-1.5 bg-gradient-to-r from-[#e50914] to-[#8b5cf6]"
                                    : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
