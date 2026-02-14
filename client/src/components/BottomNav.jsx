import { Link, useLocation } from "react-router-dom";
import { Home, Search, Layers, Globe } from "lucide-react";

const NAV_ITEMS = [
    { path: "/", icon: Home, label: "Trang chủ" },
    { path: "/tim-kiem", icon: Search, label: "Tìm kiếm" },
    { path: "/the-loai/hanh-dong", icon: Layers, label: "Thể loại", matchPrefix: "/the-loai" },
    { path: "/quoc-gia/han-quoc", icon: Globe, label: "Quốc gia", matchPrefix: "/quoc-gia" },
];

export default function BottomNav() {
    const location = useLocation();

    const isActive = (item) => {
        if (item.matchPrefix) return location.pathname.startsWith(item.matchPrefix);
        return location.pathname === item.path;
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Blur background */}
            <div className="absolute inset-0 bg-[#06060b]/90 backdrop-blur-2xl border-t border-white/[0.06]" />

            <div className="relative flex items-center justify-around px-2 h-14 safe-area-bottom">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1.5 rounded-xl transition-all duration-200 ${active
                                    ? "text-white"
                                    : "text-[#5a5a72] active:scale-95"
                                }`}
                        >
                            <div className={`relative p-1 rounded-lg transition-all ${active ? "bg-gradient-to-br from-[#e50914]/20 to-[#8b5cf6]/20" : ""
                                }`}>
                                <Icon className={`w-5 h-5 transition-all ${active ? "text-[#e50914]" : ""}`} />
                                {active && (
                                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#e50914] shadow-lg shadow-red-500/50" />
                                )}
                            </div>
                            <span className={`text-[10px] font-medium leading-none ${active ? "text-white" : ""
                                }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
