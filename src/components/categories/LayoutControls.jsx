// components/categories/LayoutControls.jsx
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Columns, Grid, Maximize2, Minimize2, LayoutGrid, RefreshCw } from 'lucide-react';

export default function LayoutControls({ 
  onLayoutChange, 
  onCardSizeChange,
  initialColumns = 3,
  initialCardSize = 'medium'
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [cardSize, setCardSize] = useState(initialCardSize);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save to localStorage and notify parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('clientCardColumns', columns);
      localStorage.setItem('clientCardSize', cardSize);
    }
    onLayoutChange?.(columns);
    onCardSizeChange?.(cardSize);
  }, [columns, cardSize, onLayoutChange, onCardSizeChange]);

  const columnOptions = isMobile ? [1, 2] : [2, 3, 4];
  const sizeOptions = [
    { value: 'small', label: 'Small', icon: <Minimize2 className="w-3 h-3" />, size: 'compact' },
    { value: 'medium', label: 'Medium', icon: <Grid className="w-3 h-3" />, size: 'comfortable' },
    { value: 'large', label: 'Large', icon: <Maximize2 className="w-3 h-3" />, size: 'spacious' }
  ];

  const resetToDefault = () => {
    setColumns(isMobile ? 1 : 3);
    setCardSize('medium');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-orange-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-slate-700">Client View Customization</h3>
          <span className="text-xs text-slate-400 ml-2">(Changes saved locally)</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Adjust how categories are displayed on your screen
        </p>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Columns Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[80px]">
              <Columns className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Columns:</span>
            </div>
            <div className="flex gap-1.5 bg-slate-100 rounded-lg p-1">
              {columnOptions.map(col => (
                <button
                  key={col}
                  onClick={() => setColumns(col)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                    ${columns === col 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-200'
                    }
                  `}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Card Size Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[80px]">
              <Grid className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Card Size:</span>
            </div>
            <div className="flex gap-1.5 bg-slate-100 rounded-lg p-1">
              {sizeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setCardSize(option.value)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                    ${cardSize === option.value 
                      ? 'bg-orange-500 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-200'
                    }
                  `}
                  title={option.label}
                >
                  {option.icon}
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="gap-1.5 text-slate-600 border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>

        {/* Preview hint */}
        <div className="mt-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>⚡ Changes apply instantly</span>
            <span>💾 Saved to your browser</span>
          </div>
        </div>
      </div>
    </div>
  );
}