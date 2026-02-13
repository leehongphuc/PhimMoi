import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useMovieDetail, useIncrementView } from "../api/useMovies";
import { getImageUrl } from "../api/apiClient";
import VideoPlayer from "../components/VideoPlayer";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    List,
    Tv,
    Share2,
} from "lucide-react";

export default function WatchPage() {
    const { slug, episode } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useMovieDetail(slug);

    const movie = data?.movie;

    // Auto-increment view when watching an episode
    // The queryKey includes 'episode', so it will refetch when episode changes
    useIncrementView(slug, movie?.name, movie?.thumb_url, episode);

    const episodes = data?.episodes || [];

    // Get all server episodes
    const allEpisodes = useMemo(() => {
        if (episodes.length > 0 && episodes[0]?.server_data) {
            return episodes[0].server_data;
        }
        return [];
    }, [episodes]);

    // Find current episode
    const episodeSlug = episode?.replace("tap-", "") || "1";
    const currentEpIndex = allEpisodes.findIndex(
        (ep) => ep.slug === episodeSlug || ep.name === episodeSlug
    );
    const currentEp = currentEpIndex >= 0 ? allEpisodes[currentEpIndex] : allEpisodes[0];

    const prevEp = currentEpIndex > 0 ? allEpisodes[currentEpIndex - 1] : null;
    const nextEp =
        currentEpIndex < allEpisodes.length - 1
            ? allEpisodes[currentEpIndex + 1]
            : null;

    // Scroll to top on episode change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [episode]);

    if (isLoading) {
        return (
            <div className="page-enter">
                <div className="skeleton aspect-video rounded-2xl mb-6" />
                <div className="skeleton h-8 w-1/2 rounded-lg mb-4" />
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="page-enter flex flex-col items-center justify-center py-20">
                <span className="text-5xl mb-4">😕</span>
                <p className="text-xl text-[#a0a0b8]">Không tìm thấy phim</p>
                <button onClick={() => navigate(-1)} className="btn-gradient mt-6">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
            </div>
        );
    }

    const videoUrl = currentEp?.link_m3u8 || "";
    const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url);

    return (
        <div className="page-enter">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 text-sm">
                <Link to="/" className="text-[#6b6b80] hover:text-white transition-colors">
                    Trang chủ
                </Link>
                <span className="text-[#6b6b80]">/</span>
                <Link
                    to={`/phim/${slug}`}
                    className="text-[#6b6b80] hover:text-white transition-colors line-clamp-1"
                >
                    {movie.name}
                </Link>
                <span className="text-[#6b6b80]">/</span>
                <span className="text-[#e50914] font-medium">
                    Tập {currentEp?.name || episodeSlug}
                </span>
            </div>

            {/* Video Player */}
            <VideoPlayer url={videoUrl} poster={posterUrl} />

            {/* Playback Controls */}
            <div className="flex items-center justify-between mt-4 gap-3">
                <button
                    onClick={() => prevEp && navigate(`/xem/${slug}/tap-${prevEp.slug || prevEp.name}`)}
                    disabled={!prevEp}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#a0a0b8] hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" /> Tập trước
                </button>

                <div className="text-center min-w-0">
                    <h1 className="text-lg lg:text-xl font-bold text-white truncate">
                        {movie.name}
                    </h1>
                    <p className="text-sm text-[#a0a0b8]">
                        Tập {currentEp?.name || episodeSlug}
                        {movie.episode_total ? ` / ${movie.episode_total}` : ""}
                    </p>
                </div>

                <button
                    onClick={() => nextEp && navigate(`/xem/${slug}/tap-${nextEp.slug || nextEp.name}`)}
                    disabled={!nextEp}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#a0a0b8] hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Tập sau <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Episode List */}
            {allEpisodes.length > 1 && (
                <div className="glass-card p-5 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <List className="w-4 h-4 text-[#8b5cf6]" />
                        <h2 className="text-base font-bold text-white">Chọn Tập</h2>
                        <span className="text-xs text-[#6b6b80] ml-auto">
                            {allEpisodes.length} tập
                        </span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                        {allEpisodes.map((ep, idx) => {
                            const isActive =
                                ep.slug === episodeSlug || ep.name === episodeSlug;
                            return (
                                <Link
                                    key={idx}
                                    to={`/xem/${slug}/tap-${ep.slug || ep.name}`}
                                    className={`flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-gradient-to-r from-[#e50914] to-[#8b5cf6] text-white shadow-lg shadow-red-500/20"
                                        : "bg-white/5 border border-white/10 text-[#a0a0b8] hover:text-white hover:bg-white/10"
                                        }`}
                                >
                                    {ep.name || idx + 1}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Movie Info */}
            <div className="glass-card p-5 mt-6">
                <Link to={`/phim/${slug}`} className="flex gap-4 group">
                    <img
                        src={posterUrl}
                        alt={movie.name}
                        className="w-20 h-28 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                        <h3 className="text-base font-bold text-white group-hover:text-[#e50914] transition-colors">
                            {movie.name}
                        </h3>
                        {movie.origin_name && (
                            <p className="text-sm text-[#6b6b80] mt-0.5">{movie.origin_name}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {movie.year && (
                                <span className="text-xs text-[#6b6b80]">{movie.year}</span>
                            )}
                            {movie.quality && (
                                <span className="text-xs text-[#e50914] font-semibold">
                                    {movie.quality}
                                </span>
                            )}
                            {movie.lang && (
                                <span className="text-xs text-[#8b5cf6] font-semibold">
                                    {movie.lang}
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
