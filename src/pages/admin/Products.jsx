import { MainLayout } from "../../layout/MainLayout"
import { useState } from "react"
import ProductAddForm from "../../components/product/ProductAddForm"
import ProductList from "../../components/product/ProductList"
import ProductsBooking from "../../components/product/ProductsBooking"
import ProductCategory from "../../components/product/ProductCategory"

export default function Products() {
  const [activeTab, setActiveTab] = useState("list")
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([
    { id: 1, name: "Electronics", slug: "electronics" },
    { id: 2, name: "Clothing", slug: "clothing" },
    { id: 3, name: "Books", slug: "books" }
  ])

  const addProduct = (newProduct) => {
    setProducts([...products, { ...newProduct, id: Date.now() }])
    setActiveTab("list")
  }

  const addCategory = (newCategory) => {
    setCategories([...categories, { ...newCategory, id: Date.now() }])
  }

  const deleteProduct = (productId) => {
    setProducts(products.filter(product => product.id !== productId))
  }

  const updateProduct = (updatedProduct) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ))
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-2">Manage your products and categories</p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab("list")}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "list"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Product List
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "add"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Add Product
            </button>
            <button
              onClick={() => setActiveTab("category")}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "category"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === "booking"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bookings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "list" && (
            <ProductList 
              products={products} 
              categories={categories}
              onDeleteProduct={deleteProduct}
              onUpdateProduct={updateProduct}
            />
          )}
          {activeTab === "add" && (
            <ProductAddForm categories={categories} onSubmit={addProduct} />
          )}
          {activeTab === "category" && (
            <ProductCategory categories={categories} onAddCategory={addCategory} />
          )}
          {activeTab === "booking" && <ProductsBooking products={products} />}
        </div>
      </div>
    </MainLayout>
  )
}