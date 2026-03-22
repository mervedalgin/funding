import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, X } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);
  const [offlineSince, setOfflineSince] = useState<Date | null>(null);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false);
      setOfflineSince(new Date());
    };
    const handleOnline = () => {
      setIsOffline(false);
      setOfflineSince(null);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline || dismissed) {
    return null;
  }

  const handleRetry = () => {
    window.location.reload();
  };

  const minutesOffline = offlineSince
    ? Math.max(1, Math.floor((Date.now() - offlineSince.getTime()) / 60000))
    : null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 px-4 py-3 text-white text-sm font-semibold text-center shadow-lg"
      style={{ background: "linear-gradient(135deg, #dc2626, #ea580c)" }}
    >
      <WifiOff size={18} aria-hidden="true" className="shrink-0" />
      <span>
        İnternet bağlantınız kesildi.
        {minutesOffline && minutesOffline > 1 && ` (${minutesOffline} dakikadır çevrimdışı)`}
        {' '}Önbelleğe alınmış içerik gösteriliyor.
      </span>
      <button
        onClick={handleRetry}
        className="shrink-0 flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs font-medium"
      >
        <RefreshCw size={14} />
        Yeniden Dene
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Kapat"
      >
        <X size={16} />
      </button>
    </div>
  );
}
