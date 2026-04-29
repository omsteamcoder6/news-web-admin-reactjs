// CategoryHeader.jsx - Responsive improvements
'use client';

import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

export default function CategoryHeader({ onNewCategory }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Categories Management</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Organize and manage all article categories
        </p>
      </div>
      <Button 
        onClick={onNewCategory}
        className="bg-orange-500 hover:bg-orange-600 gap-2 w-full sm:w-auto"
      >
        <Plus className="w-4 h-4" />
        New Category
      </Button>
    </div>
  );
}