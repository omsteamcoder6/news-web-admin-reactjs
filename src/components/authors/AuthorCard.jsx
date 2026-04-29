import { Edit2, Trash2 } from 'lucide-react';

const AuthorCard = ({ author, onEdit, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
      <div>
        <p className="font-semibold text-slate-900">{author.name}</p>
        <p className="text-sm text-slate-500">{author.role}</p>
      </div>
      <div className="text-center mr-8">
        <p className="font-bold text-2xl text-orange-500">{author.articles || 0}</p>
        <p className="text-xs text-slate-500">Articles</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        author.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {author.status}
      </span>
      {(onEdit || onDelete) && (
        <div className="flex gap-2">
          {onEdit && (
            <button 
              onClick={() => onEdit(author)}
              className="p-2 hover:bg-slate-100 rounded transition"
              aria-label="Edit author"
            >
              <Edit2 className="w-4 h-4 text-slate-600" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(author._id)}  // Changed from author.id to author._id
              className="p-2 hover:bg-red-50 rounded transition"
              aria-label="Delete author"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthorCard;