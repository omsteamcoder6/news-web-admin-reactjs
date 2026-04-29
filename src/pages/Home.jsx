import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LayoutDashboard, Newspaper, Users, Settings, BarChart3, Shield } from 'lucide-react'

const features = [
  {
    icon: LayoutDashboard,
    title: 'Comprehensive Dashboard',
    description: 'Real-time analytics and overview of all activities'
  },
  {
    icon: Newspaper,
    title: 'Article Management',
    description: 'Create, edit, and manage news articles with rich editor'
  },
  {
    icon: Users,
    title: 'User Management',
    description: 'Manage authors, editors, and user roles'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Track engagement, traffic, and performance metrics'
  },
  {
    icon: Settings,
    title: 'Advanced Settings',
    description: 'Configure SEO, ads, and notification preferences'
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Secure admin panel with granular permission control'
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <h1 className="text-xl font-bold text-white">Vikatan Admin</h1>
          </div>
          <Link to="/admin">
            <Button className="bg-orange-500 hover:bg-orange-600">Go to Admin Panel</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Professional Admin Panel for Vikatan
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Complete news management system with advanced features for content creation, analytics, and user management
          </p>
          <Link to="/admin">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg">
              Enter Admin Panel
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                <div className="p-6">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500/10 border-t border-b border-orange-500/20 py-16 my-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to manage your content?</h3>
          <p className="text-slate-300 mb-8">Access the full-featured admin panel with all tools needed to manage Vikatan</p>
          <Link to="/admin">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              Launch Admin Panel
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-slate-400">© 2024 Vikatan Admin Panel. All rights reserved.</p>
            <p className="text-slate-500 text-sm">Built with React & Vite</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
