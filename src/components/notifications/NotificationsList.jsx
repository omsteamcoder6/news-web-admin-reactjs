import { useState } from 'react';
import { 
  Bell, 
  Search, 
  Eye, 
  Trash2, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  RefreshCw,
  Copy
} from 'lucide-react';

// Simple card component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => <div className="p-6 pb-0">{children}</div>;
const CardContent = ({ children }) => <div className="p-6 pt-0">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold flex items-center gap-2">{children}</h3>;

const Button = ({ children, onClick, variant = 'default', size = 'default', disabled, className = '' }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors";
  const variants = {
    default: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "hover:bg-slate-100",
    outline: "border border-slate-200 hover:bg-slate-50"
  };
  const sizes = {
    sm: "px-2 py-1 text-sm",
    default: "px-4 py-2"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ placeholder, value, onChange, className = '' }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${className}`}
  />
);

const Select = ({ value, onValueChange, children }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
  >
    {children}
  </select>
);
const SelectTrigger = ({ children }) => children;
const SelectValue = ({ placeholder, children }) => children || placeholder;
const SelectContent = ({ children }) => children;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

const Badge = ({ children, className = '' }) => (
  <span className={`px-2 py-1 rounded-md text-xs font-medium ${className}`}>{children}</span>
);

const DropdownMenu = ({ children }) => <div className="relative">{children}</div>;
const DropdownMenuTrigger = ({ children, asChild }) => <div>{children}</div>;
const DropdownMenuContent = ({ children, align }) => (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-10">
    {children}
  </div>
);
const DropdownMenuItem = ({ children, onClick, className = '' }) => (
  <button onClick={onClick} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${className}`}>
    {children}
  </button>
);

export default function NotificationsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Article: "The Future of AI"',
      message: 'Check out our latest article about artificial intelligence trends...',
      audience: 'all_users',
      status: 'sent',
      priority: 'high',
      sentAt: '2024-01-15T10:30:00Z',
      deliveredCount: 15123,
      openRate: 72.4,
      clickRate: 28.6
    },
    {
      id: '2',
      title: 'Premium Exclusive: Deep Dive',
      message: 'Exclusive content available for premium subscribers...',
      audience: 'premium_only',
      status: 'sent',
      priority: 'normal',
      sentAt: '2024-01-14T15:20:00Z',
      deliveredCount: 3189,
      openRate: 82.1,
      clickRate: 35.2
    },
    {
      id: '3',
      title: 'Price Drop Announcement',
      message: 'Special pricing available for a limited time...',
      audience: 'regular_only',
      status: 'sent',
      priority: 'high',
      sentAt: '2024-01-13T09:15:00Z',
      deliveredCount: 11234,
      openRate: 68.5,
      clickRate: 42.3
    },
    {
      id: '4',
      title: 'Weekly Newsletter',
      message: 'Your weekly digest of top stories...',
      audience: 'all_users',
      status: 'scheduled',
      priority: 'normal',
      scheduledFor: '2024-01-17T09:00:00Z'
    },
    {
      id: '5',
      title: 'Subscription Reminder',
      message: 'Your premium subscription will expire soon...',
      audience: 'premium_only',
      status: 'draft',
      priority: 'high'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
        return 'bg-slate-100 text-slate-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'normal':
        return 'bg-blue-100 text-blue-700';
      case 'low':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getAudienceLabel = (audience) => {
    switch (audience) {
      case 'all_users':
        return 'All Users';
      case 'premium_only':
        return 'Premium Only';
      case 'regular_only':
        return 'Regular Only';
      default:
        return audience;
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleResend = (id) => {
    console.log('Resending notification:', id);
  };

  const handleDuplicate = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      title: `${notification.title} (Copy)`,
      status: 'draft',
      sentAt: undefined,
      scheduledFor: undefined
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4" />;
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <Bell className="w-5 h-5" />
            Notification History
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div key={notification.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusIcon(notification.status)}
                      <h3 className="font-medium text-slate-900">{notification.title}</h3>
                      <Badge className={getStatusColor(notification.status)}>
                        {notification.status.toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(notification.priority)}>
                        {notification.priority.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>Audience: {getAudienceLabel(notification.audience)}</span>
                      
                      {notification.sentAt && (
                        <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>
                      )}
                      
                      {notification.scheduledFor && (
                        <span>Scheduled: {new Date(notification.scheduledFor).toLocaleString()}</span>
                      )}
                      
                      {notification.deliveredCount && (
                        <span>Delivered: {notification.deliveredCount.toLocaleString()}</span>
                      )}
                      
                      {notification.openRate && (
                        <span>Open Rate: {notification.openRate}%</span>
                      )}
                      
                      {notification.clickRate && (
                        <span>CTR: {notification.clickRate}%</span>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => console.log('View details:', notification.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {notification.status !== 'sent' && (
                        <DropdownMenuItem onClick={() => console.log('Send now:', notification.id)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Now
                        </DropdownMenuItem>
                      )}
                      {notification.status === 'sent' && (
                        <DropdownMenuItem onClick={() => handleResend(notification.id)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDuplicate(notification)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {filteredNotifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <span>Showing {filteredNotifications.length} of {notifications.length} notifications</span>
            <Button variant="ghost" size="sm">
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}