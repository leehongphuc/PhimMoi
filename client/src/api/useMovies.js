import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";

/**
 * Fetch newly updated movies with pagination
 */
export function useNewMovies(page = 1) {
    return useQuery({
        queryKey: ["movies", "new", page],
        queryFn: async () => {
            const { data } = await apiClient.get(`/movies?page=${page}`);
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: (prev) => prev,
    });
}

/**
 * Fetch movie detail + episodes by slug
 */
export function useMovieDetail(slug) {
    return useQuery({
        queryKey: ["movie", slug],
        queryFn: async () => {
            const { data } = await apiClient.get(`/movies/${slug}`);
            return data;
        },
        enabled: !!slug,
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Search movies by keyword
 */
export function useSearchMovies(keyword, page = 1) {
    return useQuery({
        queryKey: ["search", keyword, page],
        queryFn: async () => {
            const { data } = await apiClient.get(
                `/search?keyword=${encodeURIComponent(keyword)}&page=${page}`
            );
            return data;
        },
        enabled: !!keyword && keyword.length >= 2,
        staleTime: 3 * 60 * 1000,
    });
}

/**
 * Fetch all categories
 */
export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data } = await apiClient.get("/categories");
            return data;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes - rarely changes
    });
}

/**
 * Fetch all countries
 */
export function useCountries() {
    return useQuery({
        queryKey: ["countries"],
        queryFn: async () => {
            const { data } = await apiClient.get("/countries");
            return data;
        },
        staleTime: 30 * 60 * 1000,
    });
}

/**
 * Fetch movies by category slug
 */
export function useCategoryMovies(slug, page = 1) {
    return useQuery({
        queryKey: ["category", slug, page],
        queryFn: async () => {
            const { data } = await apiClient.get(`/the-loai/${slug}?page=${page}`);
            return data;
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
        placeholderData: (prev) => prev,
    });
}

/**
 * Fetch movies by country slug
 */
export function useCountryMovies(slug, page = 1) {
    return useQuery({
        queryKey: ["country", slug, page],
        queryFn: async () => {
            const { data } = await apiClient.get(`/quoc-gia/${slug}?page=${page}`);
            return data;
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
        placeholderData: (prev) => prev,
    });
}

/**
 * Fetch movies by year
 */
export function useYearMovies(year, page = 1) {
    return useQuery({
        queryKey: ["year", year, page],
        queryFn: async () => {
            const { data } = await apiClient.get(`/nam-phat-hanh/${year}?page=${page}`);
            return data;
        },
        enabled: !!year,
        staleTime: 5 * 60 * 1000,
        placeholderData: (prev) => prev,
    });
}

/**
 * Fetch view count for a movie
 */
export function useViewCount(slug) {
    return useQuery({
        queryKey: ["views", slug],
        queryFn: async () => {
            const { data } = await apiClient.get(`/views/${slug}`);
            return data;
        },
        enabled: !!slug,
        staleTime: 60 * 1000, // 1 minute
    });
}

/**
 * Increment view count when visiting a movie page or watching an episode
 * episode: string | undefined (e.g. "tap-1")
 */
export function useIncrementView(slug, movieName, movieThumb, episode) {
    return useQuery({
        // Include episode in queryKey to trigger new request when episode changes
        queryKey: ["incrementView", slug, episode || "detail"],
        queryFn: async () => {
            // Advanced Throttling: LocalStorage + Time Check (Prevent browser restart spam)
            const storageKey = `viewed_ts_${slug}_${episode || "detail"}`;
            const lastViewed = localStorage.getItem(storageKey);
            const now = Date.now();
            const VIEW_COOLDOWN = 30 * 60 * 1000; // 30 minutes

            // If viewed recently (within cooldown), skip API call
            if (lastViewed && (now - parseInt(lastViewed) < VIEW_COOLDOWN)) {
                return null;
            }

            const { data } = await apiClient.post(`/views/${slug}`, {
                name: movieName || slug,
                thumb: movieThumb || "",
            });

            // Update timestamp
            localStorage.setItem(storageKey, now.toString());
            return data;
        },
        enabled: !!slug && !!movieName,
        staleTime: Infinity, // Keep cache valid in memory
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}

/**
 * Fetch top viewed movies by period (day, week, month)
 */
export function useTopViews(period = "day", limit = 10) {
    return useQuery({
        queryKey: ["topViews", period, limit],
        queryFn: async () => {
            const { data } = await apiClient.get(`/views?period=${period}&limit=${limit}`);
            return data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Fetch movies by discover filter (category, country, year)
 */
export function useDiscoverMovies({ category, country, year, page = 1 }) {
    return useQuery({
        queryKey: ["discover", { category, country, year, page }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (category) params.set("category", category);
            if (country) params.set("country", country);
            if (year) params.set("year", year);
            params.set("page", page);

            const { data } = await apiClient.get(`/discover?${params.toString()}`);
            return data;
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: (prev) => prev,
    });
}


