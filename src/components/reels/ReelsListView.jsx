// components/reels/ReelsListView.jsx
import React, { useState } from "react";
import ReactPlayer from 'react-player';

// VITE_API_URL usually includes "/api" (e.g. http://localhost:5000/api).
// Static uploads are served from the server origin, not under /api, so strip it.
const SERVER_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

export function getThumbnailUrl(thumbnail) {
  if (!thumbnail) return "";
  if (/^https?:\/\//i.test(thumbnail)) return thumbnail;
  return `${SERVER_ORIGIN}${thumbnail.startsWith("/") ? "" : "/"}${thumbnail}`;
}

// Fallback checking to handle both reel.videoUrl and reel.video database formats
export function getVideoUrl(reel) {
  const videoPath = reel?.videoUrl || reel?.video;
  if (!videoPath) return "";
  if (/^https?:\/\//i.test(videoPath)) return videoPath;
  return `${SERVER_ORIGIN}${videoPath.startsWith("/") ? "" : "/"}${videoPath}`;
}

// Helper function to clean YouTube URLs (fix for Shorts)
function getCleanYouTubeUrl(url) {
  if (!url) return '';
  
  // Match the video ID from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2] && match[2].length === 11) {
    // Return a standard watch URL with the clean ID
    return `https://www.youtube.com/watch?v=${match[2]}`;
  }
  
  // Fallback: return the original URL
  return url;
}

// Use the doc's _id if `id` isn't present (Mongoose returns _id by default)
function getReelId(reel) {
  return reel?.id || reel?._id;
}

// Grid View Card Component
function ReelCard({ reel, onEdit, onDelete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoSrc = getVideoUrl(reel);
  const reelId = getReelId(reel);
  const isYouTube = videoSrc && (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be'));
  const cleanVideoSrc = isYouTube ? getCleanYouTubeUrl(videoSrc) : videoSrc;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (!videoSrc) return;
    setIsPlaying(true);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleCloseVideo = (e) => {
    e.stopPropagation();
    setIsPlaying(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-[9/16] bg-black">
        {/* Thumbnail - hidden when playing */}
        <div style={{ display: isPlaying ? 'none' : 'block' }} className="w-full h-full">
          <img
            src={getThumbnailUrl(reel.thumbnail)}
            alt={reel.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-family="sans-serif" font-size="16"%3ENo Thumbnail%3C/text%3E%3C/svg%3E';
            }}
          />
          {/* Top Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(reel);
              }}
              className="p-2.5 bg-white/90 rounded-full hover:bg-white transition-colors"
              aria-label="Edit reel"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(reelId);
              }}
              className="p-2.5 bg-white/90 rounded-full hover:bg-white transition-colors"
              aria-label="Delete reel"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Play Button */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <button
              type="button"
              onClick={handlePlayClick}
              disabled={!videoSrc}
              className="w-full bg-white/95 backdrop-blur-sm text-slate-900 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {videoSrc ? 'Play Video' : 'No Video'}
            </button>
          </div>
        </div>

        {/* Player container - shown when playing */}
        <div style={{ display: isPlaying ? 'block' : 'none' }} className="w-full h-full relative">
          {isYouTube ? (
            <ReactPlayer
              url={cleanVideoSrc}
              controls
              playing={isPlaying}
              width="100%"
              height="100%"
              className="react-player"
              onEnded={handleVideoEnded}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    controls: 1,
                  }
                }
              }}
            />
          ) : (
            <video
              src={cleanVideoSrc}
              className="w-full h-full object-cover"
              autoPlay={isPlaying}
              controls
              muted
              onEnded={handleVideoEnded}
            />
          )}
          {/* Close button for video */}
          <button
            onClick={handleCloseVideo}
            className="absolute top-2 right-2 z-30 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
            aria-label="Close video"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 truncate">{reel.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
          {reel.description || "No description"}
        </p>
        <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {reel.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {reel.likes || 0}
            </span>
          </div>
          <span className="text-xs">
            {reel.createdAt ? new Date(reel.createdAt).toLocaleDateString() : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

// List View Item Component
function ReelListItem({ reel, onEdit, onDelete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoSrc = getVideoUrl(reel);
  const reelId = getReelId(reel);
  const isYouTube = videoSrc && (videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be'));
  const cleanVideoSrc = isYouTube ? getCleanYouTubeUrl(videoSrc) : videoSrc;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (!videoSrc) return;
    setIsPlaying(true);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleCloseVideo = (e) => {
    e.stopPropagation();
    setIsPlaying(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow flex items-center gap-4">
      <div className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-black relative group/item">
        {/* Thumbnail - hidden when playing */}
        <div style={{ display: isPlaying ? 'none' : 'block' }} className="w-full h-full cursor-pointer" onClick={handlePlayClick}>
          <img
            src={getThumbnailUrl(reel.thumbnail)}
            alt={reel.title}
            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-family="sans-serif" font-size="16"%3ENo Thumbnail%3C/text%3E%3C/svg%3E';
            }}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
            <svg className="w-8 h-8 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Player container - shown when playing */}
        <div style={{ display: isPlaying ? 'block' : 'none' }} className="w-full h-full relative">
          {isYouTube ? (
            <ReactPlayer
              url={cleanVideoSrc}
              controls
              playing={isPlaying}
              width="100%"
              height="100%"
              className="react-player"
              onEnded={handleVideoEnded}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    controls: 1,
                  }
                }
              }}
            />
          ) : (
            <video
              src={cleanVideoSrc}
              className="w-full h-full object-cover"
              autoPlay={isPlaying}
              controls
              muted
              onEnded={handleVideoEnded}
            />
          )}
          {/* Close button for video */}
          <button
            onClick={handleCloseVideo}
            className="absolute top-1 right-1 z-30 p-1 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
            aria-label="Close video"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 truncate">{reel.title}</h3>
        <p className="text-sm text-slate-600 truncate">
          {reel.description || "No description"}
        </p>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {reel.views || 0}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {reel.likes || 0}
          </span>
          <span>
            {reel.createdAt ? new Date(reel.createdAt).toLocaleDateString() : ''}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(reel);
          }}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Edit reel"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(reelId);
          }}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Delete reel"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Main component - memoized to prevent unnecessary re-renders
function ReelsListView({ reels, viewMode, onEdit, onDelete }) {
  if (reels.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-2xl">
        <svg
          className="w-16 h-16 mx-auto text-slate-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No reels yet</h3>
        <p className="text-slate-600">Click "Add New Reel" to get started</p>
      </div>
    );
  }

  return (
    <div>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reels.map((reel) => (
            <ReelCard
              key={getReelId(reel)}
              reel={reel}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {reels.map((reel) => (
            <ReelListItem
              key={getReelId(reel)}
              reel={reel}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Export with React.memo to prevent re-renders when parent state changes
export default React.memo(ReelsListView);