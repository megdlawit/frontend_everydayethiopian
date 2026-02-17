import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineSearch, AiOutlineDelete } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import axios from "axios";
import { server } from "../../server";
import { getAllUsers } from "../../redux/actions/user";
import Loader from "../Layout/Loader";
import Pagination from "../Pagination";
import DeleteModal from "../DeleteModal";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const showToast = (type, title, message) => {
    toast(
      <Toast
        type={type}
        title={title}
        message={message}
        onClose={() => toast.dismiss()}
      />,
      {
        icon: false, // disable react-toastify default icon
        closeButton: false,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }
    );
  };

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${server}/user/delete-user/${id}`, { withCredentials: true });
      showToast("success", "User Deleted", "User deleted successfully!");
      dispatch(getAllUsers());
    } catch (error) {
      showToast("error", "Delete Error", error.response?.data?.message || "Failed to delete user.");
    }
    setOpen(false);
  };

  // Ensure filteredUsers is always an array
  const filteredUsers = Array.isArray(users)
    ? users.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.name?.toLowerCase().includes(searchLower) ||
          item._id?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Name or ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 pr-10 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <AiOutlineSearch
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                </div>
              </div>
            </div>

            {filteredUsers.length === 0 && searchTerm ? (
              <div className="text-center py-4 text-gray-500">
                No users found matching your search.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="text-gray-500 text-sm">
                        <th className="py-2 px-2 text-left font-medium w-[40px]">
                          User ID
                        </th>
                        <th className="py-2 px-4 text-left font-medium">Name</th>
                        <th className="py-2 px-4 text-left font-medium">Email</th>
                        <th className="py-2 px-4 text-left font-medium">Role</th>
                        <th className="py-2 px-4 text-left font-medium">Joined At</th>
                        <th className="py-2 px-4 text-left font-medium w-[40px]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentUsers.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td
                            className="py-3 px-2 text-gray-700 w-[40px] max-w-[100px] truncate"
                            title={item._id}
                          >
                            {item._id}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {item.name || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {item.email || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {item.role || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {item.createdAt?.slice(0, 10) || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setUserId(item._id);
                                  setOpen(true);
                                }}
                              >
                                <AiOutlineDelete
                                  size={20}
                                  className="text-gray-600 hover:text-red-500 cursor-pointer"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>

          {/* ✅ Delete Modal */}
          <DeleteModal
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={() => handleDelete(userId)}
            title="Delete user?"
            description="This action cannot be undone. Are you sure you want to delete this user?"
          />
        </div>
      )}

      {/* Toastify container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          top: "80px", // give some space from top like in your image
        }}
      />
    </>
  );
};

export default AllUsers;