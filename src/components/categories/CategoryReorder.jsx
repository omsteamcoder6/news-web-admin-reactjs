// CategoryReorder.jsx - With responsive improvements
import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export default function CategoryReorder({ categories, onReorder }) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    const reordered = [...categories];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);
    
    const updatedCategories = reordered.map((cat, idx) => ({
      ...cat,
      position: idx + 1
    }));
    
    onReorder(updatedCategories);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Reorder Categories</h3>
          <p className="text-sm text-slate-600">
            Drag and drop to change category order
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full inline-block sm:inline-block">
          💡 Positions update automatically
        </div>
      </div>
      
      <div className="space-y-2">
        {categories.map((category, index) => (
          <div
            key={category.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className={`cursor-move transition-all duration-200 ${
              draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''
            }`}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </div>
                  <div className="text-xl sm:text-2xl">{category.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                      {category.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">/{category.slug}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    Pos: {category.position}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}