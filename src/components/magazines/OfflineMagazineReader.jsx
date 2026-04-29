// components/magazines/OfflineMagazineReader.jsx
import { useState, useEffect, useRef } from 'react';
import { MagazineService } from '../../lib/magazineService';
import magazineAPI from '../../lib/magapi';       // ← API client
import { Button } from '../../components/ui/Button';
import { X, Download, ChevronLeft, ChevronRight, WifiOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function OfflineMagazineReader({ magazine, onClose }) {
  const [pdfUrl,      setPdfUrl]      = useState(null);
  const [isOffline,   setIsOffline]   = useState(!navigator.onLine);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(magazine.pages ?? 1);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState(null);
  const [isSaving,    setIsSaving]    = useState(false);

  // Keep the object URL so we can revoke it on unmount
  const objectUrlRef = useRef(null);

  // ── Load magazine PDF ──────────────────────────────────────────────────────
  useEffect(() => {
    loadMagazine();

    const handleOnline  = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      // Revoke any blob URL we created
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [magazine.id]);

  const createAndSetObjectUrl = (blob) => {
    // Revoke any previous URL first
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setPdfUrl(url);
  };

  const loadMagazine = async () => {
    setIsLoading(true);
    setError(null);
    setPdfUrl(null);

    try {
      // 1. Try IndexedDB first (works offline too)
      const offlineCopy = await MagazineService.getOfflineMagazine(magazine.id);
      if (offlineCopy) {
        createAndSetObjectUrl(offlineCopy.pdfBlob);
        return;
      }

      // 2. Fallback: fetch from server via the API client (auth headers included)
      if (navigator.onLine) {
        const blob = await magazineAPI.downloadMagazine(magazine.id);
        createAndSetObjectUrl(blob);
      } else {
        setError(
          'No offline version available. Please connect to the internet to download this magazine.'
        );
      }
    } catch (err) {
      console.error('loadMagazine failed:', err);
      setError(err.message || 'Failed to load magazine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Save offline ───────────────────────────────────────────────────────────
  const handleSaveOffline = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Re-use the already-fetched blob if possible; otherwise re-download
      let blob;
      if (objectUrlRef.current) {
        // Convert the current object URL back to a blob via fetch
        const res = await fetch(objectUrlRef.current);
        blob = await res.blob();
      } else {
        blob = await magazineAPI.downloadMagazine(magazine.id);
      }
      await MagazineService.storeMagazineForOffline(magazine.id, blob);
      toast.success('Magazine saved for offline reading!');
    } catch (err) {
      console.error('handleSaveOffline failed:', err);
      toast.error('Failed to save for offline reading');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading magazine…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Unable to Load Magazine</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={loadMagazine} variant="outline">
              Retry
            </Button>
            <Button onClick={onClose} className="bg-orange-500">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Reader UI ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900"
            aria-label="Close reader"
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-bold text-slate-900 line-clamp-1">
              {magazine.title}
            </h2>
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOffline && (
            <div className="flex items-center gap-1 text-amber-600 text-sm">
              <WifiOff className="w-4 h-4" />
              <span>Offline Mode</span>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveOffline}
            disabled={isSaving || isOffline}
            className="gap-1"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isSaving ? 'Saving…' : 'Save Offline'}
          </Button>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 relative overflow-hidden">
        {pdfUrl && (
          <iframe
            key={pdfUrl}
            src={`${pdfUrl}#page=${currentPage}`}
            className="w-full h-full border-0"
            title={magazine.title}
          />
        )}

        {/* Page navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 shadow-lg">
          <Button
            size="sm"
            variant="outline"
            className="bg-white gap-1"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 flex items-center">
            {currentPage} / {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            className="bg-white gap-1"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}