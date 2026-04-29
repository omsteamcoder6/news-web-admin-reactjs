import { MainLayout } from "../../layout/MainLayout"

export default function Homepage() {
  return (
    <MainLayout>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Homepage Management</h1>
        <p className="text-slate-600 mt-2">Customize your homepage layout and content</p>
      </div>
    </MainLayout>
  )
}
