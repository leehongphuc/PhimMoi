import MovieCard from "./MovieCard";

export default function MovieGrid({ movies, isLoading }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                        <div className="skeleton aspect-[2/3] rounded-lg" />
                        <div className="skeleton h-3.5 mt-2 w-3/4 rounded" />
                        <div className="skeleton h-2.5 mt-1 w-1/2 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (!movies || movies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a1a2e] flex items-center justify-center mb-4">
                    <span className="text-3xl">🎬</span>
                </div>
                <p className="text-base text-[#a0a0b8]">Không tìm thấy phim nào</p>
                <p className="text-sm text-[#6b6b80] mt-1">Hãy thử tìm kiếm từ khóa khác</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {movies.map((movie, index) => (
                <div
                    key={movie._id || movie.slug || index}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                >
                    <MovieCard movie={movie} />
                </div>
            ))}
        </div>
    );
}
