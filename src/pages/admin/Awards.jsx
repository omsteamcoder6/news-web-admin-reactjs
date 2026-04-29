import { MainLayout } from "../../layout/MainLayout";
import { useState, useEffect } from "react";
import { Trophy, Plus, Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Users, DollarSign } from 'lucide-react';
import awardAPI from "../../lib/awrdapi";

// Import components
import AwardsList from "../../components/awards/AwardsList";
import AddAwardModal from "../../components/awards/AddAwardModal";
import NominationDashboard from "../../components/awards/NominationDashboard";

export default function Awards() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("awards");
  const [stats, setStats] = useState({ totalAwards: 0, activeAwards: 0, totalNominations: 0, totalRevenue: 0 });

  // Fetch stats for dashboard
  useEffect(() => {
    if (activeTab === "awards") {
      fetchStats();
    }
  }, [refreshKey, activeTab]);

  const fetchStats = async () => {
    try {
      const response = await awardAPI.getAwardStats();
      setStats({
        totalAwards: response.totalAwards || 0,
        activeAwards: response.activeAwards || 0,
        totalNominations: response.totalNominations || 0,
        totalRevenue: response.totalRevenue || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleAwardAdded = () => {
    setRefreshKey(prev => prev + 1);
    setIsModalOpen(false);
    setEditingAward(null);
  };

  const handleAwardUpdated = () => {
    setRefreshKey(prev => prev + 1);
    setIsModalOpen(false);
    setEditingAward(null);
  };

  const handleEditClick = (award) => {
    setEditingAward(award);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAward(null);
  };

  const handleAddNewClick = () => {
    setEditingAward(null);
    setIsModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Awards Management</h1>
          </div>
          <p className="text-gray-600 mt-1">Manage award categories, view nominations, and track payments</p>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("awards")}
              className={`pb-3 px-2 font-medium transition ${
                activeTab === "awards"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Awards Categories
            </button>
            <button
              onClick={() => setActiveTab("nominations")}
              className={`pb-3 px-2 font-medium transition ${
                activeTab === "nominations"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Nominations & Payments
            </button>
          </div>
        </div>

        {/* Awards Tab Content */}
        {activeTab === "awards" && (
          <>
            {/* Stats Cards - Now with real data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Awards</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAwards}</p>
                  </div>
                  <Trophy className="w-10 h-10 text-gray-300" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Active Awards</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeAwards}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Nominations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalNominations}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Revenue Generated</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search awards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <button
                onClick={handleAddNewClick}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Award
              </button>
            </div>

            {/* Awards List Component */}
            <AwardsList 
              key={refreshKey}
              refreshTrigger={refreshKey}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onEditClick={handleEditClick}
            />
          </>
        )}

        {/* Nominations Tab Content */}
        {activeTab === "nominations" && (
          <NominationDashboard />
        )}

        {/* Add/Edit Award Modal */}
        <AddAwardModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAwardAdded={handleAwardAdded}
          onAwardUpdated={handleAwardUpdated}
          editingAward={editingAward}
        />
      </div>
    </MainLayout>
  );
}