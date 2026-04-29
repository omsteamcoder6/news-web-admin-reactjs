// Categories.jsx - Fixed for undefined id issue
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from "../../layout/MainLayout";
import CategoryCard from '../../components/categories/CategoryCard';
import CategoryForm from '../../components/categories/CategoryForm';
import CategoryReorder from '../../components/categories/CategoryReorder';
import CategoryHeader from '../../components/categories/CategoryHeader';
import { Button } from '../../components/ui/Button';
import { ArrowUpDown } from 'lucide-react';
import categoryAPI from '../../lib/categapi';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriesData = await categoryAPI.getCategories({ sort: 'position' });
      
      const categoriesList = Array.isArray(categoriesData) 
        ? categoriesData 
        : categoriesData.categories || categoriesData.data || [];
      
      // Ensure each category has an id field (convert _id to id if needed)
      const normalizedCategories = categoriesList.map(cat => ({
        ...cat,
        id: cat.id || cat._id // Support both id and _id
      }));
      
      setCategories(normalizedCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNewCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSubmitCategory = async (formData) => {
    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.id, formData);
      } else {
        await categoryAPI.createCategory(formData);
      }
      await loadCategories();
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Failed to save category:', err);
      alert(err.message || 'Failed to save category');
    }
  };

  const handleReorder = async (reorderedCategories) => {
    try {
      if (categoryAPI.reorderCategories) {
        await categoryAPI.reorderCategories(reorderedCategories);
      } else {
        const updatePromises = reorderedCategories.map((category) => 
          categoryAPI.updateCategory(category.id, { position: category.position })
        );
        await Promise.all(updatePromises);
      }
      
      await loadCategories();
      setIsReorderMode(false);
    } catch (err) {
      console.error('Failed to reorder categories:', err);
      alert(err.message || 'Failed to reorder categories');
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      const newStatus = category.status === 'Active' ? 'Hidden' : 'Active';
      
      if (categoryAPI.updateCategoryStatus) {
        await categoryAPI.updateCategoryStatus(category.id, newStatus);
      } else {
        await categoryAPI.updateCategory(category.id, { ...category, status: newStatus });
      }
      
      await loadCategories();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert(err.message || 'Failed to update category status');
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}" category?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      await categoryAPI.deleteCategory(category.id);
      await loadCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  // Navigate to category customization page - FIXED with proper id
  const handleCategoryClick = (category) => {
    const categoryId = category.id || category._id;
    if (categoryId) {
      navigate(`/admin/categories/${categoryId}/customize`);
    } else {
      console.error('Category has no id:', category);
      alert('Cannot customize: Category ID not found');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Loading categories...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-600 text-center">
            <p className="font-semibold">Error loading categories</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <Button onClick={loadCategories} variant="outline">
            Try Again
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <CategoryHeader onNewCategory={handleNewCategory} />

        <div className="flex justify-end">
          <Button
            onClick={() => setIsReorderMode(!isReorderMode)}
            variant={isReorderMode ? "default" : "outline"}
            className="gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            {isReorderMode ? "Done Reordering" : "Reorder Categories"}
          </Button>
        </div>

        {isReorderMode ? (
          <CategoryReorder 
            categories={categories} 
            onReorder={handleReorder} 
          />
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Categories Yet</h3>
            <p className="text-slate-600 mb-4">Get started by creating your first category</p>
            <Button onClick={handleNewCategory} className="bg-orange-500 hover:bg-orange-600">
              Create Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div 
                key={category.id || category._id}
                onClick={() => handleCategoryClick(category)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <CategoryCard
                  category={{
                    id: category.id || category._id,
                    name: category.name,
                    slug: category.slug,
                    icon: category.icon || '📁',
                    status: category.status,
                    articles: category.articles || 0,
                    position: category.position
                  }}
                  onEdit={handleEditCategory}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDeleteCategory}
                  showCustomizeBadge={true}
                />
              </div>
            ))}
          </div>
        )}

        {isFormOpen && (
          <CategoryForm
            category={editingCategory ? {
              id: editingCategory.id || editingCategory._id,
              name: editingCategory.name,
              slug: editingCategory.slug,
              icon: editingCategory.icon,
              status: editingCategory.status,
              position: editingCategory.position
            } : null}
            categories={categories}
            onSubmit={handleSubmitCategory}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </MainLayout>
  );
}