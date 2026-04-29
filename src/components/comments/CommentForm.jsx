import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertTriangle, Send } from 'lucide-react';
import { detectSpam, checkRateLimit } from '../../utils/spamDetector';

const CommentForm = ({ articles, onSubmit, currentUser }) => {
  const [formData, setFormData] = useState({
    author: currentUser?.name || '',
    email: currentUser?.email || '',
    articleId: '',
    comment: '',
    userId: currentUser?.id || Date.now(),
    ipAddress: '192.168.1.1', // In real app, get from request
  });
  const [spamWarning, setSpamWarning] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time spam detection for comment text
    if (name === 'comment' && value.length > 10) {
      const spamCheck = detectSpam(value, formData.author, 'New');
      if (spamCheck.isSpam) {
        setSpamWarning({
          score: spamCheck.score,
          reasons: spamCheck.reasons
        });
      } else {
        setSpamWarning(null);
      }
    }
  };

  const handleArticleChange = (value) => {
    setFormData(prev => ({ ...prev, articleId: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.author || !formData.comment || !formData.articleId) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Check rate limit
    if (!checkRateLimit(formData.userId, formData.ipAddress)) {
      alert('You are posting too quickly. Please wait a moment.');
      return;
    }
    
    // Final spam check
    const spamCheck = detectSpam(formData.comment, formData.author, 'New');
    
    setIsSubmitting(true);
    
    // Create new comment
    const newComment = {
      id: Date.now(),
      author: formData.author,
      article: articles.find(a => a.id === parseInt(formData.articleId))?.title || '',
      articleId: parseInt(formData.articleId),
      text: formData.comment,
      date: new Date().toISOString(),
      status: spamCheck.isSpam ? 'Flagged' : 'Pending',
      userId: formData.userId,
      trustLevel: 'New',
      hasLinks: /https?:\/\/[^\s]+/g.test(formData.comment),
      abuseScore: spamCheck.score,
      moderationHistory: [],
      ipAddress: formData.ipAddress,
    };
    
    await onSubmit(newComment);
    
    // Reset form
    setFormData({
      author: currentUser?.name || '',
      email: currentUser?.email || '',
      articleId: '',
      comment: '',
      userId: currentUser?.id || Date.now(),
      ipAddress: '192.168.1.1',
    });
    setSpamWarning(null);
    setIsSubmitting(false);
    
    alert(spamCheck.isSpam ? 'Your comment has been flagged for review' : 'Comment submitted successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Comment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="author">Name *</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              disabled={!!currentUser}
            />
          </div>
          
          {!currentUser && (
            <div>
              <Label htmlFor="email">Email (will not be published)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="article">Select Article *</Label>
            <Select value={formData.articleId} onValueChange={handleArticleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an article" />
              </SelectTrigger>
              <SelectContent>
                {articles.map(article => (
                  <SelectItem key={article.id} value={article.id.toString()}>
                    {article.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="comment">Comment *</Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Share your thoughts..."
            />
          </div>
          
          {spamWarning && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800">Potential Spam Detected</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your comment has a {spamWarning.score}% spam score. Reasons: {spamWarning.reasons.join(', ')}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Please review your comment before submitting.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommentForm;