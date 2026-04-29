import React from 'react';
import { Trash2, Play, Music, Image } from 'lucide-react';

const MediaCard = ({ media, onDelete }) => {
  const getIcon = () => {
    switch (media.type) {
      case 'Video':
        return <Play className="w-6 h-6" />;
      case 'Audio':
        return <Music className="w-6 h-6" />;
      default:
        return <Image className="w-6 h-6" />;
    }
  };

  const getTypeColor = () => {
    switch (media.type) {
      case 'Video':
        return 'bg-blue-100 text-blue-800';
      case 'Audio':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition group">
      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white shadow-md">
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <p className="font-semibold text-slate-900 hover:text-orange-600 transition cursor-pointer">
          {media.title}
        </p>
        <p className="text-sm text-slate-500">
          {media.category} • {media.date}
        </p>
      </div>
      
      <div className="text-right">
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor()}`}>
          {media.type}
        </span>
        {media.duration !== 'N/A' && (
          <p className="text-sm text-slate-500 mt-1">{media.duration}</p>
        )}
      </div>
      
      <button 
        onClick={() => onDelete(media.id)}
        className="p-2 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
};

export default MediaCard;