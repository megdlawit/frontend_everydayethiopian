import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Login from "../components/Login/Login.jsx";
import ShopLogin from "../components/Shop/ShopLogin.jsx";
import DeliveryLogin from "../components/Delivery/DeliveryLogin.jsx";
import peacLogo from "../Assests/images/peac.png";
import logoImg from "../Assests/images/logo.png";
import backImage from "../Assests/images/back1.png";
import Footer from '../components/Layout/Footer.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [selectedForm, setSelectedForm] = useState("shopper");

  useEffect(() => {
    if (isAuthenticated === true) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleToggle = (formType) => {
    setSelectedForm(formType);
  };

  const roleSteps = [
    { label: "Shopper", value: "shopper" },
    { label: "Seller", value: "seller" },
    // { label: "Delivery", value: "delivery" },
  ];

  return (
    <div>
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center bg-white font-[Avenir LT Std] responsive-text-sm relative overflow-hidden responsive-padding"
        style={{
          backgroundImage: `url(${backImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
        }}
      >
        <img src={logoImg} alt="Logo" className="w-40 sm:w-56 mt-8 sm:mt-16 mb-8 sm:mb-16 z-10" />
        <div className="flex items-center justify-center mb-4 relative z-10 px-4">
          {roleSteps.map((stepItem, index) => (
            <React.Fragment key={stepItem.value}>
              <div
                className="flex flex-col items-center cursor-pointer relative"
                onClick={() => handleToggle(stepItem.value)}
              >
                {selectedForm === stepItem.value && (
                  <img src={peacLogo} alt="Peac Logo" className="w-14 h-14 absolute -top-14" />
                )}
                <div
                  className={`w-20 h-20 flex items-center justify-center rounded-full border text-base font-normal
                    ${selectedForm === stepItem.value ? "bg-[#FFF2CC] text-[#CC9A00] border-[#CC9A00]" : "bg-white text-black border-[#fef4ca]"}`}
                >
                  {stepItem.label}
                </div>
              </div>
              {index < roleSteps.length - 1 && (
                <div className="h-1 w-20 mx-2 bg-[#CC9A00]" />
              )}
            </React.Fragment>
          ))}
        </div>
        {selectedForm === "shopper" && <Login />}
        {selectedForm === "seller" && <ShopLogin />}
        {selectedForm === "delivery" && <DeliveryLogin />}
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;