import { useParams, Link, useNavigate } from "react-router-dom";
import { useMovieDetail, useViewCount } from "../api/useMovies";
import { getImageUrl } from "../api/apiClient";
import {
    Play,
    Calendar,
    Clock,
    Globe,
    ArrowLeft,
    Tv,
    Film,
    Users,
    Clapperboard,
    Eye,
} from "lucide-react";

export default function MovieDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, error } = useMovieDetail(slug);
    const { data: viewData } = useViewCount(slug);
    const movie = data?.movie;

    if (isLoading) {
        return (
            <div className="page-enter">
                <div className="skeleton h-[300px] sm:h-[400px] rounded-xl mb-6" />
                <div className="skeleton h-8 w-1/2 rounded mb-4" />
                <div className="skeleton h-4 w-3/4 rounded mb-2" />
                <div className="skeleton h-4 w-2/3 rounded mb-6" />
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="skeleton h-9 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data?.movie) {
        return (
            <div className="page-enter flex flex-col items-center justify-center py-20">
                <span className="text-5xl mb-4">😕</span>
                <p className="text-lg text-[#9d9db5]">Không tìm thấy phim</p>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'linear-gradient(135deg, #e50914, #8b5cf6)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24 }}
                >
                    <ArrowLeft style={{ width: 16, height: 16 }} /> Quay lại
                </button>
            </div>
        );
    }

    const episodes = data.episodes || [];
    const allEpisodes =
        episodes.length > 0 && episodes[0]?.server_data
            ? episodes[0].server_data
            : [];

    const posterUrl = getImageUrl(movie.poster_url);
    const thumbUrl = getImageUrl(movie.thumb_url);

    return (
        <div className="page-enter">
            {/* ===== Hero Backdrop ===== */}
            <div
                className="relative -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-10 xl:-mx-16 -mt-16 lg:-mt-20 mb-10 sm:mb-12"
            >
                <div className="h-[320px] sm:h-[380px] lg:h-[460px] overflow-hidden">
                    <img
                        src={thumbUrl}
                        alt={movie.name}
                        className="w-full h-full object-cover"
                        style={{ opacity: 0.45, filter: 'blur(2px)' }}
                    />
                </div>
                {/* Overlays */}
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, #06060b 0%, rgba(6,6,11,0.7) 50%, rgba(6,6,11,0.3) 100%)' }}
                />
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, #06060b 0%, rgba(6,6,11,0.6) 40%, transparent 100%)' }}
                />



                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-4 md:px-6 lg:px-10 xl:px-16 pb-8">
                    <div className="flex flex-col md:flex-row gap-6 lg:gap-10 items-end md:items-end">
                        {/* Poster */}
                        <div className="shrink-0 w-[140px] sm:w-[160px] lg:w-[200px] relative z-10">
                            <img
                                src={posterUrl}
                                alt={movie.name}
                                style={{ borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
                                className="w-full"
                                onError={(e) => { e.target.src = thumbUrl; }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 pb-4 md:pb-6">
                            <h1
                                className="text-xl sm:text-2xl lg:text-4xl font-black text-white leading-tight mb-1.5"
                                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                            >
                                {movie.name}
                            </h1>
                            {movie.origin_name && (
                                <p className="text-sm lg:text-base text-white/40 italic mb-4 lg:mb-5">
                                    {movie.origin_name}
                                </p>
                            )}

                            {/* Meta badges - inline style */}
                            <div className="flex flex-wrap gap-2.5 mb-5">
                                {movie.year && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#9d9db5' }}>
                                        <Calendar style={{ width: 13, height: 13 }} /> {movie.year}
                                    </span>
                                )}
                                {movie.time && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#9d9db5' }}>
                                        <Clock style={{ width: 13, height: 13 }} /> {movie.time}
                                    </span>
                                )}
                                {movie.quality && (
                                    <span style={{ padding: '4px 10px', borderRadius: 6, background: '#fb923c', fontSize: 13, fontWeight: 600, color: '#000' }}>
                                        {movie.quality}
                                    </span>
                                )}
                                {movie.lang && (
                                    <span style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.6)', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                                        {movie.lang}
                                    </span>
                                )}
                                {movie.episode_current && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                                        <Tv style={{ width: 13, height: 13 }} /> {movie.episode_current}
                                    </span>
                                )}
                                {/* View count */}
                                {viewData && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#9d9db5' }}>
                                        <Eye style={{ width: 13, height: 13 }} /> {(viewData.views || 0).toLocaleString()} lượt xem
                                    </span>
                                )}
                            </div>

                            {/* Play button */}
                            {allEpisodes.length > 0 && (
                                <Link
                                    to={`/xem/${slug}/tap-${allEpisodes[0].slug || "1"}`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 8, background: 'linear-gradient(135deg, #e50914, #b91c8a)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 24px rgba(229,9,20,0.25)' }}
                                >
                                    <Play style={{ width: 18, height: 18, fill: '#fff' }} /> Xem Phim
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Main Content ===== */}
            <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left - Details */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Description */}
                    {movie.content && (
                        <div style={{ background: 'rgba(22,22,37,0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '20px 24px' }}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#eeeef5', marginBottom: 12 }}>Nội dung phim</h2>
                            <div
                                className="text-sm leading-relaxed"
                                style={{ color: '#9d9db5' }}
                                dangerouslySetInnerHTML={{ __html: movie.content }}
                            />
                        </div>
                    )}

                    {/* Episodes */}
                    {allEpisodes.length > 0 && (
                        <div style={{ background: 'rgba(22,22,37,0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '20px 24px' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#eeeef5' }}>Danh sách tập</h2>
                                <span style={{ fontSize: 11, color: '#5a5a72', background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: 20 }}>
                                    {allEpisodes.length} tập
                                </span>
                            </div>
                            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10 gap-1.5 sm:gap-2">
                                {allEpisodes.map((ep, idx) => (
                                    <Link
                                        key={idx}
                                        to={`/xem/${slug}/tap-${ep.slug || idx + 1}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: 36,
                                            borderRadius: 4,
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: '#9d9db5',
                                            textDecoration: 'none',
                                            transition: 'all 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #e50914, #8b5cf6)';
                                            e.currentTarget.style.color = '#fff';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                            e.currentTarget.style.color = '#9d9db5';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                        }}
                                    >
                                        {ep.name || idx + 1}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right - Sidebar */}
                <div>
                    <div style={{ background: 'rgba(22,22,37,0.6)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, padding: '20px 24px' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#eeeef5', marginBottom: 16 }}>Thông tin phim</h2>

                        <div className="space-y-4">
                            {movie.director && movie.director.length > 0 && (
                                <InfoRow
                                    icon={<Clapperboard style={{ width: 14, height: 14, color: '#5a5a72' }} />}
                                    label="Đạo diễn"
                                    value={Array.isArray(movie.director) ? movie.director.join(", ") : movie.director}
                                />
                            )}

                            {movie.actor && movie.actor.length > 0 && (
                                <InfoRow
                                    icon={<Users style={{ width: 14, height: 14, color: '#5a5a72' }} />}
                                    label="Diễn viên"
                                    value={Array.isArray(movie.actor) ? movie.actor.slice(0, 8).join(", ") : movie.actor}
                                />
                            )}

                            {movie.category && movie.category.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Film style={{ width: 14, height: 14, color: '#5a5a72' }} />
                                        <span style={{ fontSize: 11, color: '#5a5a72', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thể loại</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(Array.isArray(movie.category) ? movie.category : []).map((cat) => (
                                            <Link
                                                key={cat.slug}
                                                to={`/the-loai/${cat.slug}`}
                                                style={{ padding: '3px 10px', fontSize: 12, borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#9d9db5', textDecoration: 'none', transition: 'all 0.15s' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.color = '#9d9db5'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {movie.country && movie.country.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Globe style={{ width: 14, height: 14, color: '#5a5a72' }} />
                                        <span style={{ fontSize: 11, color: '#5a5a72', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quốc gia</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(Array.isArray(movie.country) ? movie.country : []).map((c) => (
                                            <Link
                                                key={c.slug}
                                                to={`/quoc-gia/${c.slug}`}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', fontSize: 12, borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#9d9db5', textDecoration: 'none', transition: 'all 0.15s' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.color = '#9d9db5'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                                            >
                                                {c.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {movie.episode_total && (
                                <InfoRow
                                    icon={<Tv style={{ width: 14, height: 14, color: '#5a5a72' }} />}
                                    label="Tổng số tập"
                                    value={`${movie.episode_total} Tập`}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable info row component
function InfoRow({ icon, label, value }) {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span style={{ fontSize: 11, color: '#5a5a72', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <p style={{ fontSize: 13, color: '#9d9db5', lineHeight: 1.5 }}>{value}</p>
        </div>
    );
}
