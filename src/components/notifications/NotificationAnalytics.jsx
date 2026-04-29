'use client';

import { TrendingUp, Users, Bell, Clock, Eye, MousePointerClick } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => <div className="p-6 pb-0">{children}</div>;
const CardContent = ({ children }) => <div className="p-6 pt-0">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;

export default function NotificationAnalytics() {
  const analyticsData = {
    dailyStats: [
      { date: 'Jan 10', sent: 12500, opened: 8900, clicked: 3400 },
      { date: 'Jan 11', sent: 14200, opened: 10200, clicked: 4100 },
      { date: 'Jan 12', sent: 13800, opened: 9800, clicked: 3900 },
      { date: 'Jan 13', sent: 15420, opened: 11200, clicked: 4500 },
      { date: 'Jan 14', sent: 14800, opened: 10500, clicked: 4200 },
      { date: 'Jan 15', sent: 15200, opened: 10900, clicked: 4400 },
      { date: 'Jan 16', sent: 15800, opened: 11400, clicked: 4600 },
    ],
    audienceBreakdown: [
      { name: 'Premium Users', value: 3240 },
      { name: 'Regular Users', value: 12180 },
    ],
    performanceMetrics: {
      deliveryRate: 97.8,
      openRate: 72.4,
      clickThroughRate: 28.6,
      avgResponseTime: '2.3 minutes'
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend} from last week
              </p>
            )}
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <Icon className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Simple bar chart component
  const SimpleBarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.sent, d.opened, d.clicked)));
    
    return (
      <div className="space-y-2">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded"></div><span>Sent</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div><span>Opened</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div><span>Clicked</span></div>
        </div>
        <div className="flex justify-between items-end h-64 gap-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full h-48 flex flex-col justify-end gap-1">
                <div className="w-full bg-orange-200 rounded-t transition-all" style={{ height: `${(item.sent / maxValue) * 100}%` }}>
                  <div className="w-full bg-orange-500 rounded-t transition-all" style={{ height: `${(item.opened / item.sent) * 100}%` }}></div>
                </div>
              </div>
              <span className="text-xs text-slate-600">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple pie chart component
  const SimplePieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#f97316', '#3b82f6'];
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((item, idx) => {
              const percentage = (item.value / total) * 100;
              const startAngle = data.slice(0, idx).reduce((sum, i) => sum + (i.value / total) * 360, 0);
              const endAngle = startAngle + (percentage * 3.6);
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;
              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);
              const largeArc = percentage > 50 ? 1 : 0;
              
              return (
                <path
                  key={idx}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[idx % colors.length]}
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Total Users</div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[idx % colors.length] }}></div>
              <span className="text-sm">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple bar chart for engagement
  const SimpleEngagementChart = ({ data }) => {
    return (
      <div className="space-y-2">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded"></div><span>Open Rate (%)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div><span>Click Rate (%)</span></div>
        </div>
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.type}</span>
                <span className="text-slate-500">{item.openRate}% / {item.clickRate}%</span>
              </div>
              <div className="flex gap-1 h-6">
                <div className="bg-orange-500 rounded" style={{ width: `${item.openRate}%` }}></div>
                <div className="bg-blue-500 rounded" style={{ width: `${item.clickRate}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Delivery Rate"
          value={`${analyticsData.performanceMetrics.deliveryRate}%`}
          icon={Bell}
          trend="+2.1%"
        />
        <MetricCard
          title="Open Rate"
          value={`${analyticsData.performanceMetrics.openRate}%`}
          icon={Eye}
          trend="+5.3%"
        />
        <MetricCard
          title="Click-Through Rate"
          value={`${analyticsData.performanceMetrics.clickThroughRate}%`}
          icon={MousePointerClick}
          trend="+1.8%"
        />
        <MetricCard
          title="Avg Response Time"
          value={analyticsData.performanceMetrics.avgResponseTime}
          icon={Clock}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Notification Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={analyticsData.dailyStats} />
          </CardContent>
        </Card>

        {/* Audience Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Audience Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={analyticsData.audienceBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement by Notification Type</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleEngagementChart data={[
            { type: 'Article Alert', openRate: 78, clickRate: 32 },
            { type: 'Price Drop', openRate: 82, clickRate: 45 },
            { type: 'Feature Update', openRate: 68, clickRate: 25 },
            { type: 'Subscription', openRate: 88, clickRate: 52 },
          ]} />
        </CardContent>
      </Card>
    </div>
  );
}