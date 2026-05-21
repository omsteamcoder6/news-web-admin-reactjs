// ArticlePreviewModal.jsx
import React from 'react';

function ArticlePreviewModal({ article, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Article Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {article && (
            <>
              <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
              {article.featuredImage && (
                <img 
                  src={article.featuredImage} 
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ THIS IS WHAT YOU'RE MISSING - Add this line
export default ArticlePreviewModal;