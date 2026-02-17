import React, { useState } from "react";
import Header2 from "../components/Layout/Header2";
import styles from "../styles/styles";
import Loader from "../components/Layout/Loader";
import ProfileSideBar from "../components/Profile/ProfileSidebar";
import ProfileContent from "../components/Profile/ProfileContent";
import { useSelector } from "react-redux";
import { AiOutlineMenu } from "react-icons/ai";
import { RxPerson } from "react-icons/rx";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { AiOutlineMessage } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { loading } = useSelector((state) => state.user);
  const [active, setActive] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleNavigation = (activeNumber, path = "/profile", section = "") => {
    setActive(activeNumber);
    if (section) {
      navigate(`${path}?section=${section}`);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {loading ? (
        <Loader />
      ) : (
        <>
          <Header2 />
          
          {/* REMOVED: Mobile Header section with Profile title and hamburger menu */}

          <div className={`${styles.section} flex flex-col lg:flex-row bg-[#FFFFFF] py-0 min-h-screen`}>
            {/* Sidebar - Hidden on mobile, shown via overlay */}
            <div className="w-full lg:w-[335px] xl:w-[335px] shrink-0">
              <ProfileSideBar 
                active={active} 
                setActive={setActive}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={closeMobileSidebar}
              />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 w-full lg:pl-6">
              <div className="bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:min-h-[calc(100vh-140px)]">
                <ProfileContent active={active} />
              </div>
            </div>
          </div>

          {/* Mobile Bottom Navigation (Optional) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-30">
            <div className="flex justify-around items-center">
              <button
                onClick={() => handleNavigation(1)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  active === 1 ? "text-yellow-500" : "text-gray-500"
                }`}
              >
                <RxPerson size={20} />
                <span className="text-xs mt-1">Profile</span>
              </button>
              <button
                onClick={() => handleNavigation(2, "/profile", "orders")}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  active === 2 ? "text-yellow-500" : "text-gray-500"
                }`}
              >
                <HiOutlineShoppingBag size={20} />
                <span className="text-xs mt-1">Orders</span>
              </button>
              <button
                onClick={() => handleNavigation(4, "/inbox")}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  active === 4 ? "text-yellow-500" : "text-gray-500"
                }`}
              >
                <AiOutlineMessage size={20} />
                <span className="text-xs mt-1">Inbox</span>
              </button>
              <button
                onClick={toggleMobileSidebar}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  active >= 6 ? "text-yellow-500" : "text-gray-500"
                }`}
              >
                <AiOutlineMenu size={20} />
                <span className="text-xs mt-1">More</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;