// MainLayout.jsx - FIXED
import { Sidebar } from '../components/admin/Sidebar'  // Fix this import
import { TopBar } from '../components/admin/TopBar'

export function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}