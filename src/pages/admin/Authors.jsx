import { useState, useEffect } from 'react';
import { MainLayout } from "../../layout/MainLayout";
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Plus } from 'lucide-react';
import AuthorForm from '../../components/authors/AuthorForm';
import AuthorCard from '../../components/authors/AuthorCard';
import authorApi from '../../lib/authorApi';
import { useAuthStore } from '../../stores/authStore';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuthStore();

  // Check if user has permission (admin or editor)
  const canModify = user?.role === 'admin' || user?.role === 'editor';

  // Load authors on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadAuthors();
    }
  }, [isAuthenticated]);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authorApi.getAllAuthors();
      // Handle both array and object responses
      const authorsList = Array.isArray(data) ? data : (data.authors || data.data || []);
      setAuthors(authorsList);
    } catch (err) {
      console.error('Failed to load authors:', err);
      setError(err.message || 'Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAuthor = async (newAuthor) => {
    try {
      const created = await authorApi.createAuthor(newAuthor);
      setAuthors(prevAuthors => [...prevAuthors, created]);
      return true;
    } catch (err) {
      console.error('Failed to add author:', err);
      setError(err.message || 'Failed to add author');
      return false;
    }
  };

  const handleEditAuthor = async (updatedAuthor) => {
    try {
      const updated = await authorApi.updateAuthor(editingAuthor._id, updatedAuthor); // Changed from editingAuthor.id
      setAuthors(prevAuthors => prevAuthors.map(author => 
        author._id === editingAuthor._id ? updated : author // Changed from author.id and editingAuthor.id
      ));
      return true;
    } catch (err) {
      console.error('Failed to update author:', err);
      setError(err.message || 'Failed to update author');
      return false;
    }
  };

  const handleDeleteAuthor = async (id) => {
    if (!confirm('Are you sure you want to delete this author?')) return;
    
    try {
      await authorApi.deleteAuthor(id);
      setAuthors(prevAuthors => prevAuthors.filter(author => author._id !== id)); // Changed from author.id
    } catch (err) {
      console.error('Failed to delete author:', err);
      setError(err.message || 'Failed to delete author');
    }
  };

  const openEditForm = (author) => {
    if (!canModify) {
      alert('You do not have permission to edit authors');
      return;
    }
    setEditingAuthor(author);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    let success;
    if (editingAuthor) {
      success = await handleEditAuthor(formData);
    } else {
      success = await handleAddAuthor(formData);
    }
    
    if (success) {
      closeForm();
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAuthor(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-600">Loading authors...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Authors & Journalists</h1>
            <p className="text-slate-600 mt-1">Manage content creators and their profiles</p>
          </div>
          {canModify && (
            <Button 
              onClick={() => {
                setEditingAuthor(null);
                setIsFormOpen(true);
              }} 
              className="bg-orange-500 hover:bg-orange-600 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Author
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Authors ({authors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {authors.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No authors found. Click "Add Author" to get started.
                </div>
              ) : (
                authors.map((author) => (
                  <AuthorCard
                    key={author._id} // Changed from author.id
                    author={author}
                    onEdit={canModify ? openEditForm : undefined}
                    onDelete={canModify ? handleDeleteAuthor : undefined}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <AuthorForm
          isOpen={isFormOpen}
          onClose={closeForm}
          author={editingAuthor}
          onSubmit={handleFormSubmit}
        />
      </div>
    </MainLayout>
  );
}