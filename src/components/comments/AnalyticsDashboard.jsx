import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/badge';
import { BarChart3, Bell, Shield } from 'lucide-react';

const AnalyticsDashboard = ({ comments, onClose }) => {
  const analytics = {
    total: comments.length,
    pending: comments.filter(c => c.status === 'Pending').length,
    approved: comments.filter(c => c.status === 'Approved').length,
    flagged: comments.filter(c => c.status === 'Flagged').length,
    rejected: comments.filter(c => c.status === 'Rejected').length,
    spamRate: ((comments.filter(c => c.status === 'Flagged' || c.status === 'Rejected').length) / comments.length) * 100,
    mostActiveUsers: Object.entries(
      comments.reduce((acc, comment) => {
        acc[comment.author] = (acc[comment.author] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5),
    averageResponseTime: '2.5 hours',
    topArticles: Object.entries(
      comments.reduce((acc, comment) => {
        acc[comment.article] = (acc[comment.article] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5)
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Analytics & Insights</CardTitle>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
          <BarChart3 className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Total Comments</p>
            <p className="text-2xl font-bold text-blue-900">{analytics.total}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-900">{analytics.pending}</p>
            {analytics.pending > 0 && (
              <p className="text-xs text-yellow-700">Urgent action needed</p>
            )}
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Approved</p>
            <p className="text-2xl font-bold text-green-900">{analytics.approved}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">Flagged/Spam</p>
            <p className="text-2xl font-bold text-red-900">{analytics.flagged + analytics.rejected}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600">Spam Rate</p>
            <p className="text-2xl font-bold text-purple-900">{analytics.spamRate.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Most Active Users</h4>
            <div className="space-y-2">
              {analytics.mostActiveUsers.map(([user, count]) => (
                <div key={user} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="text-sm">{user}</span>
                  <Badge variant="secondary">{count} comments</Badge>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Top Articles</h4>
            <div className="space-y-2">
              {analytics.topArticles.map(([article, count]) => (
                <div key={article} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="text-sm truncate flex-1">{article}</span>
                  <Badge variant="secondary">{count} comments</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-slate-50 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm">Average Moderation Response Time</span>
            <Badge>{analytics.averageResponseTime}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;