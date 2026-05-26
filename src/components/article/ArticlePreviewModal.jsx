// ArticlePreviewModal.jsx
import React from 'react';

function ArticlePreviewModal({ article, onClose }) {
  // Format the date into a clean editorial style (e.g., "May 25, 2026")
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#fcfbf9] text-stone-900 rounded-none border border-stone-300 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl font-serif">
        
        {/* Newspaper Top Bar / Action Controls */}
        <div className="sticky top-0 bg-[#fcfbf9] border-b border-stone-300 px-6 py-3 flex justify-between items-center z-10 font-sans text-xs uppercase tracking-widest text-stone-600">
          <div>• Editorial Preview Mode •</div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900 text-2xl font-light transition-colors leading-none"
            aria-label="Close Preview"
          >
            ✕
          </button>
        </div>

        {/* Main Newspaper Body Container */}
        <div className="p-8 md:p-12 max-w-3xl mx-auto">
          {article && (
            <article>
              {/* Category / Kicker */}
              {article.category && (
                <div className="text-center mb-3">
                  <span className="font-sans text-xs uppercase tracking-widest text-amber-800 font-semibold border-b border-amber-800 pb-1">
                    {article.category}
                  </span>
                </div>
              )}

              {/* Classic Bold Newspaper Headline */}
              <h1 className="text-3xl md:text-5xl font-black text-center text-stone-900 tracking-tight leading-none mb-4 font-serif decoration-stone-900">
                {article.title}
              </h1>

              {/* Subheading / Excerpt if available */}
              {article.excerpt && (
                <p className="text-stone-600 text-lg md:text-xl italic text-center max-w-2xl mx-auto leading-relaxed mb-6 font-serif">
                  {article.excerpt}
                </p>
              )}

              {/* Newspaper Bylines & Date Rules */}
              <div className="border-t-2 border-b border-stone-800 py-2 my-6 font-sans text-xs uppercase tracking-wider flex flex-col sm:flex-row justify-between items-center gap-2 text-stone-700">
                <div className="font-semibold">
                  By <span className="underline decoration-stone-400">{article.author || 'Staff Writer'}</span>
                </div>
                <div className="hidden sm:block text-stone-300">|</div>
                <div>
                  {formatDate(article.date)}
                </div>
              </div>

              {/* Featured Image Layout with Caption styling */}
              {article.featuredImage && (
                <div className="mb-8 border-b border-stone-200 pb-4">
                  <img 
                    src={article.featuredImage} 
                    alt={article.title}
                    className="w-full h-auto max-h-[450px] object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-300"
                  />
                  <p className="font-sans text-xs text-stone-500 mt-2 italic">
                    Featured Image — Documented for the evening edition.
                  </p>
                </div>
              )}

              {/* Newspaper Print-Inspired Content Copy */}
              <div 
                className="prose prose-stone max-w-none text-stone-950 leading-serif-loose text-base md:text-lg 
                           first-letter:text-6xl first-letter:font-black first-letter:text-stone-900 
                           first-letter:float-left first-letter:mr-3 first-letter:font-serif
                           space-y-6 text-justify selection:bg-amber-100"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* End of Article Newspaper Marker */}
              <div className="flex justify-center items-center gap-2 mt-12 pt-6 border-t border-stone-200">
                <div className="w-2 h-2 bg-stone-800 rotate-45"></div>
                <div className="w-16 h-[1px] bg-stone-400"></div>
                <div className="w-2 h-2 bg-stone-800 rotate-45"></div>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticlePreviewModal;