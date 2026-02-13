import { useState } from "react";
import { Link } from "react-router-dom";
import { useTopViews } from "../api/useMovies";
import { getImageUrl } from "../api/apiClient";
import { Eye, TrendingUp } from "lucide-react";

const TABS = [
    { key: "day", label: "Ngày" },
    { key: "week", label: "Tuần" },
    { key: "month", label: "Tháng" },
];

export default function TopViewedSidebar() {
    const [activeTab, setActiveTab] = useState("day");
    const { data, isLoading } = useTopViews(activeTab, 10);
    const topMovies = data?.topViews || [];

    return (
        <div
            style={{
                background: "rgba(22,22,37,0.5)",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 10,
                padding: "16px 16px 12px", // Maximized padding
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp style={{ width: 18, height: 18, color: "#e50914" }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#eeeef5" }}>
                    Top Xem Nhiều
                </span>
            </div>

            {/* Tabs */}
            <div
                className="flex gap-1 mb-4"
                style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 6,
                    padding: 3,
                }}
            >
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1,
                            padding: "6px 0",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 4,
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            background:
                                activeTab === tab.key
                                    ? "linear-gradient(135deg, #e50914, #8b5cf6)"
                                    : "transparent",
                            color: activeTab === tab.key ? "#fff" : "#6b6b80",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-1">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                            <div className="skeleton" style={{ width: 24, height: 20, borderRadius: 3 }} />
                            <div className="skeleton" style={{ width: 50, height: 75, borderRadius: 5 }} />
                            <div className="flex-1">
                                <div className="skeleton" style={{ height: 12, width: "80%", borderRadius: 3, marginBottom: 6 }} />
                                <div className="skeleton" style={{ height: 10, width: "40%", borderRadius: 3 }} />
                            </div>
                        </div>
                    ))
                ) : topMovies.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#5a5a72", fontSize: 13 }}>
                        Chưa có dữ liệu
                    </div>
                ) : (
                    topMovies.map((item, idx) => (
                        <Link
                            key={item.slug}
                            to={`/phim/${item.slug}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "6px 6px", // Generous padding
                                borderRadius: 8,
                                textDecoration: "none",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                {item.thumb ? (
                                    <img
                                        src={getImageUrl(item.thumb)}
                                        alt={item.name}
                                        style={{
                                            width: 50, // Large width
                                            height: 70, // Large height
                                            objectFit: "cover",
                                            borderRadius: 5,
                                            border: idx === 0 ? "2px solid #e50914" : idx === 1 ? "2px solid #fb923c" : idx === 2 ? "2px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
                                        }}
                                    />
                                ) : (
                                    <div style={{ width: 50, height: 70, background: "#222", borderRadius: 5 }} />
                                )}
                                {/* Rank badge overlay */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -4,
                                        left: -4,
                                        background: idx === 0 ? "#e50914" : idx === 1 ? "#fb923c" : idx === 2 ? "#fbbf24" : "#3f3f46",
                                        color: idx === 1 || idx === 2 ? "#000" : "#fff",
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
                                    }}
                                >
                                    {idx + 1}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p style={{
                                    fontSize: 13, fontWeight: 500, color: "#d4d4e8", // Larger font
                                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                                    margin: 0, lineHeight: 1.4,
                                }}>
                                    {item.name}
                                </p>
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    fontSize: 11, color: "#9ca3af", marginTop: 4,
                                }}>
                                    <Eye style={{ width: 11, height: 11, color: "#6b7280" }} />
                                    {item.views.toLocaleString()}
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
