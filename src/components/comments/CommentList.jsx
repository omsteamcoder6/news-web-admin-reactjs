import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Trash2, CheckCircle, XCircle, Search, Filter, 
  CheckSquare, Square, AlertTriangle, Eye, History,
  Star, Ban, Flag
} from 'lucide-react';

const CommentList = ({ 
  comments, 
  articles, 
  onApprove, 
  onReject, 
  onDelete,
  onBulkAction 
}) => {
  const [selectedComments, setSelectedComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [articleFilter, setArticleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('keyword');
  const [selectedComment, setSelectedComment] = useState(null);

  // Filter comments
  const filteredComments = comments.filter(comment => {
    // Status filter
    if (statusFilter !== 'all' && comment.status !== statusFilter) return false;
    
    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      if (new Date(comment.date).toDateString() !== now.toDateString()) return false;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      if (new Date(comment.date) <= weekAgo) return false;
    }
    
    // Article filter
    if (articleFilter !== 'all' && comment.articleId !== parseInt(articleFilter)) return false;
    
    // Search
    if (searchTerm) {
      switch(searchType) {
        case 'author':
          return comment.author.toLowerCase().includes(searchTerm.toLowerCase());
        case 'article':
          return comment.article.toLowerCase().includes(searchTerm.toLowerCase());
        default:
          return comment.text.toLowerCase().includes(searchTerm.toLowerCase());
      }
    }
    
    return true;
  });

  const toggleSelect = (id) => {
    setSelectedComments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(c => c.id));
    }
  };

  const handleBulkAction = (action) => {
    onBulkAction(selectedComments, action);
    setSelectedComments([]);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Flagged': return 'bg-red-100 text-red-800';
      case 'Rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Flagged">Flagged</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Date Filter</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Article Filter</Label>
              <Select value={articleFilter} onValueChange={setArticleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Articles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Articles</SelectItem>
                  {articles.map(article => (
                    <SelectItem key={article.id} value={article.id.toString()}>
                      {article.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Search Type</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">By Keyword</SelectItem>
                  <SelectItem value="author">By Author</SelectItem>
                  <SelectItem value="article">By Article</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder={`Search by ${searchType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedComments.length === filteredComments.length ? 
                    <CheckSquare className="w-4 h-4" /> : 
                    <Square className="w-4 h-4" />
                  }
                </Button>
                <p className="font-semibold">{selectedComments.length} comments selected</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction('approve')} className="bg-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve All
                </Button>
                <Button size="sm" onClick={() => handleBulkAction('reject')} className="bg-red-600">
                  <XCircle className="w-4 h-4 mr-1" /> Reject All
                </Button>
                <Button size="sm" onClick={() => handleBulkAction('spam')} variant="outline">
                  <Flag className="w-4 h-4 mr-1" /> Mark as Spam
                </Button>
                <Button size="sm" onClick={() => handleBulkAction('delete')} variant="destructive">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>User Comments ({filteredComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSelect(comment.id)}
                      className="p-0 h-auto"
                    >
                      {selectedComments.includes(comment.id) ? 
                        <CheckSquare className="w-5 h-5 text-blue-600" /> : 
                        <Square className="w-5 h-5 text-slate-400" />
                      }
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{comment.author}</p>
                        {comment.trustLevel === 'Trusted' && <Star className="w-4 h-4 text-yellow-500" />}
                        {comment.trustLevel === 'Offender' && <Ban className="w-4 h-4 text-red-500" />}
                      </div>
                      <p className="text-sm text-slate-500">
                        {comment.article} • {new Date(comment.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(comment.status)}`}>
                      {comment.status}
                    </span>
                    {comment.abuseScore > 40 && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {comment.abuseScore}% spam score
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-slate-700 mb-3 ml-8">{comment.text}</p>
                
                {comment.hasLinks && (
                  <div className="mb-3 ml-8 p-2 bg-yellow-50 rounded text-sm text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Contains external links - please review
                  </div>
                )}
                
                <div className="flex gap-2 ml-8">
                  <Button 
                    size="sm" 
                    onClick={() => onApprove(comment.id)}
                    className="bg-green-600 hover:bg-green-700 gap-1"
                    disabled={comment.status === 'Approved'}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onReject(comment.id)}
                    className="bg-red-600 hover:bg-red-700 gap-1"
                    disabled={comment.status === 'Rejected'}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onDelete(comment.id)}
                    variant="outline" 
                    className="gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                  
                  <Dialog 
                    open={selectedComment === comment} 
                    onOpenChange={(open) => !open && setSelectedComment(null)}
                  >
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelectedComment(comment)}
                    >
                      <Eye className="w-4 h-4 mr-1" /> Context
                    </Button>
                    
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Comment Context - Article: {comment.article}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 p-6">
                        <div className="p-4 bg-slate-50 rounded">
                          <h4 className="font-semibold mb-2">Article Preview</h4>
                          <p className="text-sm text-slate-600">
                            This is a preview of the article "{comment.article}". 
                            The comment was posted in response to this content.
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded">
                          <h4 className="font-semibold mb-2">Comment Thread</h4>
                          <div className="border-l-2 border-blue-300 pl-3">
                            <p className="text-sm font-semibold">{comment.author}</p>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Moderation History</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {!comment.moderationHistory || comment.moderationHistory.length === 0 ? (
                              <p className="text-sm text-slate-500">No moderation actions yet</p>
                            ) : (
                              comment.moderationHistory.map((action, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-slate-50 rounded">
                                  <History className="w-4 h-4" />
                                  <span>{action.action} by {action.moderator}</span>
                                  <span className="text-slate-500">
                                    {new Date(action.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentList;