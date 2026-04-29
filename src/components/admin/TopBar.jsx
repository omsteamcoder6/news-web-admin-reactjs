import { Bell, Settings, User } from 'lucide-react'

export function TopBar() {
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
      <div>
        <h2 className="text-sm text-slate-500">Welcome back!</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative text-slate-600 hover:text-slate-900 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="text-slate-600 hover:text-slate-900 transition">
          <Settings className="w-5 h-5" />
        </button>

        {/* Profile Dropdown */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}