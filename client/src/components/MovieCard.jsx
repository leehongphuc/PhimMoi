import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { getImageUrl } from "../api/apiClient";

export default function MovieCard({ movie }) {
    if (!movie) return null;

    const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url);
    const year = movie.year;
    const quality = movie.quality || "HD";
    const lang = movie.lang || "Vietsub";
    const episodeCurrent = movie.episode_current || "";

    return (
        <Link to={`/phim/${movie.slug}`} className="block group">
            <div className="movie-card-wrapper aspect-[2/3]">
                {/* Poster */}
                <img
                    src={posterUrl}
                    alt={movie.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = getImageUrl(movie.thumb_url);
                    }}
                />

                {/* Top Left Badge - Lang */}
                {lang && (
                    <span
                        className="absolute z-10 font-semibold rounded"
                        style={{ top: 4, left: 4, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', fontSize: 10, color: '#fff' }}
                    >
                        {lang}
                    </span>
                )}

                {/* Top Right Badge - Quality */}
                {quality && (
                    <span
                        className="absolute z-10 font-semibold rounded"
                        style={{ top: 4, right: 4, background: '#fb923c', padding: '2px 12px', fontSize: 10, color: '#000' }}
                    >
                        {quality}
                    </span>
                )}

                {/* Bottom Left Badge - Episode */}
                {episodeCurrent && (
                    <span
                        className="absolute z-10 font-semibold rounded"
                        style={{ bottom: 4, left: 4, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', fontSize: 10, color: '#fff' }}
                    >
                        {(() => {
                            const ep = episodeCurrent.toLowerCase();
                            const total = movie.episode_total;
                            // Completed movie
                            if (ep.includes('hoàn tất') || ep.includes('full') || ep.includes('trọn bộ')) {
                                return `Trọn bộ ${total || episodeCurrent.replace(/[^\d]/g, '')} tập`;
                            }
                            // Extract current episode number
                            const currentNum = episodeCurrent.replace(/[^\d]/g, '');
                            if (currentNum && total) {
                                return `${currentNum}/${total}`;
                            }
                            return episodeCurrent;
                        })()}
                    </span>
                )}

                {/* Hover Overlay */}
                <div className="overlay">
                    <div className="flex items-center justify-center mb-2">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#e50914] to-[#8b5cf6] flex items-center justify-center shadow-xl shadow-red-500/40 transition-transform duration-300 group-hover:scale-110">
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
                        </div>
                    </div>
                    <h3 className="text-[11px] sm:text-xs font-semibold text-white line-clamp-2 text-center leading-tight">
                        {movie.name}
                    </h3>
                    {year && (
                        <p className="text-[9px] sm:text-[10px] text-white/50 text-center mt-0.5">{year}</p>
                    )}
                </div>

                {/* Bottom gradient (always visible on mobile) */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Title */}
            <div className="mt-2 px-0.5">
                <h3 className="text-[11px] sm:text-xs font-medium text-[#eeeef5] line-clamp-1 group-hover:text-[#e50914] transition-colors duration-200">
                    {movie.name}
                </h3>
                <p className="text-[10px] text-[#5a5a72] line-clamp-1 mt-0.5">
                    {movie.origin_name || (year ? `${year}` : "")}
                </p>
            </div>
        </Link>
    );
}
