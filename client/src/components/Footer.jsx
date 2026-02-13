import { Film, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="mt-12 border-t border-white/[0.03] bg-[#06060b]">
            <div className="px-3 sm:px-4 md:px-6 lg:px-10 xl:px-16 py-8 sm:py-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e50914] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-red-900/20">
                                <Film className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-extrabold tracking-tight">
                                <span className="gradient-text">Mot</span>
                                <span className="text-white">Phim</span>
                            </span>
                        </Link>
                        <p className="text-xs text-[#5a5a72] leading-relaxed max-w-xs">
                            Xem phim online miễn phí chất lượng cao. Kho phim đa dạng, cập nhật liên tục.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-[11px] font-bold text-[#9d9db5] mb-3 uppercase tracking-[0.15em]">
                            Liên kết
                        </h3>
                        <div className="flex flex-col gap-2">
                            <Link to="/" className="text-xs text-[#5a5a72] hover:text-[#eeeef5] transition-colors">Trang Chủ</Link>
                            <Link to="/the-loai/hanh-dong" className="text-xs text-[#5a5a72] hover:text-[#eeeef5] transition-colors">Phim Hành Động</Link>
                            <Link to="/the-loai/tinh-cam" className="text-xs text-[#5a5a72] hover:text-[#eeeef5] transition-colors">Phim Tình Cảm</Link>
                            <Link to="/quoc-gia/han-quoc" className="text-xs text-[#5a5a72] hover:text-[#eeeef5] transition-colors">Phim Hàn Quốc</Link>
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="text-[11px] font-bold text-[#9d9db5] mb-3 uppercase tracking-[0.15em]">
                            Thông tin
                        </h3>
                        <p className="text-xs text-[#5a5a72] leading-relaxed">
                            Dữ liệu được cung cấp bởi OPhim API. Website phục vụ mục đích học tập và giải trí.
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-5 border-t border-white/[0.03] flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-[10px] text-[#5a5a72]">
                        © 2026 MotPhim. All rights reserved.
                    </p>
                    <p className="text-[10px] text-[#5a5a72] flex items-center gap-1">
                        Made with <Heart className="w-2.5 h-2.5 text-[#e50914] fill-[#e50914]" /> React + Vite
                    </p>
                </div>
            </div>
        </footer>
    );
}
