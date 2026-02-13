import { useEffect, useRef } from "react";
import Hls from "hls.js";

/**
 * HLS Video Player component
 * Uses hls.js for native HLS support in browsers that don't support it natively
 */
export default function VideoPlayer({ url, poster }) {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !url) return;

        // Clean up previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (url.includes(".m3u8")) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    maxBufferLength: 30,
                    maxMaxBufferLength: 60,
                    startLevel: -1, // auto quality
                    capLevelToPlayerSize: true,
                });
                hlsRef.current = hls;

                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {
                        // Autoplay blocked, user will click play
                    });
                });

                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                break;
                        }
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // Native HLS support (Safari)
                video.src = url;
                video.addEventListener("loadedmetadata", () => {
                    video.play().catch(() => { });
                });
            }
        } else {
            // Regular video file
            video.src = url;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [url]);

    if (!url) {
        return (
            <div className="video-container flex items-center justify-center">
                <div className="text-center">
                    <span className="text-4xl mb-3 block">🎬</span>
                    <p className="text-[#a0a0b8]">Chọn tập phim để bắt đầu xem</p>
                </div>
            </div>
        );
    }

    return (
        <div className="video-container">
            <video
                ref={videoRef}
                poster={poster}
                controls
                controlsList="nodownload"
                playsInline
                className="w-full h-full"
                style={{ backgroundColor: "#000" }}
            />
        </div>
    );
}
