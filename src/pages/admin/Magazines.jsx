// frontend/src/pages/Magazines.jsx
import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "../../layout/MainLayout";
import { Button } from "../../components/ui/Button";
import { Plus, WifiOff, Cloud, RefreshCw } from "lucide-react";
import { MagazineCard } from "../../components/magazines/MagazineCard";
import { MagazineForm } from "../../components/magazines/MagazineForm";
import { OfflineMagazineReader } from "../../components/magazines/OfflineMagazineReader";
import { MagazineService } from "../../lib/magazineService";
import magazineAPI from "../../lib/magapi";
import { toast, Toaster } from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

export default function Magazines() {
  const [magazines, setMagazines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMagazine, setEditingMagazine] = useState(null);
  const [readingMagazine, setReadingMagazine] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineMagazines, setOfflineMagazines] = useState([]);
  
  const { isAuthenticated, user } = useAuthStore();

  // Debug on mount
  useEffect(() => {
    magazineAPI.debugAuth();
  }, []);

  // Online/offline handlers
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Back online!");
      fetchMagazines();
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast("You are offline. Only downloaded magazines are available.", { icon: "📶" });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load magazines when component mounts or user changes
  useEffect(() => {
    fetchMagazines();
    loadOfflineMagazines();
  }, [user]);

  // Debug magazine list
  useEffect(() => {
    if (magazines.length > 0) {
      console.log(`📚 Showing ${magazines.length} magazines (${magazines.filter(m => m.accessType === 'free').length} free, ${magazines.filter(m => m.accessType === 'premium').length} premium)`);
    }
  }, [magazines]);

  // FIXED: Fetch ALL magazines
  const fetchMagazines = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if user is admin or editor - they should see ALL magazines
      const isAdminOrEditor = user?.role === 'admin' || user?.role === 'editor';
      
      console.log(`👤 Fetching as: ${user?.role || 'guest'}, Show all: ${isAdminOrEditor}`);
      
      const response = await magazineAPI.getMagazines({ 
        limit: 100, 
        page: 1,
        showAll: isAdminOrEditor // This is the key fix!
      });
      
      let list = [];
      if (response?.data && Array.isArray(response.data)) {
        list = response.data;
      } else if (Array.isArray(response)) {
        list = response;
      } else if (response?.magazines && Array.isArray(response.magazines)) {
        list = response.magazines;
      }
      
      console.log(`✅ Loaded ${list.length} magazines`);
      setMagazines(list);
    } catch (err) {
      console.error("fetchMagazines error:", err);
      toast.error("Failed to load magazines");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadOfflineMagazines = async () => {
    const offline = await MagazineService.getAllOfflineMagazines();
    setOfflineMagazines(offline);
  };

  // FIXED: Handle upload - preserves existing magazines
  const handleUpload = async (formData) => {
    if (!isAuthenticated) {
      toast.error("Please log in to upload magazines");
      return;
    }
    
    if (user?.role !== 'admin' && user?.role !== 'editor') {
      toast.error("You don't have permission to upload magazines");
      return;
    }
    
    const loadingToast = toast.loading("Uploading magazine...");
    
    try {
      const response = await magazineAPI.createMagazine(formData);
      const created = response?.data ?? response;

      console.log('📤 New magazine:', created.title);

      // Add new magazine to existing list - KEEP ALL old ones
      setMagazines(prev => {
        const exists = prev.some(m => (m.id || m._id) === (created.id || created._id));
        if (exists) return prev;
        return [created, ...prev];
      });

      if (formData.pdfFile && formData.accessType === "free") {
        await MagazineService.storeMagazineForOffline(created.id || created._id, formData.pdfFile);
        await loadOfflineMagazines();
      }

      toast.dismiss(loadingToast);
      toast.success(`✅ "${created.title}" uploaded!`);
      setIsFormOpen(false);
      
      // Refresh to ensure sync
      setTimeout(() => fetchMagazines(), 500);
      
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload magazine");
    }
  };

  const handleUpdate = async (formData) => {
    const loadingToast = toast.loading("Updating magazine...");
    
    try {
      const response = await magazineAPI.updateMagazine(editingMagazine.id || editingMagazine._id, formData);
      const updated = response?.data ?? response;

      setMagazines(prev =>
        prev.map(m => ((m.id || m._id) === (editingMagazine.id || editingMagazine._id) ? updated : m))
      );

      if (formData.pdfFile) {
        await MagazineService.storeMagazineForOffline(editingMagazine.id || editingMagazine._id, formData.pdfFile);
        await loadOfflineMagazines();
      }

      toast.dismiss(loadingToast);
      setEditingMagazine(null);
      setIsFormOpen(false);
      toast.success(`✅ "${updated.title}" updated!`);
      
      setTimeout(() => fetchMagazines(), 500);
      
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update magazine");
    }
  };

  const handleEdit = (magazine) => {
    setEditingMagazine(magazine);
    setIsFormOpen(true);
  };

  // ADDED: Delete handler function
  const handleDelete = async (magazine) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(`Are you sure you want to delete "${magazine.title}"? This action cannot be undone.`);
    
    if (!confirmDelete) return;
    
    const loadingToast = toast.loading("Deleting magazine...");
    
    try {
      // Call API to delete from backend
      await magazineAPI.deleteMagazine(magazine.id || magazine._id);
      
      // Remove from local state
      setMagazines(prev => prev.filter(m => (m.id || m._id) !== (magazine.id || magazine._id)));
      
      // Also remove from offline storage if exists
      if (MagazineService.deleteOfflineMagazine) {
        await MagazineService.deleteOfflineMagazine(magazine.id || magazine._id);
      }
      await loadOfflineMagazines();
      
      toast.dismiss(loadingToast);
      toast.success(`✅ "${magazine.title}" deleted successfully!`);
      
      // Refresh to ensure sync with backend
      setTimeout(() => fetchMagazines(), 500);
      
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete magazine");
    }
  };

  const handleDownload = async (magazine) => {
    try {
      const choice = await showDownloadDialog(magazine);
      if (!choice) return;

      if (choice === "read") {
        setReadingMagazine(magazine);
        return;
      }

      const pdfBlob = await fetchMagazinePDF(magazine);

      if (choice === "download") {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${magazine.slug ?? `magazine-${magazine.id || magazine._id}`}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`Downloading ${magazine.title}…`);
      } else if (choice === "offline") {
        await MagazineService.storeMagazineForOffline(magazine.id || magazine._id, pdfBlob);
        await loadOfflineMagazines();
        toast.success(`${magazine.title} saved for offline!`);
      }
    } catch (err) {
      console.error("handleDownload error:", err);
      toast.error("Failed to download magazine");
    }
  };

  const fetchMagazinePDF = async (magazine) => {
    if (magazine.pdfFile instanceof File) return magazine.pdfFile;
    return magazineAPI.downloadMagazine(magazine.id || magazine._id);
  };

  const showDownloadDialog = (magazine) =>
    new Promise((resolve) => {
      const alreadyOffline = offlineMagazines.some((m) => m.id === (magazine.id || magazine._id));

      const modal = document.createElement("div");
      modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl">
          <h3 class="text-xl font-bold mb-2">${magazine.title}</h3>
          <p class="text-slate-600 mb-4">How would you like to access this magazine?</p>
          <div class="space-y-2">
            <button data-action="read" class="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-left px-4">
              📖 Read Online
            </button>
            <button data-action="download" class="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-left px-4">
              💾 Download PDF
            </button>
            ${
              !alreadyOffline
                ? `<button data-action="offline" class="w-full p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-left px-4">
                    📱 Save for Offline
                  </button>`
                : ''
            }
            <button data-action="cancel" class="w-full p-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-left px-4">
              Cancel
            </button>
          </div>
        </div>`;

      document.body.appendChild(modal);

      modal.addEventListener("click", (e) => {
        const action = e.target.closest("[data-action]")?.dataset.action;
        if (!action) return;
        modal.remove();
        resolve(action === "cancel" ? null : action);
      });
    });

  const handleFormSubmit = (data) => {
    if (editingMagazine) handleUpdate(data);
    else handleUpload(data);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMagazine(null);
  };

  const canUpload = isAuthenticated && (user?.role === 'admin' || user?.role === 'editor');

  return (
    <MainLayout>
      <Toaster position="top-right" />

      {isOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-amber-700">You are offline. Only saved magazines are available.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Magazine &amp; E-Paper</h1>
            <p className="text-slate-600 mt-1">
              {canUpload 
                ? "✨ Admin/Editor View - Showing ALL magazines" 
                : "📖 Viewing available magazines"}
            </p>
            {magazines.length > 0 && (
              <p className="text-sm text-green-600 mt-1 font-semibold">
                ✓ {magazines.length} magazines loaded (Old + New)
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={fetchMagazines} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button variant="outline" className="gap-2" onClick={() => {
              toast.success(`${offlineMagazines.length} magazine(s) available offline`);
            }}>
              <Cloud className="w-4 h-4" />
              Offline ({offlineMagazines.length})
            </Button>

            {canUpload && (
              <Button className="bg-orange-500 hover:bg-orange-600 gap-2" onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4" />
                Upload Magazine
              </Button>
            )}
          </div>
        </div>

        {/* Magazine Grid - ALL magazines show here */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : magazines.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {magazines.map((mag) => (
                <MagazineCard
                  key={mag.id || mag._id} 
                  magazine={mag}
                  onDownload={handleDownload}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isOfflineAvailable={offlineMagazines.some((m) => m.id === (mag.id || mag._id))}
                  isOffline={isOffline}
                  canEdit={canUpload}
                />
              ))}
            </div>
            
            {/* Stats Footer */}
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">
                📊 Total: <span className="font-bold">{magazines.length}</span> | 
                🆓 Free: <span className="font-bold">{magazines.filter(m => m.accessType === 'free').length}</span> | 
                👑 Premium: <span className="font-bold">{magazines.filter(m => m.accessType === 'premium').length}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✅ All magazines are visible - nothing is hidden
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No magazines yet</h3>
            <p className="text-slate-600 mb-4">Upload your first magazine to get started</p>
            {canUpload && (
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Magazine
              </Button>
            )}
          </div>
        )}

        <MagazineForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          initialData={editingMagazine}
        />

        {readingMagazine && (
          <OfflineMagazineReader magazine={readingMagazine} onClose={() => setReadingMagazine(null)} />
        )}
      </div>
    </MainLayout>
  );
}