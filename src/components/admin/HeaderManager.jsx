import { useState, useEffect } from 'react';
import { MainLayout } from '../../layout/MainLayout';
import { useAuthStore } from '../../stores/authStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || 'http://localhost:3002';

// Sortable Item Component
function SortableNavItem({ item, index, onEdit, onDelete, onToggleActive, editingItem, setEditingItem, updateNavItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-gray-50 rounded border ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        title="Drag to reorder"
      >
        ⋮⋮
      </div>

      {editingItem === item._id ? (
        <>
          <input
            defaultValue={item.label}
            id={`label-${item._id}`}
            className="border rounded px-2 py-1 flex-1"
          />
          <input
            defaultValue={item.href}
            id={`href-${item._id}`}
            className="border rounded px-2 py-1 flex-1"
          />
          <button
            onClick={() => {
              const newLabel = document.getElementById(`label-${item._id}`).value;
              const newHref = document.getElementById(`href-${item._id}`).value;
              updateNavItem(item._id, { label: newLabel, href: newHref });
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Save
          </button>
          <button
            onClick={() => setEditingItem(null)}
            className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 font-medium">{item.label}</span>
          <span className="text-gray-500 text-sm flex-1">{item.href}</span>
          {item.hasDropdown && (
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
              Dropdown
            </span>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onToggleActive(item._id, !item.isActive)}
              className={`px-2 py-1 rounded text-xs ${
                item.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </button>
            <button
              onClick={() => onEdit(item._id)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Sortable Sections Component
function SortableSection({ section, onToggle, isUpdating }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sectionLabels = {
    topBar: 'Top Bar',
    logoArea: 'Logo Area',
    searchBar: 'Search Bar',
    navMenu: 'Navigation Menu',
    trendingBar: 'Trending Bar',
    subscribeBtn: 'Subscribe Button',
    userArea: 'User Area',
    mobileMenu: 'Mobile Menu'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-white rounded border ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          ⋮⋮
        </div>
        <span className="font-medium">{sectionLabels[section.name] || section.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(section.name, !section.isEnabled)}
          disabled={isUpdating}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            section.isEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUpdating ? '...' : (section.isEnabled ? 'Enabled' : 'Disabled')}
        </button>
      </div>
    </div>
  );
}

export default function HeaderManager() {
  const [navItems, setNavItems] = useState([]);
  const [sections, setSections] = useState([]);
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoAltText, setLogoAltText] = useState('');
  const [logoLink, setLogoLink] = useState('');
  const [subscribeBtnText, setSubscribeBtnText] = useState('');
  const [subscribeBtnLink, setSubscribeBtnLink] = useState('');
  const [isSticky, setIsSticky] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [borderColor, setBorderColor] = useState('#e5e5e5');
  const [hoverColor, setHoverColor] = useState('#1a6bff');
  const [fontFamily, setFontFamily] = useState('Jost, sans-serif');
  const [logoFontFamily, setLogoFontFamily] = useState('Playfair Display, serif');
  const [isHeaderEnabled, setIsHeaderEnabled] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [updatingSection, setUpdatingSection] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const { getToken } = useAuthStore();

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  });

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch current header settings
  useEffect(() => {
    fetchHeaderSettings();
  }, []);

  const fetchHeaderSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/header`);
      const result = await response.json();
      if (result.success) {
        const data = result.data;
        setNavItems(data.navItems || []);
        setSections(data.sections || []);
        setBrandName(data.brandName || '');
        setLogoUrl(data.logoUrl || '');
        setLogoAltText(data.logoAltText || '');
        setLogoLink(data.logoLink || '/');
        setSubscribeBtnText(data.subscribeBtnText || 'Subscribe');
        setSubscribeBtnLink(data.subscribeBtnLink || '/pricing');
        setIsSticky(data.isSticky ?? true);
        setBackgroundColor(data.backgroundColor || '#ffffff');
        setTextColor(data.textColor || '#1a1a1a');
        setBorderColor(data.borderColor || '#e5e5e5');
        setHoverColor(data.hoverColor || '#1a6bff');
        setFontFamily(data.fontFamily || 'Jost, sans-serif');
        setLogoFontFamily(data.logoFontFamily || 'Playfair Display, serif');
        setIsHeaderEnabled(data.isEnabled ?? true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update ALL header settings
  const updateHeaderSettings = async (updates) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/header`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        await fetchHeaderSettings();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Upload logo file
  const uploadLogoFile = async (file) => {
    if (!file) return;
    
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/header/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        setLogoUrl(result.data.logoUrl);
        alert('Logo uploaded successfully!');
      } else {
        alert(result.message || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle drag end for nav items
  const handleDragEndNav = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = navItems.findIndex((item) => item._id === active.id);
      const newIndex = navItems.findIndex((item) => item._id === over?.id);
      
      const reordered = arrayMove(navItems, oldIndex, newIndex);
      const itemIds = reordered.map(item => item._id);
      
      // Optimistically update UI
      setNavItems(reordered);
      
      // Send to server
      try {
        const response = await fetch(`${API_BASE_URL}/header/nav-items/reorder`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ items: itemIds })
        });
        if (!response.ok) {
          // Revert on error
          await fetchHeaderSettings();
        }
      } catch (error) {
        console.error('Reorder error:', error);
        await fetchHeaderSettings();
      }
    }
  };

  // Handle drag end for sections
  const handleDragEndSections = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((section) => section.name === active.id);
      const newIndex = sections.findIndex((section) => section.name === over?.id);
      
      const reordered = arrayMove(sections, oldIndex, newIndex);
      const sectionsOrder = reordered.map((section, idx) => ({
        name: section.name,
        order: idx
      }));
      
      // Optimistically update UI
      setSections(reordered);
      
      // Send to server
      try {
        const response = await fetch(`${API_BASE_URL}/header/sections/reorder`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ sections: sectionsOrder })
        });
        if (!response.ok) {
          await fetchHeaderSettings();
        }
      } catch (error) {
        console.error('Reorder sections error:', error);
        await fetchHeaderSettings();
      }
    }
  };

  // Add new navigation item
  const addNavItem = async (item) => {
    try {
      const response = await fetch(`${API_BASE_URL}/header/nav-items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
      });
      if (response.ok) {
        await fetchHeaderSettings();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add menu item');
    }
  };

  // Update navigation item
  const updateNavItem = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/header/nav-items/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        await fetchHeaderSettings();
        setEditingItem(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update menu item');
    }
  };

  // Delete navigation item
  const deleteNavItem = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/header/nav-items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        await fetchHeaderSettings();
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete menu item');
    }
  };

  // Toggle section visibility
  const toggleSection = async (sectionName, isEnabled) => {
    setUpdatingSection(sectionName);
    try {
      const response = await fetch(`${API_BASE_URL}/header/section/${sectionName}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isEnabled })
      });
      if (response.ok) {
        await fetchHeaderSettings();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to toggle section');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to toggle section');
    } finally {
      setUpdatingSection(null);
    }
  };

  // Save all settings at once
  const saveAllSettings = async () => {
    const success = await updateHeaderSettings({
      brandName,
      logoUrl,
      logoAltText,
      logoLink,
      subscribeBtnText,
      subscribeBtnLink,
      isSticky,
      backgroundColor,
      textColor,
      borderColor,
      hoverColor,
      fontFamily,
      logoFontFamily,
      isEnabled: isHeaderEnabled
    });
    if (success) {
      alert('All settings saved successfully!');
    } else {
      alert('Failed to save settings');
    }
  };

  // Reset to default
  const resetToDefault = async () => {
    if (!confirm('Reset all header settings to default? This cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/header/reset`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        await fetchHeaderSettings();
        alert('Header settings reset to default');
      } else {
        alert('Failed to reset settings');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reset settings');
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="p-8">Loading header settings...</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Header Manager</h1>
          <div className="flex gap-2">
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Reset to Default
            </button>
            <button
              onClick={saveAllSettings}
              disabled={saving}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>

        {/* Header Enable/Disable Toggle */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Header Status</h2>
              <p className="text-sm text-gray-500">Enable or disable the entire header</p>
            </div>
            <button
              onClick={() => {
                setIsHeaderEnabled(!isHeaderEnabled);
                updateHeaderSettings({ isEnabled: !isHeaderEnabled });
              }}
              className={`px-4 py-2 rounded font-medium ${
                isHeaderEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isHeaderEnabled ? '✓ Header Enabled' : '✗ Header Disabled'}
            </button>
          </div>
        </div>

        {/* Brand Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Brand Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo Alt Text</label>
              <input
                type="text"
                value={logoAltText}
                onChange={(e) => setLogoAltText(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo Link (URL)</label>
              <input
                type="text"
                value={logoLink}
                onChange={(e) => setLogoLink(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="/"
              />
              <p className="text-xs text-gray-500 mt-1">Where the logo should link to (e.g., /, /home)</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <div className="flex gap-3 items-start">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="/logog.png"
                />
                <div className="flex flex-col gap-2">
                  <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer text-center">
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadLogoFile(e.target.files[0])}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>
              </div>
              {logoUrl && (
                <div className="mt-3 p-3 bg-gray-50 rounded flex items-center gap-4">
                  <img 
                    src={logoUrl.startsWith('http') ? logoUrl : `${MEDIA_BASE_URL}${logoUrl}`} 
                    alt="Logo preview" 
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                      e.target.src = '/default-logo.png';
                    }}
                  />
                  <span className="text-xs text-gray-500 break-all">Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscribe Button Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Subscribe Button</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Button Text</label>
              <input
                type="text"
                value={subscribeBtnText}
                onChange={(e) => setSubscribeBtnText(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Link</label>
              <input
                type="text"
                value={subscribeBtnLink}
                onChange={(e) => setSubscribeBtnLink(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>
        </div>

        {/* Style Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Style Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                <input
                  type="checkbox"
                  checked={isSticky}
                  onChange={(e) => setIsSticky(e.target.checked)}
                  className="mr-2"
                />
                Sticky Header
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-10 w-12 border rounded"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="border rounded px-3 py-2 flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-12 border rounded"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="border rounded px-3 py-2 flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hover Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={hoverColor}
                  onChange={(e) => setHoverColor(e.target.value)}
                  className="h-10 w-12 border rounded"
                />
                <input
                  type="text"
                  value={hoverColor}
                  onChange={(e) => setHoverColor(e.target.value)}
                  className="border rounded px-3 py-2 flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Border Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="h-10 w-12 border rounded"
                />
                <input
                  type="text"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="border rounded px-3 py-2 flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Body Font</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="Jost, sans-serif">Jost</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Inter, sans-serif">Inter</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Montserrat, sans-serif">Montserrat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo Font</label>
              <select
                value={logoFontFamily}
                onChange={(e) => setLogoFontFamily(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="Playfair Display, serif">Playfair Display</option>
                <option value="Merriweather, serif">Merriweather</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Poppins, sans-serif">Poppins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Header Sections Layout (Drag-Drop) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Header Sections Layout</h2>
          <p className="text-sm text-gray-500 mb-4">Drag and drop sections to reorder. Toggle to enable/disable each section.</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEndSections}
          >
            <SortableContext
              items={sections.map(s => s.name)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableSection
                    key={section.name}
                    section={section}
                    onToggle={toggleSection}
                    isUpdating={updatingSection === section.name}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Navigation Menu Builder with Drag-Drop */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Navigation Menu</h2>
          <p className="text-sm text-gray-500 mb-4">Drag the ⋮⋮ handle to reorder menu items. Click Edit to modify label/URL.</p>
          
          {/* Add New Item Form */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-3">Add New Menu Item</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addNavItem({
                label: formData.get('label'),
                href: formData.get('href'),
                hasDropdown: formData.get('hasDropdown') === 'true'
              });
              e.target.reset();
            }} className="flex gap-3 flex-wrap">
              <input 
                name="label" 
                placeholder="Label (e.g., Home, News)" 
                className="border rounded px-3 py-2 flex-1 min-w-[150px]" 
                required 
              />
              <input 
                name="href" 
                placeholder="URL (e.g., /, /news)" 
                className="border rounded px-3 py-2 flex-1 min-w-[150px]" 
                required 
              />
              <select name="hasDropdown" className="border rounded px-3 py-2">
                <option value="false">No Dropdown</option>
                <option value="true">Has Dropdown</option>
              </select>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Add Item
              </button>
            </form>
          </div>

          {/* Menu Items List with Drag-Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEndNav}
          >
            <SortableContext
              items={navItems.map(item => item._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {navItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No menu items. Add your first item above.</p>
                ) : (
                  navItems.map((item, index) => (
                    <SortableNavItem
                      key={item._id}
                      item={item}
                      index={index}
                      onEdit={setEditingItem}
                      onDelete={deleteNavItem}
                      onToggleActive={updateNavItem}
                      editingItem={editingItem}
                      setEditingItem={setEditingItem}
                      updateNavItem={updateNavItem}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </MainLayout>
  );
}