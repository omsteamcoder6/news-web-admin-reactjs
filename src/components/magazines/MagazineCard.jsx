// frontend/src/components/magazines/MagazineCard.jsx

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { Download, Edit2, Crown, Unlock, Cloud, WifiOff, Trash2 } from "lucide-react";
import { MagazineService } from "../../lib/magazineService";

// ============================================
// THIS IS WHERE VITE_IMAGE_BASE_URL IS CONNECTED
// ============================================
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:3001";

// FIXED - SIMPLE VERSION - Just add base URL to database path
function resolveImageUrl(url) {
  if (!url) return null;
  
  // If it's already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a blob URL (preview)
  if (url.startsWith('blob:')) {
    return url;
  }
  
  // Database already has correct path starting with /uploads/
  // Just add the base URL - NOTHING ELSE
  // ============================================
  // VITE_IMAGE_BASE_URL IS USED RIGHT HERE ↓
  // ============================================
  return `${IMAGE_BASE_URL}${url}`;
}

export function MagazineCard({
  magazine,
  onDownload,
  onEdit,
  onDelete,
  isOfflineAvailable,
  isOffline,
  canEdit = true,
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [localOfflineStatus, setLocalOfflineStatus] = useState(isOfflineAvailable);
  const [isNew, setIsNew] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    checkLocalOfflineStatus();
    checkIfNew();
  }, [magazine.id, magazine._id, magazine.createdAt]);

  useEffect(() => { 
    setImgError(false);
  }, [magazine.coverImageUrl, magazine.title]);

  const checkLocalOfflineStatus = async () => {
    const available = await MagazineService.isOfflineAvailable(magazine.id || magazine._id);
    setLocalOfflineStatus(available);
  };

  const checkIfNew = () => {
    if (!magazine.createdAt) { 
      setIsNew(false); 
      return; 
    }
    const createdDate = new Date(magazine.createdAt);
    const currentDate = new Date();
    const daysDiff = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));
    setIsNew(daysDiff <= 7);
  };

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    await onDownload(magazine);
    setIsDownloading(false);
    await checkLocalOfflineStatus();
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(magazine);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const coverUrl = resolveImageUrl(magazine.coverImageUrl);
  const magazineId = magazine.id || magazine._id;

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden relative">
      {isNew && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md animate-pulse">
            <span className="text-xs">✨</span>NEW
          </div>
        </div>
      )}

      {localOfflineStatus && !isNew && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
            <Cloud className="w-3 h-3" />Offline
          </div>
        </div>
      )}

      <CardContent className="p-0">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600">
          {coverUrl && !imgError ? (
            <img
              src={coverUrl}
              alt={magazine.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error(`❌ Image failed to load: ${coverUrl}`);
                setImgError(true);
                e.target.style.display = 'none';
              }}
              onLoad={() => console.log(`✅ Image loaded: ${coverUrl}`)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-white text-5xl">📰</span>
              <span className="text-white/80 text-xs font-medium px-4 text-center line-clamp-2">
                {magazine.title}
              </span>
            </div>
          )}

          <div className="absolute top-2 right-2">
            <div
              className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md ${
                magazine.accessType === "premium"
                  ? "bg-orange-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {magazine.accessType === "premium" ? (
                <><Crown className="w-3 h-3" />Premium</>
              ) : (
                <><Unlock className="w-3 h-3" />Free</>
              )}
            </div>
          </div>

          {isOffline && !localOfflineStatus && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <WifiOff className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-semibold">Offline</p>
                <p className="text-xs">Not available offline</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 line-clamp-1 flex-1">
              {magazine.title}
            </h3>
          </div>

          <p className="text-sm text-slate-500 mb-2">
            {formatDate(magazine.issueDate)} • {magazine.pages} pages
          </p>

          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {magazine.description || "No description available"}
          </p>

          <div className="bg-slate-50 p-3 rounded-lg mb-4">
            <p className="text-2xl font-bold text-orange-500">
              {magazine.subscribers?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-slate-600">Subscribers</p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className={`flex-1 gap-1 ${isDownloading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleDownloadClick}
              disabled={isDownloading || (isOffline && !localOfflineStatus)}
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {localOfflineStatus ? "Open" : "Download"}
                </>
              )}
            </Button>

            {canEdit && (
              <>
                <Button
                  size="sm"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 gap-1"
                  onClick={() => onEdit(magazine)}
                  disabled={isOffline}
                >
                  <Edit2 className="w-4 h-4" />Edit
                </Button>
                
                <Button
                  size="sm"
                  className="flex-1 bg-red-500 hover:bg-red-600 gap-1"
                  onClick={handleDeleteClick}
                  disabled={isOffline}
                >
                  <Trash2 className="w-4 h-4" />Delete
                </Button>
              </>
            )}
          </div>

          {localOfflineStatus && (
            <p className="text-xs text-blue-600 mt-2 text-center">
              ✓ Available offline
            </p>
          )}

          <p className="text-xs text-slate-400 mt-2 text-center border-t pt-2">
            Added: {new Date(magazine.createdAt).toLocaleDateString()}
            {isNew && (
              <span className="text-red-500 ml-1 font-semibold">(New!)</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}