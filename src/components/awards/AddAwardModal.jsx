import { useState, useEffect } from "react";
import { X } from 'lucide-react';
import awardAPI from "../../lib/awrdapi";

export default function AddAwardModal({ 
  isOpen, 
  onClose, 
  onAwardAdded, 
  onAwardUpdated, 
  editingAward
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fee: "",
    status: "active",
    displayOrder: ""
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingAward) {
      setFormData({
        name: editingAward.name || "",
        description: editingAward.description || "",
        fee: editingAward.fee || "",
        status: editingAward.status || "active",
        displayOrder: editingAward.displayOrder || ""
      });
    } else {
      setFormData({
        name: "",
        description: "",
        fee: "",
        status: "active",
        displayOrder: ""
      });
    }
    setErrors({});
  }, [editingAward, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Award name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.fee || formData.fee <= 0) newErrors.fee = "Valid fee amount is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    
    try {
      const awardData = {
        name: formData.name,
        description: formData.description,
        fee: parseFloat(formData.fee),
        status: formData.status,
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : null
      };

      if (editingAward) {
        await awardAPI.updateAward(editingAward._id, awardData);
        onAwardUpdated();
      } else {
        await awardAPI.createAward(awardData);
        onAwardAdded();
      }
    } catch (error) {
      console.error("Error saving award:", error);
      alert(error.message || "Failed to save award");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!editingAward;
  const modalTitle = isEditing ? "Edit Award Category" : "Add New Award Category";
  const submitButtonText = isEditing ? (submitting ? "Updating..." : "Update Award") : (submitting ? "Creating..." : "Create Award");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {isEditing && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Award ID:</span> #{editingAward.id}
              </p>
            </div>
          )}

          {/* Award Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Award Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Best Startup Award"
              className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this award recognizes..."
              rows="3"
              className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Fee and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomination Fee (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                placeholder="499.00"
                step="0.01"
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.fee ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fee && <p className="text-red-500 text-xs mt-1">{errors.fee}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="active">Active - Show on Frontend</option>
                <option value="inactive">Inactive - Hide from Frontend</option>
              </select>
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order (Optional)
            </label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              placeholder="1, 2, 3..."
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}