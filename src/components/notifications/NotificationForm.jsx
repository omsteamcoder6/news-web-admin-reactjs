import { useState } from 'react';
import { Send, X } from 'lucide-react';

// Simple card component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => <div className="p-6 pb-0">{children}</div>;
const CardContent = ({ children }) => <div className="p-6 pt-0">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;

// Simple button component
const Button = ({ children, onClick, type = 'button', variant = 'default', className = '' }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors";
  const variants = {
    default: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "hover:bg-slate-100",
    outline: "border border-slate-200 hover:bg-slate-50"
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// Simple input component
const Input = ({ id, value, onChange, placeholder, className = '', type = 'text' }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${className}`}
  />
);

// Simple label component
const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">
    {children}
  </label>
);

// Simple textarea component
const Textarea = ({ id, value, onChange, placeholder, rows = 4, className = '' }) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${className}`}
  />
);

// Simple select component
const Select = ({ value, onValueChange, children }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
  >
    {children}
  </select>
);
const SelectTrigger = ({ children }) => children;
const SelectValue = ({ placeholder, children }) => children || placeholder;
const SelectContent = ({ children }) => children;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

export default function NotificationForm({ onSubmit, onCancel, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    message: '',
    audience: 'all_users',
    priority: 'normal',
    scheduleType: 'immediate',
    scheduledDate: '',
    actionUrl: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    if (formData.scheduleType === 'scheduled' && !formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getAudienceCount = (audience) => {
    const counts = {
      all_users: '15,420 users',
      premium_only: '3,240 users',
      regular_only: '12,180 users'
    };
    return counts[audience] || '0 users';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{initialData ? 'Edit Notification' : 'Create New Notification'}</span>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., New Feature Announcement"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Enter your notification message here..."
              rows={4}
              className={errors.message ? 'border-red-500' : ''}
            />
            {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
            <p className="text-xs text-slate-500">
              {formData.message.length}/500 characters
            </p>
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select
              value={formData.audience}
              onValueChange={(value) => handleChange('audience', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_users">All Users ({getAudienceCount('all_users')})</SelectItem>
                <SelectItem value="premium_only">Premium Subscribers ({getAudienceCount('premium_only')})</SelectItem>
                <SelectItem value="regular_only">Regular Users ({getAudienceCount('regular_only')})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High - Immediate attention</SelectItem>
                <SelectItem value="normal">Normal - Standard delivery</SelectItem>
                <SelectItem value="low">Low - Non-urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Type */}
          <div className="space-y-2">
            <Label>Schedule</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.scheduleType === 'immediate'}
                  onChange={() => handleChange('scheduleType', 'immediate')}
                  className="w-4 h-4"
                />
                <span>Send Immediately</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.scheduleType === 'scheduled'}
                  onChange={() => handleChange('scheduleType', 'scheduled')}
                  className="w-4 h-4"
                />
                <span>Schedule for Later</span>
              </label>
            </div>
          </div>

          {/* Scheduled Date */}
          {formData.scheduleType === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date & Time</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                className={errors.scheduledDate ? 'border-red-500' : ''}
              />
              {errors.scheduledDate && <p className="text-sm text-red-500">{errors.scheduledDate}</p>}
            </div>
          )}

          {/* Action URL */}
          <div className="space-y-2">
            <Label htmlFor="actionUrl">Action URL (Optional)</Label>
            <Input
              id="actionUrl"
              value={formData.actionUrl}
              onChange={(e) => handleChange('actionUrl', e.target.value)}
              placeholder="https://example.com/offer"
            />
            <p className="text-xs text-slate-500">
              Users will be directed to this URL when they click the notification
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-slate-900">Summary</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>📊 Target: {getAudienceCount(formData.audience)}</p>
              <p>⚡ Priority: {formData.priority.toUpperCase()}</p>
              <p>⏰ {formData.scheduleType === 'immediate' ? 'Will be sent immediately' : `Scheduled for ${formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleString() : ''}`}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Send className="w-4 h-4" />
              {formData.scheduleType === 'scheduled' ? 'Schedule Notification' : 'Send Now'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}