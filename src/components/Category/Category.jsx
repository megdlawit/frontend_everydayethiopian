import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineSearch, AiOutlineDelete, AiOutlineClose, AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { createTheme, ThemeProvider } from "@material-ui/core";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Toast from "../../components/Toast"; // Adjust path as needed
import { createCategory, getAllCategories, deleteCategory } from "../../redux/actions/category";
import Loader from "../Layout/Loader";
import Pagination from "../Pagination";
import peacImg from "../../Assests/images/peac.png"; // Adjust path as needed

const Category = () => {
  const dispatch = useDispatch();
  const { categories, isLoading, error } = useSelector((state) => state.category);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [image, setImage] = useState(null);
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const itemsPerPage = 5;

  const theme = createTheme({
    palette: {
      primary: {
        main: "#797a7a",
      },
    },
  });

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
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast("error", "Error", error);
    }
  }, [error]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      showToast("error", "Validation Error", "Please fill the required title field.");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("subTitle", subTitle);
    if (image) {
      formData.append("image", image);
    }
    try {
      await dispatch(createCategory(formData));
      showToast("success", "Category Created", "Category created successfully!");
      setOpen(false);
      resetForm();
      dispatch(getAllCategories());
    } catch (error) {
      showToast("error", "Creation Error", "Failed to create category.");
    }
  };

const confirmDelete = (id) => {
  setCategoryToDelete(id);
  setShowDeleteConfirm(true);
};

const handleDelete = async () => {
  if (categoryToDelete) {
    try {
      await dispatch(deleteCategory(categoryToDelete));
      showToast("success", "Category Deleted", "Category deleted successfully!");
      dispatch(getAllCategories());
    } catch (error) {
      showToast("error", "Deletion Error", "Failed to delete category.");
    } finally {
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    }
  }
};

  const resetForm = () => {
    setTitle("");
    setSubTitle("");
    setImage(null);
    setStep(1);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const filteredCategories = categories?.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) || 
      item._id.toLowerCase().includes(searchLower);
    const matchesFilter = !isFiltered || item.subTitle;
    return matchesSearch && matchesFilter;
  }) || [];

  const indexOfLastCategory = currentPage * itemsPerPage;
  const indexOfFirstCategory = indexOfLastCategory - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  const handleFilterToggle = () => {
    setIsFiltered(!isFiltered);
    setCurrentPage(1);
  };



  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Categories</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Title or ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 pr-10 border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                </div>
                {/* <button
                  onClick={handleFilterToggle}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                  </svg>
                  Filter
                </button> */}
                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-[#FFC300] rounded-lg text-[#FFC300] bg-transparent hover:bg-gray-50 text-sm font-medium"
                >
                  Create Category
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <ThemeProvider theme={theme}>
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="text-gray-500 text-sm">
                      <th className="py-2 px-2 text-left font-medium w-[40px]">Category ID</th>
                      <th className="py-2 px-4 text-left font-medium">Title</th>
                      <th className="py-2 px-4 text-left font-medium">Sub Title</th>
                      <th className="py-2 px-4 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentCategories.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-2 text-gray-700 w-[40px] max-w-[100px] truncate" title={item._id}>
                          {item._id}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{item.title}</td>
                        <td className="py-3 px-4 text-gray-700">{item.subTitle || "N/A"}</td>
                        <td className="py-2 px-4 text-left">
                        <button onClick={() => confirmDelete(item._id)}>
           <AiOutlineDelete size={20} className="text-gray-600 hover:text-red-500 cursor-pointer" />
                  </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ThemeProvider>
            </div>
            <div className="flex justify-end mt-4">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredCategories.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>

          {/* Create Category Modal */}
          {open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen w-screen">
              <div className="bg-white w-full h-[98vh] mt-2 overflow-y-auto relative rounded-2xl shadow-2xl">
                <button
                  className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-[#FFF5CC] transition"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  <AiOutlineClose />
                </button>
                <div className="text-center my-4">
                  <img src={peacImg} alt_domain="Peac Logo" className="w-20 h-20 mx-auto mb-2 animate-bounce" />
                  <div className="w-1/2 mx-auto bg-gray-100 rounded-full h-2.5">
                    <div className="bg-[#FFC300] h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
                  </div>
                  <p className="text-gray-500 text-sm">Step {step} of 3</p>
                </div>
                {step === 1 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-10">
                    <h6 className="text-4xl text-center font-['Quesha'] text-gray-800 mb-6">What's the title of your category?</h6>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-4 block w-1/2 px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                      placeholder="Enter category title..."
                      required
                    />
                    <div className="mt-4 flex justify-end w-1/2">
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-10">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800 mb-6">Set sub-title (optional)</h6>
                    <input
                      type="text"
                      value={subTitle}
                      onChange={(e) => setSubTitle(e.target.value)}
                      className="mt-4 block w-1/2 px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                      placeholder="Enter sub-title..."
                    />
                    <div className="mt-4 flex justify-between w-1/2">
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={prevStep}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-4 py-2 bg-[#FFC300] text-white rounded-full flex items-center hover:bg-[#FFD700] transition"
                        onClick={nextStep}
                      >
                        <AiOutlineArrowRight className="mr-2" /> Next
                      </button>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="flex flex-col items-center justify-center h-[calc(85vh-250px)] mt-10">
                    <h6 className="text-4xl font-['Quesha'] text-gray-800 mb-6">Upload image and review</h6>
                    <div className="mt-4 w-1/2">
                      <label className="block text-gray-600 mb-2">Image (optional)</label>
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="mt-1 block w-full px-6 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE180] text-left"
                      />
                    </div>
                    <div className="mt-4 w-1/2">
                      <h6 className="text-xl font-semibold text-gray-800 mb-2">Review Category Details</h6>
                      <div className="bg-[#faf9f6] p-4 rounded-lg">
                        <p><strong>Title:</strong> {title || "N/A"}</p>
                        <p><strong>Sub Title:</strong> {subTitle || "N/A"}</p>
                        <p><strong>Image:</strong> {image ? image.name : "N/A"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between w-1/2">
                      <button
                        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                        onClick={prevStep}
                      >
                        <AiOutlineArrowLeft size={20} />
                      </button>
                      <button
                        className="px-6 py-2 bg-[#FFC300] text-white rounded-full text-sm font-semibold hover:bg-[#FFD700]"
                        onClick={handleSubmit}
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {showDeleteConfirm && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete category?</h2>
      <p className="text-sm text-gray-600 mb-6">
        This action cannot be undone. Are you sure you want to delete this category?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDeleteConfirm(false)}
          className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
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

export default Category;