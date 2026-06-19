// src/components/awards/CountingStatsManager.jsx

import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Trophy, 
  Calendar, 
  Award, 
  Users,
  Search,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Icon mapping for display
const iconMap = {
  Calendar: Calendar,
  Award: Award,
  Trophy: Trophy,
  Users: Users,
  Star: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Heart: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  BookOpen: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Briefcase: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Globe: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CheckCircle: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Zap: (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
};

// Available icons data
const AVAILABLE_ICONS = [
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Award', label: 'Award' },
  { value: 'Trophy', label: 'Trophy' },
  { value: 'Users', label: 'Users' },
  { value: 'Star', label: 'Star' },
  { value: 'Heart', label: 'Heart' },
  { value: 'BookOpen', label: 'Book Open' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Clock', label: 'Clock' },
  { value: 'CheckCircle', label: 'Check Circle' },
  { value: 'Zap', label: 'Zap' }
];

// Available color themes
const AVAILABLE_COLORS = [
  { id: 'rose', label: 'Rose', iconBg: 'bg-rose-50', iconColor: 'text-rose-500', lineColor: 'bg-rose-400' },
  { id: 'purple', label: 'Purple', iconBg: 'bg-purple-50', iconColor: 'text-purple-500', lineColor: 'bg-purple-400' },
  { id: 'amber', label: 'Amber', iconBg: 'bg-amber-50', iconColor: 'text-amber-500', lineColor: 'bg-amber-400' },
  { id: 'blue', label: 'Blue', iconBg: 'bg-blue-50', iconColor: 'text-blue-500', lineColor: 'bg-blue-400' },
  { id: 'green', label: 'Green', iconBg: 'bg-green-50', iconColor: 'text-green-500', lineColor: 'bg-green-400' },
  { id: 'teal', label: 'Teal', iconBg: 'bg-teal-50', iconColor: 'text-teal-500', lineColor: 'bg-teal-400' },
  { id: 'indigo', label: 'Indigo', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500', lineColor: 'bg-indigo-400' },
  { id: 'pink', label: 'Pink', iconBg: 'bg-pink-50', iconColor: 'text-pink-500', lineColor: 'bg-pink-400' }
];

export default function CountingStatsManager() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("order");
  const [sortDirection, setSortDirection] = useState("asc");
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get auth token from store
  const { getToken } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState({
    value: "",
    suffix: "+",
    label: "",
    icon: "Calendar",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    lineColor: "bg-rose-400",
    order: 0,
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Fetch stats from API - FIXED: Remove /api from the path since API_BASE_URL already includes it
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIX: Use just /counting-stats instead of /api/counting-stats
      const response = await fetch(`${API_BASE_URL}/counting-stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError(err.message);
      // Fallback to empty array
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAddNew = () => {
    setEditingStat(null);
    setFormData({
      value: "",
      suffix: "+",
      label: "",
      icon: "Calendar",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      lineColor: "bg-rose-400",
      order: stats.length,
      isActive: true
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEdit = (stat) => {
    setEditingStat(stat);
    setFormData({
      value: stat.value || "",
      suffix: stat.suffix || "+",
      label: stat.label || "",
      icon: stat.icon || "Calendar",
      iconBg: stat.iconBg || "bg-rose-50",
      iconColor: stat.iconColor || "text-rose-500",
      lineColor: stat.lineColor || "bg-rose-400",
      order: stat.order || 0,
      isActive: stat.isActive !== undefined ? stat.isActive : true
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this statistic?")) return;
    
    try {
      // ✅ FIX: Use just /counting-stats instead of /api/counting-stats
      const response = await fetch(`${API_BASE_URL}/counting-stats/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete statistic');
      }

      // Remove from local state
      setStats(prevStats => prevStats.filter(stat => stat._id !== id));
      setSuccessMessage("Statistic deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggle = async (id) => {
    try {
      // ✅ FIX: Use just /counting-stats instead of /api/counting-stats
      const response = await fetch(`${API_BASE_URL}/counting-stats/${id}/toggle`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to toggle statistic');
      }

      const data = await response.json();
      if (data.success) {
        // Update local state
        setStats(prevStats => 
          prevStats.map(stat => 
            stat._id === id 
              ? { ...stat, isActive: data.data.isActive }
              : stat
          )
        );
        setSuccessMessage(`Statistic ${data.data.isActive ? 'activated' : 'deactivated'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.value.trim()) errors.value = "Value is required";
    if (!formData.label.trim()) errors.label = "Label is required";
    if (!formData.icon) errors.icon = "Icon is required";
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const submitData = {
      ...formData,
      order: parseInt(formData.order) || 0,
      isActive: formData.isActive
    };

    try {
      let response;
      let url;
      let method;

      if (editingStat) {
        // Update existing stat - ✅ FIX: Use just /counting-stats
        url = `${API_BASE_URL}/counting-stats/${editingStat._id}`;
        method = 'PUT';
      } else {
        // Create new stat - ✅ FIX: Use just /counting-stats
        url = `${API_BASE_URL}/counting-stats`;
        method = 'POST';
      }

      response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingStat ? 'update' : 'create'} statistic`);
      }

      if (data.success) {
        // Refresh stats from API to get latest data
        await fetchStats();
        setSuccessMessage(`Statistic ${editingStat ? 'updated' : 'created'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowAddModal(false);
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIconComponent = (iconName) => {
    return iconMap[iconName] || Trophy;
  };

  // Filter and sort stats
  const filteredStats = stats.filter(stat => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      stat.label?.toLowerCase().includes(searchLower) ||
      stat.value?.toLowerCase().includes(searchLower)
    );
  });

  const sortedStats = [...filteredStats].sort((a, b) => {
    let aVal = a[sortField] || "";
    let bVal = b[sortField] || "";
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Stats for the default three fields
  const defaultStats = {
    events: stats.find(s => s.label === "EVENTS CONDUCTED") || { value: "0", suffix: "+" },
    certificates: stats.find(s => s.label === "CERTIFICATES ISSUED") || { value: "0", suffix: "+" },
    awardees: stats.find(s => s.label === "AWARDEES HONORED") || { value: "0", suffix: "+" }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-lg">
              <Calendar className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">EVENTS CONDUCTED</p>
              <p className="text-2xl font-bold text-gray-900">
                {defaultStats.events.value}
                <span className="text-lg font-semibold text-rose-500 ml-1">
                  {defaultStats.events.suffix}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">CERTIFICATES ISSUED</p>
              <p className="text-2xl font-bold text-gray-900">
                {defaultStats.certificates.value}
                <span className="text-lg font-semibold text-purple-500 ml-1">
                  {defaultStats.certificates.suffix}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">AWARDEES HONORED</p>
              <p className="text-2xl font-bold text-gray-900">
                {defaultStats.awardees.value}
                <span className="text-lg font-semibold text-amber-500 ml-1">
                  {defaultStats.awardees.suffix}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search statistics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={fetchStats}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Statistic
          </button>
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-gray-500 mt-3">Loading statistics...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchStats}
              className="mt-3 text-red-600 hover:text-red-700 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : sortedStats.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowUpDown className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No statistics found</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add New Statistic" to create one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">
                    <button
                      onClick={() => handleSort("order")}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      Order
                      {sortField === "order" && (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Icon</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">
                    <button
                      onClick={() => handleSort("label")}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      Label
                      {sortField === "label" && (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">
                    <button
                      onClick={() => handleSort("value")}
                      className="flex items-center gap-1 hover:text-red-600"
                    >
                      Value
                      {sortField === "value" && (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Suffix</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Colors</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStats.map((stat) => {
                  const IconComponent = getIconComponent(stat.icon);
                  return (
                    <tr key={stat._id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 text-sm text-gray-600">{stat.order || 0}</td>
                      <td className="p-4">
                        <div className={`p-2 rounded-lg ${stat.iconBg} ${stat.iconColor} w-fit`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-900">{stat.label}</td>
                      <td className="p-4 text-gray-700">{stat.value}</td>
                      <td className="p-4 text-gray-500">{stat.suffix}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded ${stat.iconBg} border`}></span>
                          <span className={`w-4 h-4 rounded ${stat.lineColor}`}></span>
                          <span className="w-4 h-4 rounded border" style={{ backgroundColor: stat.iconColor.replace('text-', '') || '#ccc' }}></span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          stat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {stat.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggle(stat._id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                            title={stat.isActive ? "Deactivate" : "Activate"}
                          >
                            {stat.isActive ? <Eye className="w-4 h-4 text-gray-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                          </button>
                          <button
                            onClick={() => handleEdit(stat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(stat._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {editingStat ? "Edit Statistic" : "Add New Statistic"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., 30"
                  className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    formErrors.value ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.value && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.value}</p>
                )}
              </div>

              {/* Suffix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suffix
                </label>
                <input
                  type="text"
                  value={formData.suffix}
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  placeholder="e.g., +, K+, M+"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-400 mt-1">Optional suffix like +, K+, M+</p>
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., EVENTS CONDUCTED"
                  className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    formErrors.label ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.label && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.label}</p>
                )}
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    formErrors.icon ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
                {formErrors.icon && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.icon}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Preview:</span>
                  <div className={`p-2 rounded-lg ${formData.iconBg} ${formData.iconColor}`}>
                    {(() => {
                      const IconComponent = getIconComponent(formData.icon);
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                  </div>
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Theme
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {AVAILABLE_COLORS.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          iconBg: theme.iconBg,
                          iconColor: theme.iconColor,
                          lineColor: theme.lineColor
                        });
                      }}
                      className={`p-3 rounded-lg border-2 transition text-left ${
                        formData.iconBg === theme.iconBg &&
                        formData.iconColor === theme.iconColor &&
                        formData.lineColor === theme.lineColor
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${theme.iconBg} ${theme.iconColor}`}>
                          {(() => {
                            const IconComponent = getIconComponent(formData.icon || 'Trophy');
                            return <IconComponent className="w-3 h-3" />;
                          })()}
                        </div>
                        <div>
                          <span className={`w-3 h-3 rounded-full ${theme.lineColor}`}></span>
                        </div>
                        <span className="text-xs text-gray-500">{theme.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0, 1, 2..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (visible on frontend)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      {editingStat ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    editingStat ? "Update" : "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}