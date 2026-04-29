import { MainLayout } from "../../../layout/MainLayout"

export default function NewArticle() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Create New Article</h1>
        <p className="text-slate-600 mt-2">Write and publish a new article</p>
      </div>
    </AdminLayout>
  )
}
