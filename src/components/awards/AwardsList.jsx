import { useState, useEffect } from "react";
import { Edit2, Trash2, Eye, Trophy, Image as ImageIcon, Search } from 'lucide-react';
import awardAPI from "../../lib/awrdapi";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export default function AwardsList({ searchTerm = "", statusFilter = "all", onEditClick, onSEOEditClick, refreshTrigger }) {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredAwards, setFilteredAwards] = useState([]);

  // Fetch all awards without pagination
  useEffect(() => {
    fetchAllAwards();
  }, [refreshTrigger]);

  // Apply filters whenever searchTerm, statusFilter, or awards change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, awards]);

  const fetchAllAwards = async () => {
    setLoading(true);
    try {
      // Fetch ALL awards without pagination limits
      const response = await awardAPI.getAwards({ limit: 1000 }); // Get up to 1000 awards
      
      console.log("Full API Response:", response);
      console.log("Awards data:", response.data);
      
      // Handle different possible response structures
      let awardsData = [];
      if (Array.isArray(response)) {
        awardsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        awardsData = response.data;
      } else if (response.awards && Array.isArray(response.awards)) {
        awardsData = response.awards;
      } else if (response.results && Array.isArray(response.results)) {
        awardsData = response.results;
      } else {
        awardsData = [];
      }
      
      setAwards(awardsData);
      console.log(`Total awards loaded: ${awardsData.length}`);
    } catch (error) {
      console.error("Error fetching awards:", error);
      setAwards([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...awards];
    
    // Apply search filter
    if (searchTerm && searchTerm.trim() !== "") {
      filtered = filtered.filter(award => 
        award.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        award.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(award => award.status === statusFilter);
    }
    
    setFilteredAwards(filtered);
    console.log(`Filtered awards: ${filtered.length} out of ${awards.length}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this award?")) {
      try {
        await awardAPI.deleteAward(id);
        // Refresh the list after deletion
        fetchAllAwards();
      } catch (error) {
        console.error("Error deleting award:", error);
        alert(error.message || "Failed to delete award");
      }
    }
  };

  const handleEdit = (award) => {
    if (onEditClick) {
      onEditClick(award);
    }
  };

  const handleSEOEdit = (award) => {
    if (onSEOEditClick) {
      onSEOEditClick(award);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-gray-500 mt-3">Loading awards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Optional: Show total count */}
      <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredAwards.length} of {awards.length} awards
        </div>
        {searchTerm && (
          <div className="text-sm text-blue-600">
            Search: "{searchTerm}"
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Cover</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Award Name</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Description</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Fee</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Nominations</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Status</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAwards.map((award) => (
              <tr key={award._id || award.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">
                  {award.coverImage ? (
                    <img 
                      src={award.coverImage.startsWith('http') ? award.coverImage : `${SERVER_BASE_URL}${award.coverImage}`} 
                      alt={award.name}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.parentElement.innerHTML = '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{award.name || 'Unnamed Award'}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-500 text-sm max-w-xs truncate">
                  {award.description || 'No description'}
                </td>
                <td className="p-4">
                  <span className="font-semibold text-gray-900">
                    ₹{award.fee ? Number(award.fee).toFixed(2) : '0.00'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {award.totalNominations || award.nominations || 0} submissions
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    award.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {award.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(award)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Award"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSEOEdit(award)}
                      className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="Edit SEO Settings"
                    >
                      🔍
                    </button>
                    <button
                      onClick={() => handleDelete(award._id || award.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Award"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAwards.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {awards.length === 0 ? 'No awards found' : 'No matching awards found'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {awards.length === 0 ? 'Click "Add New Award" to create one' : 'Try adjusting your search or filters'}
          </p>
        </div>
      )}
    </div>
  );
}