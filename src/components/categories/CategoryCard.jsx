// CategoryCard.jsx - Updated with customize badge
import { Eye, EyeOff, Trash2, Settings } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import PropTypes from 'prop-types';

export default function CategoryCard({ category, onEdit, onToggleStatus, onDelete, showCustomizeBadge = false, cardSize = 'medium' }) {
  const sizeConfig = {
    small: {
      iconSize: 'text-2xl',
      titleSize: 'text-base',
      slugSize: 'text-xs',
      articleNumber: 'text-xl',
      buttonPadding: 'px-2 py-1.5 text-xs',
      spacing: 'mb-2'
    },
    medium: {
      iconSize: 'text-3xl',
      titleSize: 'text-lg',
      slugSize: 'text-sm',
      articleNumber: 'text-2xl',
      buttonPadding: 'px-3 py-2 text-sm',
      spacing: 'mb-3'
    },
    large: {
      iconSize: 'text-5xl',
      titleSize: 'text-xl',
      slugSize: 'text-base',
      articleNumber: 'text-3xl',
      buttonPadding: 'px-4 py-2.5 text-base',
      spacing: 'mb-4'
    }
  };

  const config = sizeConfig[cardSize] || sizeConfig.medium;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 h-full flex flex-col relative">
      {showCustomizeBadge && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Settings className="w-3 h-3" />
          Customizable
        </div>
      )}
      <CardContent className={`pt-6 flex flex-col h-full ${cardSize === 'small' ? 'p-4' : cardSize === 'large' ? 'p-7' : 'p-5'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`${config.iconSize} transition-all duration-200`}>{category.icon}</div>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            category.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {category.status}
          </span>
        </div>
        
        <div className="flex-1">
          <h3 className={`${config.titleSize} font-bold text-slate-900 ${config.spacing}`}>
            {category.name}
          </h3>
          <p className={`${config.slugSize} text-slate-500 mb-4`}>
            /{category.slug}
          </p>
        </div>
        
        <div className="flex items-baseline justify-between mb-4">
          <span className={`${config.articleNumber} font-bold text-orange-500`}>
            {category.articles || 0}
          </span>
          <span className="text-xs text-slate-600">Articles</span>
        </div>
        
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className={`flex-1 font-medium text-white bg-orange-500 hover:bg-orange-600 rounded transition-all duration-200 ${config.buttonPadding}`}
          >
            Edit
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleStatus(category); }}
            className={`px-3 font-medium border border-slate-200 rounded hover:bg-slate-50 transition-all duration-200 ${config.buttonPadding}`}
            title={category.status === 'Active' ? 'Hide Category' : 'Show Category'}
          >
            {category.status === 'Active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(category); }}
            className={`px-3 font-medium border border-red-200 text-red-600 rounded hover:bg-red-50 transition-all duration-200 ${config.buttonPadding}`}
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    icon: PropTypes.string,
    status: PropTypes.oneOf(['Active', 'Hidden']),
    articles: PropTypes.number,
    position: PropTypes.number
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showCustomizeBadge: PropTypes.bool,
  cardSize: PropTypes.oneOf(['small', 'medium', 'large'])
};