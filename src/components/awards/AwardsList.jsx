import { useState, useEffect } from "react";
import { Edit2, Trash2, Eye, Trophy } from 'lucide-react';
import awardAPI from "../../lib/awrdapi";

export default function AwardsList({ searchTerm = "", statusFilter = "all", onEditClick, refreshTrigger }) {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAwards();
  }, [searchTerm, statusFilter, currentPage, refreshTrigger]);

  const fetchAwards = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter })
      };
      
      const response = await awardAPI.getAwards(params);
      setAwards(response.data || response.awards || []);
      setTotalPages(response.totalPages || Math.ceil((response.total || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error fetching awards:", error);
      if (error.status === 401) {
        // Redirect to login or show message
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this award?")) {
      try {
        await awardAPI.deleteAward(id);
        fetchAwards(); // Refresh list
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

  const handleViewSubmissions = (id) => {
    // Navigate to nominations page with award filter
    console.log("View submissions for award:", id);
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">ID</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Award Name</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Description</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Fee</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Nominations</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Status</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {awards.map((award) => (
              <tr key={award.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 text-gray-600 text-sm">#{award.id}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{award.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-500 text-sm max-w-xs truncate">
                  {award.description}
                </td>
                <td className="p-4">
                  <span className="font-semibold text-gray-900">₹{Number(award.fee).toFixed(2)}</span>
                </td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {award.totalNominations || award._count?.nominations || 0} submissions
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
                      onClick={() => handleViewSubmissions(award.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="View Submissions"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(award.id)}
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

      {awards.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No awards found</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add New Award" to create one</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}