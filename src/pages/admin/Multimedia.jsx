import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { MainLayout } from '../../layout/MainLayout';
import { Plus } from 'lucide-react';
import MediaForm from '../../components/multimedia/MediaForm';
import MediaList from '../../components/multimedia/MediaList';

const MultimediaPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [media, setMedia] = useState([
    { id: 1, title: 'Breaking News Video', type: 'Video', category: 'Politics', duration: '2:34', date: '2024-04-08' },
    { id: 2, title: 'Movie Trailer Launch', type: 'Video', category: 'Cinema', duration: '3:45', date: '2024-04-07' },
    { id: 3, title: 'Celebrity Interview', type: 'Audio', category: 'Cinema', duration: '12:20', date: '2024-04-06' },
    { id: 4, title: 'News Photo Gallery', type: 'Image', category: 'Politics', duration: 'N/A', date: '2024-04-05' },
  ]);

  const handleUpload = (newMedia) => {
    const mediaItem = {
      id: media.length + 1,
      title: newMedia.title,
      type: newMedia.type,
      category: newMedia.category,
      duration: newMedia.duration || 'N/A',
      date: new Date().toISOString().split('T')[0],
    };
    
    setMedia([mediaItem, ...media]);
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this media file?')) {
      setMedia(media.filter(item => item.id !== id));
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Multimedia Management</h1>
            <p className="text-slate-600 mt-1">Manage videos, podcasts, and images</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Media
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Total: {media.length} items</p>
          </CardHeader>
          <CardContent>
            <MediaList media={media} onDelete={handleDelete} />
          </CardContent>
        </Card>

        <MediaForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleUpload}
        />
      </div>
    </MainLayout>
  );
};

export default MultimediaPage;