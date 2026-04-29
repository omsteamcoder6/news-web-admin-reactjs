import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';

const AuthorForm = ({ isOpen, onClose, author = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: author?.name || '',
    role: author?.role || '',
    status: author?.status || 'Active',
  });

  // Reset form data whenever the author prop changes (e.g. switching between add/edit)
  useEffect(() => {
    setFormData({
      name: author?.name || '',
      role: author?.role || '',
      status: author?.status || 'Active',
    });
  }, [author, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] md:max-w-[600px] w-full bg-white rounded-lg shadow-xl p-0">
        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {author ? 'Edit Author' : 'Add New Author'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter author name"
                  className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  required
                />
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-700 block">
                  Role
                </Label>
                <Input
                  id="role"
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Journalist, Editor"
                  className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  required
                />
              </div>

              {/* Status Field */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-slate-700 block">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active" className="py-2">Active</SelectItem>
                    <SelectItem value="Inactive" className="py-2">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-8 gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-6 py-2.5 text-base font-medium rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 px-6 py-2.5 text-base font-medium rounded-lg text-white transition-colors"
              >
                {author ? 'Update' : 'Add'} Author
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorForm;