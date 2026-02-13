import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import WatchPage from "./pages/WatchPage";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";
import CountryPage from "./pages/CountryPage";
import YearPage from "./pages/YearPage";
import DiscoverPage from "./pages/DiscoverPage";

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#06060b]">
          <Header />

          {/* Main Content */}
          {/* Main Content */}
          <main className="relative z-0 flex-1 w-full px-3 sm:px-4 md:px-6 lg:px-10 xl:px-16 pb-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/phim/:slug" element={<MovieDetailPage />} />
              <Route path="/xem/:slug/:episode" element={<WatchPage />} />
              <Route path="/tim-kiem" element={<SearchPage />} />
              <Route path="/the-loai/:slug" element={<CategoryPage />} />
              <Route path="/quoc-gia/:slug" element={<CountryPage />} />
              <Route path="/nam-phat-hanh/:year" element={<YearPage />} />
              <Route path="/loc-phim" element={<DiscoverPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
