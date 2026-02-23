import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../../utils/api";
import { server, backend_url } from "../../server";
import DashboardHeader from "../../components/Delivery/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Delivery/Layout/DashboardSideBar";
import { toast } from "react-toastify";
import { loadDeliveryUser } from "../../redux/actions/delivery";
import { AiOutlineCamera, AiOutlineClose } from "react-icons/ai";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    coverageArea: "",
    chargePerKm: "",
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const { data } = await api.get(`${server}/delivery/dashboard`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setFormData({
          fullName: data.delivery.fullName || "",
          email: data.delivery.email || "",
          password: "",
          confirmPassword: "",
          phoneNumber: data.delivery.phoneNumber || "",
          coverageArea: data.delivery.coverageArea?.join(", ") || "",
          chargePerKm: data.delivery.chargePerKm || "",
        });
        const avatarUrlFromApi = data.delivery.avatar?.url;
        const normalized = (avatarUrlFromApi || "").replace(/\\/g, "/").replace(/\/Uploads\//, "/uploads/");
        const avatarPath = avatarUrlFromApi
          ? avatarUrlFromApi.startsWith("http")
            ? avatarUrlFromApi
            : `${backend_url}${normalized}`
          : `${backend_url}/uploads/avatar/default_avatar.png`;
        setAvatarUrl(avatarPath);
      } catch (err) {
        toast.error("Failed to load profile");
        navigate("/delivery/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.put(`${server}/delivery/avatar`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      toast.success("Avatar updated successfully!");
      // Use the returned avatar object
      const avatarUrlFromApi = data.avatar?.url;
      const normalized = (avatarUrlFromApi || "").replace(/\\/g, "/").replace(/\/Uploads\//, "/uploads/");
      const avatarPath = avatarUrlFromApi
        ? avatarUrlFromApi.startsWith("http")
          ? avatarUrlFromApi
          : `${backend_url}${normalized}`
        : `${backend_url}/uploads/avatar/default_avatar.png`;
      setAvatarUrl(avatarPath);
    } catch (err) {
      toast.error("Failed to update avatar");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Password validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    // Convert coverageArea to array
    const coverageAreaArray = formData.coverageArea
      .split(",")
      .map((area) => area.trim())
      .filter((area) => area);

    if (coverageAreaArray.length === 0) {
      setError("Please provide at least one coverage area");
      toast.error("Please provide at least one coverage area");
      return;
    }

    // Validate chargePerKm
    const chargePerKmValue = parseFloat(formData.chargePerKm);
    if (formData.chargePerKm && (isNaN(chargePerKmValue) || chargePerKmValue < 0)) {
      setError("Charge per kilometer must be a non-negative number");
      toast.error("Charge per kilometer must be a non-negative number");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `${server}/delivery/profile`,
        {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password || undefined,
          phoneNumber: formData.phoneNumber,
          coverageArea: coverageAreaArray,
          chargePerKm: chargePerKmValue || undefined,
        },
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/delivery/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-white font-avenir">
         <DashboardHeader />
         <div className="flex w-full">
           <div className="w-[80px] 800px:w-[330px]">
             <DashboardSideBar active={3} />
           </div>
        <div className="flex-1 w-full max-w-4xl" style={{ fontFamily: "'Avenir LT Std', sans-serif" }}>
          <div className="text-left">
            <h2 className="text-2xl" style={{ color: "#1c3b3c" }}>
              Delivery Profile Settings
            </h2>
            <p className="text-sm text-gray-500">
              Manage your details, update your avatar, and configure delivery settings.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={avatarUrl || `${backend_url}/uploads/avatar/default_avatar.png`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#FFC300]"
                  onError={(e) => {
                    e.target.src = `${backend_url}/uploads/avatar/default_avatar.png`;
                  }}
                />
                <label
                  htmlFor="avatar"
                  className="absolute -bottom-1 -right-1 bg-gray-100 p-2 rounded-full cursor-pointer"
                >
                  <AiOutlineCamera className="text-gray-600" />
                  <input type="file" id="avatar" className="hidden" onChange={handleImage} />
                </label>
              </div>
              <p className="font-semibold text-lg text-gray-800">
                {formData.fullName || "Full name"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formData.phoneNumber || "+251 --------"}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-700 mt-6 mb-6">General Information</h3>
              <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  required
                />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                />
              </form>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Delivery Settings</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700">Coverage Area (comma-separated)</label>
                <input
                  type="text"
                  name="coverageArea"
                  value={formData.coverageArea}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  placeholder="e.g., Addis Ababa, Bole"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Charge Per Kilometer (Birr)</label>
                <input
                  type="number"
                  name="chargePerKm"
                  value={formData.chargePerKm}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 2.50"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Password (optional)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#FFC300]"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex justify-center mt-6 md:col-span-2">
                <button
                  type="submit"
                  className="w-[10rem] border border-[#FFC300] text-[#FFC300] px-4 py-2 rounded-lg shadow-sm hover:bg-[#FFC300] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
            {success && <p className="text-green-500 mt-4 text-center">{success}</p>}
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;