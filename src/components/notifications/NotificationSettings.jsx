import { useState } from 'react';
import { Save, RefreshCw, Bell, BellOff, Mail, Smartphone } from 'lucide-react';

// Simple card component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => <div className="p-6 pb-0">{children}</div>;
const CardContent = ({ children }) => <div className="p-6 pt-0">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold flex items-center gap-2">{children}</h3>;

const Button = ({ children, onClick, disabled, variant = 'default', className = '' }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors";
  const variants = {
    default: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 hover:bg-slate-50"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Switch = ({ checked, onCheckedChange, id }) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-slate-300'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
    {children}
  </label>
);

const Input = ({ id, type, value, onChange, placeholder }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
  />
);

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

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    batchSize: 1000,
    retryAttempts: 3,
    retryDelay: 5,
    rateLimit: 100,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    defaultPriority: 'normal'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      console.log('Saving settings:', settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      batchSize: 1000,
      retryAttempts: 3,
      retryDelay: 5,
      rateLimit: 100,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      defaultPriority: 'normal'
    });
  };

  return (
    <div className="space-y-6">
      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Bell className="w-5 h-5" />
            Delivery Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-500" />
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-slate-500">Send notifications via email</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-slate-500" />
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-slate-500">Send mobile push notifications</p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.pushNotifications}
              onCheckedChange={() => handleToggle('pushNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-500" />
              <div>
                <Label htmlFor="inapp-notifications">In-App Notifications</Label>
                <p className="text-sm text-slate-500">Show notifications within the app</p>
              </div>
            </div>
            <Switch
              id="inapp-notifications"
              checked={settings.inAppNotifications}
              onCheckedChange={() => handleToggle('inAppNotifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <RefreshCw className="w-5 h-5" />
            Delivery Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch-size">Batch Size</Label>
              <Input
                id="batch-size"
                type="number"
                value={settings.batchSize}
                onChange={(e) => handleChange('batchSize', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500">Number of notifications per batch</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retry-attempts">Retry Attempts</Label>
              <Input
                id="retry-attempts"
                type="number"
                value={settings.retryAttempts}
                onChange={(e) => handleChange('retryAttempts', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500">Number of retries for failed deliveries</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retry-delay">Retry Delay (minutes)</Label>
              <Input
                id="retry-delay"
                type="number"
                value={settings.retryDelay}
                onChange={(e) => handleChange('retryDelay', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500">Delay between retry attempts</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit (per minute)</Label>
              <Input
                id="rate-limit"
                type="number"
                value={settings.rateLimit}
                onChange={(e) => handleChange('rateLimit', parseInt(e.target.value))}
              />
              <p className="text-xs text-slate-500">Maximum notifications per minute</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours & Priority */}
      <Card>
        <CardHeader>
          <CardTitle>
            <BellOff className="w-5 h-5" />
            Quiet Hours & Priority
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiet-start">Quiet Hours Start</Label>
              <Input
                id="quiet-start"
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => handleChange('quietHoursStart', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quiet-end">Quiet Hours End</Label>
              <Input
                id="quiet-end"
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default-priority">Default Priority</Label>
            <Select
              value={settings.defaultPriority}
              onValueChange={(value) => handleChange('defaultPriority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button onClick={handleReset} variant="outline">
          Reset to Defaults
        </Button>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
          Settings saved successfully!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          Failed to save settings. Please try again.
        </div>
      )}
    </div>
  );
}