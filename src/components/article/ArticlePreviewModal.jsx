// ArticlePreviewModal.jsx - Newspaper Style Edition
import { useState, useEffect } from 'react';
import { X, Eye, Calendar, User, FolderOpen, Tag, Printer, Download, Image as ImageIcon, Share2, Bookmark, ThumbsUp, MessageCircle } from 'lucide-react';
import API from '../../lib/mergeapi';

const Button = ({ children, onClick, variant = "default", className = "", disabled = false }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2";
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100"
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </button>
  );
};

export default function ArticlePreviewModal({ article, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = document.querySelector('.article-content')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.title?.replace(/[^a-z0-9]/gi, '_') || 'article'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stripHtmlTags = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const imageUrl = API.media.getImageUrl(article?.featuredImage);

  if (!article) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-none shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transition-all duration-300 transform ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Newspaper Header */}
        <div className="border-b-4 border-gray-900 bg-white">
          {/* Top Bar */}
          <div className="border-b border-gray-200 px-6 py-2">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Est. 2024</span>
              <div className="flex gap-4">
                <span>Vol. 1, No. 1</span>
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Newspaper Title */}
          <div className="text-center py-6 px-6">
            <h1 className="font-serif text-6xl font-black tracking-tight text-gray-900">
              THE DAILY CHRONICLE
            </h1>
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-600 uppercase tracking-wide">
              <span>World News</span>
              <span>•</span>
              <span>Politics</span>
              <span>•</span>
              <span>Business</span>
              <span>•</span>
              <span>Technology</span>
              <span>•</span>
              <span>Culture</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t border-b border-gray-200 px-6 py-3 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="p-2 hover:bg-gray-200 rounded transition" title="Print">
                <Printer className="w-4 h-4" />
              </button>
              <button onClick={handleDownload} className="p-2 hover:bg-gray-200 rounded transition" title="Download">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition" title="Share">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition" title="Save">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">Font Size:</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setFontSize('small')}
                  className={`px-2 py-1 text-xs ${fontSize === 'small' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                >
                  A-
                </button>
                <button 
                  onClick={() => setFontSize('medium')}
                  className={`px-2 py-1 text-xs ${fontSize === 'medium' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                >
                  A
                </button>
                <button 
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-1 text-xs ${fontSize === 'large' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'} rounded`}
                >
                  A+
                </button>
              </div>
            </div>

            <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(90vh-160px)] p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            {/* Headline */}
            <h1 className={`font-serif font-bold text-gray-900 mb-4 leading-tight ${fontSize === 'small' ? 'text-3xl' : fontSize === 'large' ? 'text-5xl' : 'text-4xl'}`}>
              {article.title}
            </h1>

            {/* Byline */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
              <div className="space-y-1">
                {article.author && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4" />
                    <span className="font-serif text-sm">By <span className="font-semibold">{article.author}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {(article.publishDate || article.createdAt) && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{article.publishDate || new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                  {article.category && (
                    <div className="flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      <span className="uppercase text-xs font-semibold tracking-wide">{article.category}</span>
                    </div>
                  )}
                  {article.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.views.toLocaleString()} views</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social Stats */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>234</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>45</span>
                </div>
              </div>
            </div>

            {/* Featured Image - Newspaper Style */}
            {imageUrl && !imageError ? (
              <div className="mb-8">
                <div className="relative bg-gray-100">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                  <img
                    src={imageUrl}
                    alt={article.title}
                    className="w-full h-auto"
                    onLoad={() => setImageLoading(false)}
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl);
                      setImageError(true);
                      setImageLoading(false);
                    }}
                    style={{ display: imageLoading ? 'none' : 'block' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">Photo credit: The Daily Chronicle</p>
              </div>
            ) : (
              <div className="mb-8 bg-gray-100 flex items-center justify-center py-16">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-serif italic">Image not available</p>
                </div>
              </div>
            )}

            {/* Drop Cap & Content */}
            <div className={`article-content font-serif ${getFontSizeClass()} text-gray-800 leading-relaxed space-y-6`}>
              {/* Excerpt as Pull Quote */}
              {article.excerpt && (
                <div className="border-l-4 border-gray-900 pl-6 my-8">
                  <p className="text-xl italic text-gray-700 leading-relaxed">
                    "{article.excerpt}"
                  </p>
                </div>
              )}

              {/* Main Content with Drop Cap */}
              <div className="first-letter:float-left first-letter:text-6xl first-letter:font-bold first-letter:text-gray-900 first-letter:mr-3 first-letter:mt-1">
                <div dangerouslySetInnerHTML={{ 
                  __html: article.content ? 
                    `<p class="mb-4">${article.content.replace(/<p>/g, '<p class="mb-4">')}</p>` : 
                    '<p class="mb-4">No content available.</p>' 
                }} />
              </div>
            </div>

            {/* Tags Section */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <Tag className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(article.tags) ? (
                      article.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-sans">
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-sans">
                        #{article.tags}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Article Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400 font-serif">
                  © {new Date().getFullYear()} The Daily Chronicle. All rights reserved.
                </div>
                <span className={`inline-block px-3 py-1 text-xs font-serif ${
                  article.status === 'Published' ? 'bg-gray-900 text-white' :
                  article.status === 'Draft' ? 'bg-gray-300 text-gray-700' :
                  article.status === 'Scheduled' ? 'bg-gray-600 text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {article.status || 'Draft'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <span className="font-serif">THE DAILY CHRONICLE</span> — Your trusted source for news
          </div>
          <Button onClick={handleClose} variant="outline" className="font-serif">
            Close Article
          </Button>
        </div>
      </div>
    </div>
  );
}