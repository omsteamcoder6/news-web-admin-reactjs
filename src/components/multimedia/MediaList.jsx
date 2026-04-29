import React from 'react';
import MediaCard from './MediaCard';
import { Image as ImageIcon } from 'lucide-react';

const MediaList = ({ media, onDelete }) => {
  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600">No media files found</p>
        <p className="text-sm text-slate-400 mt-1">Upload your first media file to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {media.map((item) => (
        <MediaCard key={item.id} media={item} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default MediaList;