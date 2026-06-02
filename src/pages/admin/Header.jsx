import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, RotateCcw, Plus, Trash2, Edit2, 
  Eye, EyeOff, Upload, Layers, Settings, Layout
} from 'lucide-react';

const Header = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('nav'); // 'nav', 'sections', 'style'
  
  // Form States
  const [newNavItem, setNewNavItem] = useState({ label: '', href: '', isActive: true });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/header');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching header settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Navigation Item Active Status
  const handleToggleActive = async (itemId, currentStatus) => {
    try {
      // Optimistically update frontend state for instant UI change
      setSettings(prev => ({
        ...prev,
        navItems: prev.navItems.map(item => 
          item._id === itemId ? { ...item, isActive: !currentStatus } : item
        )
      }));

      // Call API to persist in MongoDB database
      const token = localStorage.getItem('token');
      await axios.patch(`/api/header/nav-items/${itemId}/toggle-active`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error toggling status:", err);
      // Revert back if API fails
      fetchSettings();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/header', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert('Settings saved successfully!');
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert('Failed to save settings.');
    }
  };

  const handleResetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset header settings to default?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/header/reset', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSettings(res.data.data);
        alert('Settings reset successfully!');
      }
    } catch (err) {
      console.error("Error resetting settings:", err);
    }
  };

  const handleAddNavItem = async (e) => {
    e.preventDefault();
    if (!newNavItem.label || !newNavItem.href) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/header/nav-items', newNavItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSettings(res.data.data);
        setNewNavItem({ label: '', href: '', isActive: true });
      }
    } catch (err) {
      console.error("Error adding nav item:", err);
    }
  };

  const handleDeleteNavItem = async (itemId) => {
    if (!window.confirm('Delete this navigation item?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`/api/header/nav-items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error("Error deleting nav item:", err);
    }
  };

  const handleUpdateNavItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/header/nav-items/${editingItem._id}`, editingItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSettings(res.data.data);
        setEditingItem(null);
      }
    } catch (err) {
      console.error("Error updating nav item:", err);
    }
  };

  const handleToggleSection = async (sectionName, currentStatus) => {
    try {
      setSettings(prev => ({
        ...prev,
        sections: prev.sections.map(s => 
          s.name === sectionName ? { ...s, isEnabled: !currentStatus } : s
        )
      }));

      const token = localStorage.getItem('token');
      await axios.patch(`/api/header/section/${sectionName}/toggle`, 
        { isEnabled: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error toggling section:", err);
      fetchSettings();
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/header/upload-logo', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      if (res.data.success) {
        setSettings(prev => ({ ...prev, logoUrl: res.data.data.logoUrl }));
        alert('Logo uploaded successfully!');
      }
    } catch (err) {
      console.error("Error uploading logo:", err);
      alert('Logo upload failed.');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading Configuration...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow rounded-lg">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layout className="w-6 h-6 text-indigo-600" /> Header Configuration
          </h1>
          <p className="text-sm text-gray-500">Manage navigation menu links, visibility layout rules, and branding</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleResetSettings} className="flex items-center gap-1 px-3 py-2 border text-gray-600 rounded hover:bg-gray-50 text-sm">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSaveSettings} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium">
            <Save className="w-4 h-4" /> Save Setup
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button onClick={() => setActiveTab('nav')} className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-all ${activeTab === 'nav' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Navigation Links
        </button>
        <button onClick={() => setActiveTab('sections')} className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-all ${activeTab === 'sections' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Layout Sections
        </button>
        <button onClick={() => setActiveTab('style')} className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-all ${activeTab === 'style' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Branding & Styling
        </button>
      </div>

      {/* TAB 1: NAVIGATION LINKS */}
      {activeTab === 'nav' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Menu Structuring</h3>
            
            <div className="space-y-2 border p-3 rounded-lg bg-gray-50">
              {settings.navItems?.map((item) => (
                <div key={item._id} className="flex items-center justify-between bg-white p-3 rounded border shadow-sm group">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.href}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* STATUS TOGGLE BUTTON */}
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                        item.isActive 
                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                          : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Disabled'}
                    </button>

                    <button onClick={() => setEditingItem(item)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteNavItem(item._id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{editingItem ? 'Edit Item' : 'Create Menu Item'}</h3>
            {editingItem ? (
              <form onSubmit={handleUpdateNavItem} className="space-y-3 bg-gray-50 p-4 border rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Label</label>
                  <input type="text" value={editingItem.label} onChange={e => setEditingItem({...editingItem, label: e.target.value})} className="w-full border p-2 text-sm rounded focus:outline-indigo-600" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Redirection Path (URL)</label>
                  <input type="text" value={editingItem.href} onChange={e => setEditingItem({...editingItem, href: e.target.value})} className="w-full border p-2 text-sm rounded focus:outline-indigo-600" required />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-green-600 text-white text-sm py-2 rounded font-medium hover:bg-green-700">Update</button>
                  <button type="button" onClick={() => setEditingItem(null)} className="bg-gray-200 text-gray-700 text-sm px-3 rounded hover:bg-gray-300">Cancel</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddNavItem} className="space-y-3 bg-gray-50 p-4 border rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Label</label>
                  <input type="text" value={newNavItem.label} onChange={e => setNewNavItem({...newNavItem, label: e.target.value})} placeholder="e.g., Blogs" className="w-full border p-2 text-sm rounded focus:outline-indigo-600" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Redirection Path (URL)</label>
                  <input type="text" value={newNavItem.href} onChange={e => setNewNavItem({...newNavItem, href: e.target.value})} placeholder="e.g., /blogs" className="w-full border p-2 text-sm rounded focus:outline-indigo-600" required />
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-1 bg-indigo-600 text-white text-sm py-2 rounded font-medium hover:bg-indigo-700 mt-2">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LAYOUT SECTIONS */}
      {activeTab === 'sections' && (
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-700">Manage Section Visibility</h3>
          <div className="border rounded-lg divide-y bg-gray-50">
            {settings.sections?.map((section) => (
              <div key={section.name} className="flex items-center justify-between p-4 bg-white">
                <div>
                  <p className="font-semibold capitalize text-gray-700 text-sm">{section.name.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-xs text-gray-400">Render visibility status on public endpoints</p>
                </div>
                <button
                  onClick={() => handleToggleSection(section.name, section.isEnabled)}
                  className={`p-1.5 border rounded transition-all ${section.isEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}
                >
                  {section.isEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BRANDING & STYLING */}
      {activeTab === 'style' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
            <h3 className="text-md font-semibold text-gray-700 flex items-center gap-1"><Settings className="w-4 h-4"/> Identity Settings</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand Name</label>
              <input type="text" name="brandName" value={settings.brandName || ''} onChange={handleInputChange} className="w-full border p-2 text-sm rounded focus:outline-indigo-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Corporate Header Logo</label>
              <div className="flex items-center gap-3 mt-1">
                {settings.logoUrl && <img src={settings.logoUrl} alt="Logo Preview" className="h-10 max-w-[120px] object-contain border p-1 rounded bg-white" />}
                <label className="flex items-center gap-1 px-3 py-1.5 border bg-white rounded cursor-pointer text-xs text-gray-600 hover:bg-gray-50 shadow-sm font-medium">
                  <Upload className="w-3.5 h-3.5" /> Upload File
                  <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
            <h3 className="text-md font-semibold text-gray-700 flex items-center gap-1"><Layers className="w-4 h-4"/> Layout Colors</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
                <div className="flex gap-2">
                  <input type="color" name="backgroundColor" value={settings.backgroundColor || '#ffffff'} onChange={handleInputChange} className="w-8 h-8 rounded cursor-pointer border p-0" />
                  <input type="text" name="backgroundColor" value={settings.backgroundColor || ''} onChange={handleInputChange} className="flex-1 border px-2 text-xs rounded" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                <div className="flex gap-2">
                  <input type="color" name="textColor" value={settings.textColor || '#000000'} onChange={handleInputChange} className="w-8 h-8 rounded cursor-pointer border p-0" />
                  <input type="text" name="textColor" value={settings.textColor || ''} onChange={handleInputChange} className="flex-1 border px-2 text-xs rounded" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="isSticky" name="isSticky" checked={settings.isSticky || false} onChange={handleInputChange} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="isSticky" className="text-xs font-medium text-gray-700 select-none">Enable Fixed Sticky Header Layout on Scroll</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;