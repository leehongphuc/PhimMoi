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

    // State for selected server and episode range
    const [currentServerIndex, setCurrentServerIndex] = useState(0);
    const [currentRangeIndex, setCurrentRangeIndex] = useState(0);

    // const episodes = data?.episodes || []; // Already declared above
    const currentServer = episodes[currentServerIndex];
    const serverData = currentServer?.server_data || [];

    // Group episodes into ranges of 50
    const episodeRanges = useMemo(() => {
        if (!serverData.length) return [];
        const ranges = [];
        const chunkSize = 50;
        for (let i = 0; i < serverData.length; i += chunkSize) {
            ranges.push({
                start: i,
                end: Math.min(i + chunkSize, serverData.length),
                name: `${i + 1}-${Math.min(i + chunkSize, serverData.length)}`
            });
        }
        return ranges;
    }, [serverData]);

    const currentEpisodes = useMemo(() => {
        if (!episodeRanges.length) return [];
        const range = episodeRanges[currentRangeIndex];
        return serverData.slice(range?.start || 0, range?.end || 0);
    }, [serverData, episodeRanges, currentRangeIndex]);

    // Update current server and range when episode changes or data loads
    useEffect(() => {
        if (!episodes.length) return;

        // precision finding of episode in all servers
        const epSlug = episode?.replace("tap-", "");

        // 1. Find which server has this episode (default to current or 0)
        let foundServerIdx = currentServerIndex;
        let foundEpIdx = -1;

        // Try to find in current server first
        const currentServerData = episodes[currentServerIndex]?.server_data || [];
        foundEpIdx = currentServerData.findIndex(ep => ep.slug === epSlug || ep.name === epSlug);

        // If not found, look in other servers
        if (foundEpIdx === -1) {
            episodes.forEach((server, sIdx) => {
                if (sIdx === currentServerIndex) return;
                const idx = server.server_data?.findIndex(ep => ep.slug === epSlug || ep.name === epSlug);
                if (idx !== -1) {
                    foundServerIdx = sIdx;
                    foundEpIdx = idx;
                }
            });
        }

        // If explicitly switching episode, we might need to update server
        if (foundServerIdx !== currentServerIndex) {
            setCurrentServerIndex(foundServerIdx);
        }

        // 2. Determine range for the found episode
        if (foundEpIdx !== -1) {
            const rangeIdx = Math.floor(foundEpIdx / 50);
            setCurrentRangeIndex(rangeIdx);
        }
    }, [episode, episodes]); // eslint-disable-line react-hooks/exhaustive-deps

    // Find current episode object from the *selected* server
    const episodeSlug = episode?.replace("tap-", "") || "1";
    const currentEpIndex = serverData.findIndex(
        (ep) => ep.slug === episodeSlug || ep.name === episodeSlug
    );
    const currentEp = currentEpIndex >= 0 ? serverData[currentEpIndex] : serverData[0];

    const prevEp = currentEpIndex > 0 ? serverData[currentEpIndex - 1] : null;
    const nextEp =
        currentEpIndex < serverData.length - 1
            ? serverData[currentEpIndex + 1]
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
            <div className="glass-card p-5 mt-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <List className="w-5 h-5 text-[#8b5cf6]" />
                            <h2 className="text-lg font-bold text-white">Danh sách tập</h2>
                        </div>
                        <span className="text-xs text-[#6b6b80] bg-white/5 px-3 py-1 rounded-full">
                            {serverData.length} tập
                        </span>
                    </div>

                    {/* Server Selection Tabs */}
                    {episodes.length > 1 && (
                        <div className="flex items-end gap-1 border-b border-white/5 mb-4">
                            {/* Label is less important, tabs mimic browser tabs or folder tabs */}
                            {episodes.map((server, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setCurrentServerIndex(idx);
                                        // Reset to first range when switching server
                                        setCurrentRangeIndex(0);
                                    }}
                                    className={`flex items-center gap-2 px-6 py-3 text-base font-semibold transition-all relative ${currentServerIndex === idx
                                        ? "bg-[#1f2937] text-white border-t border-x border-[#374151]"
                                        : "bg-[#111827] text-[#9ca3af] hover:bg-[#1f2937] hover:text-[#d1d5db] border-t border-x border-transparent"
                                        }`}
                                    style={{
                                        // Rectangular tabs
                                        borderRadius: 0,
                                        backgroundColor: currentServerIndex === idx ? '#2D3748' : '#1A202C', // Using Tailwind Slate-800 vs Gray-900 approximate
                                        color: currentServerIndex === idx ? '#63B3ED' : '#A0AEC0', // Blue-400 vs Gray-400
                                        marginBottom: -1, // Overlap border
                                        borderBottom: currentServerIndex === idx ? '1px solid #2D3748' : '1px solid #2D3748',
                                    }}
                                >
                                    <List className="w-4 h-4" />
                                    {server.server_name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Episode Range Tabs (only if > 50 eps) */}
                    {episodeRanges.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
                            {episodeRanges.map((range, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentRangeIndex(idx)}
                                    // Rectangular, larger but slightly smaller than server tabs
                                    className={`px-5 py-2 text-sm font-medium whitespace-nowrap transition-all ${currentRangeIndex === idx
                                        ? "bg-white/20 text-white border border-white/20"
                                        : "bg-transparent text-[#6b6b80] hover:text-[#9d9db5]"
                                        }`}
                                    style={{ borderRadius: 0 }}
                                >
                                    {range.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {currentEpisodes.map((ep, idx) => {
                            const realIdx = (episodeRanges[currentRangeIndex]?.start || 0) + idx;
                            const isActive =
                                (ep.slug === episodeSlug || ep.name === episodeSlug) &&
                                currentServerIndex === (episodes.findIndex(s => s.server_data?.some(e => e.slug === episodeSlug)) !== -1 ? episodes.findIndex(s => s.server_data?.some(e => e.slug === episodeSlug)) : 0);

                            // Check if this episode is the currently playing one
                            const isPlaying = ep.slug === currentEp?.slug || ep.name === currentEp?.name;

                            return (
                                <Link
                                    key={realIdx}
                                    to={`/xem/${slug}/tap-${ep.slug || ep.name}`}
                                    className={`flex items-center justify-center h-10 text-sm font-medium transition-all ${isPlaying
                                        ? "bg-gradient-to-r from-[#e50914] to-[#8b5cf6] text-white shadow-lg shadow-red-500/20 scale-105"
                                        : "bg-white/5 border border-white/10 text-[#a0a0b8] hover:text-white hover:bg-white/10 hover:border-white/20"
                                        }`}
                                    style={{ borderRadius: 0 }}
                                >
                                    {ep.name || realIdx + 1}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

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
