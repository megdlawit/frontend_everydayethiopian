import React from "react";

const DeleteModal = ({ open, onClose, onConfirm, title, description }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {title || "Delete item?"}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">
          {description || "This action cannot be undone. Are you sure you want to delete this item?"}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
