import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowUp, Newspaper, Users, TrendingUp, Eye } from 'lucide-react'
import { MainLayout } from '../../layout/MainLayout'

// Sample data for charts
const articleData = [
  { month: 'Jan', published: 65, draft: 28 },
  { month: 'Feb', published: 78, draft: 39 },
  { month: 'Mar', published: 89, draft: 24 },
  { month: 'Apr', published: 92, draft: 35 },
  { month: 'May', published: 105, draft: 42 },
  { month: 'Jun', published: 112, draft: 38 },
]

const viewsData = [
  { day: 'Mon', views: 4200 },
  { day: 'Tue', views: 5100 },
  { day: 'Wed', views: 4800 },
  { day: 'Thu', views: 6200 },
  { day: 'Fri', views: 7100 },
  { day: 'Sat', views: 8200 },
  { day: 'Sun', views: 6900 },
]

const statCards = [
  {
    title: 'Total Articles',
    value: '1,247',
    description: 'Across all categories',
    icon: Newspaper,
    trend: '+12%',
  },
  {
    title: 'Today Published',
    value: '23',
    description: 'Published this morning',
    icon: TrendingUp,
    trend: '+5%',
  },
  {
    title: 'Total Users',
    value: '12,845',
    description: 'Active subscribers',
    icon: Users,
    trend: '+8%',
  },
  {
    title: 'Page Views',
    value: '145.2K',
    description: 'This week',
    icon: Eye,
    trend: '+15%',
  },
]

export default function AdminDashboard() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome to Vikatan Admin Panel - Your complete news management hub</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500">{stat.description}</p>
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Articles Published Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Articles Published</CardTitle>
              <CardDescription>Published vs Draft articles over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={articleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="published" fill="#f97316" name="Published" />
                  <Bar dataKey="draft" fill="#cbd5e1" name="Draft" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Page Views</CardTitle>
              <CardDescription>Total visits this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#f97316"
                    name="Views"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Articles</CardTitle>
            <CardDescription>Top articles by views this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Breaking News: Political Updates', views: '12.5K', category: 'Politics' },
                { title: 'Latest Movie Reviews & Ratings', views: '9.8K', category: 'Cinema' },
                { title: 'Sports Updates & Match Results', views: '8.2K', category: 'Sports' },
                { title: 'Lifestyle Tips & Trends', views: '6.4K', category: 'Lifestyle' },
                { title: 'Daily Astrology Predictions', views: '5.1K', category: 'Astrology' },
              ].map((article, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <div>
                    <p className="font-medium text-slate-900">{article.title}</p>
                    <span className="text-xs text-slate-500">{article.category}</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-500">{article.views}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
