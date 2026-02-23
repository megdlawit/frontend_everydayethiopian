import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { server } from "../server";
import api from '../utils/api';
import { toast } from 'react-toastify';
import Toast from "../components/Toast"; 
import logo from "../Assests/images/logo.png";
import pattern from "../Assests/images/pattern2.svg";
import Footer from '../components/Layout/Footer';
import template1 from "../Assests/images/hero.jpg";
import template2 from "../Assests/images/hero2.jpg";
import peacock from "../Assests/images/edit.png";
import backImage from "../Assests/images/back.png";

const ShopCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSeller, seller } = useSelector((state) => state.seller);
  const initialPlanRaw = location.state?.plan || "free";
  const initialPlan = initialPlanRaw.toString().toLowerCase();
  // map possible incoming plan names to the templateOptions keys
  const planKey = ["free", "growth", "pro", "enterprise"].includes(initialPlan)
    ? initialPlan
    : initialPlan === "premium"
    ? "pro"
    : "free";
  const [plan] = useState(initialPlanRaw);
  const [billingCycle] = useState(location.state?.billingCycle || "monthly");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const showToast = (type, title, message) => {
    toast(
      <Toast
        type={type}
        title={title}
        message={message}
        onClose={() => toast.dismiss()}
      />,
      {
        icon: false,
        closeButton: false,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
        },
      }
    );
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handlePreviewBack = () => {
    setSelectedTemplate(null);
    setShowPreview(false);
  };

  const handleConfirmTemplate = async () => {
    if (!selectedTemplate) {
      showToast("error", "Template Selection", "Please select a template");
      return;
    }

    if (!isSeller || !seller?._id) {
      showToast("error", "Authentication Required", "You must be logged in as a seller to confirm the template");
      navigate("/shop-login");
      return;
    }

    try {
      const response = await api.put(
        `${server}/shop/update-plan`,
        { template: selectedTemplate },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        showToast("success", "Update Successful", "Template updated successfully!");
        setShowPreview(false);
        setShowOverlay(true);
      } else {
        showToast("error", "Update Failed", "Failed to update template");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      const message = error.response?.data?.message || "Error updating template";
      if (error.response?.status === 401) {
        showToast("error", "Login Required", "Please login to continue");
        navigate("/shop-login");
      } else if (error.response?.status === 403) {
        showToast("error", "Account Issue", "Your shop account is deactivated.");
      } else if (error.response?.status === 400) {
        showToast("error", "Invalid Selection", "Invalid template selected. Please try again.");
      } else {
        showToast("error", "Error", message);
      }
    }
  };

  const handleEditClick = () => {
    const planType = selectedTemplate === "growthplan" ? "growthplan" : selectedTemplate === "proplan" ? "proplan" : "basic";
    const basePath = planType === "basic" ? "/shop/edit" : `/shop/${planType}/edit`;
    navigate(`${basePath}/${seller?._id || '67e7f749908fda2827de9095'}`, { state: { plan, template: selectedTemplate, billingCycle } });
  };

  const handleChangeMind = () => {
    setSelectedTemplate(null);
    setShowOverlay(false);
    setShowPreview(false);
  };

  const templateOptions = {
    free: [{ name: "basic", img: template1 }],
    growth: [{ name: "growthplan", img: template1 }],
    pro: [{ name: "proplan", img: template2 }],
    enterprise: [{ name: "proplan", img: template2 }],
  };

  const templates = templateOptions[planKey] || templateOptions.free;

  const previewUrl = selectedTemplate
    ? `${
        selectedTemplate === "growthplan"
          ? `/shop/growthplan/${seller?._id || '67e7f749908fda2827de9095'}`
          : selectedTemplate === "proplan"
          ? `/shop/proplan/${seller?._id || '67e7f749908fda2827de9095'}`
          : `/shop/preview/${seller?._id || '67e7f749908fda2827de9095'}`
      }?plan=${encodeURIComponent(plan)}&template=${encodeURIComponent(selectedTemplate)}&billingCycle=${encodeURIComponent(billingCycle)}`
    : '';

  const getFormattedTemplateName = () => {
    if (!selectedTemplate) return `${plan.charAt(0).toUpperCase() + plan.slice(1)} Shop`;
    if (selectedTemplate.toLowerCase().includes("basic")) return "Basic Shop";
    if (selectedTemplate.toLowerCase().includes("growthplan")) return "Growth Plan Shop";
    if (selectedTemplate.toLowerCase().includes("proplan")) return "Pro Plan Shop";
    return `${plan.charAt(0).toUpperCase() + plan.slice(1)} Shop`;
  };

  return (
    <>
      <div
        className="relative min-h-screen flex flex-col items-center justify-start pt-8 md:pt-12 lg:pt-20 font-sans overflow-visible bg-white"
        style={{
          backgroundImage: `url(${backImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
        }}
      >
        <div className="w-full max-w-7xl px-4 sm:px-6 md:px-8 relative z-10">
          {!showPreview && !showOverlay ? (
            <>
              {/* Logo Section */}
              <div className="flex justify-center mt-4 sm:mt-6 md:mt-8">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-28 sm:w-32 md:w-36 lg:w-40 h-auto" 
                />
              </div>
              
              {/* Heading Section */}
              <h2 
                className="mt-6 sm:mt-8 md:mt-10 mb-4 text-center font-quesha text-black"
                style={{ 
                  fontFamily: "'Quesha', sans-serif", 
                  fontSize: "clamp(36px, 8vw, 60px)",
                  lineHeight: "1.2"
                }}
              >
                Welcome aboard!
              </h2>
              
              {/* Description */}
              <p className="mb-6 sm:mb-8 text-center font-avenir text-gray-700 font-medium px-4 text-base sm:text-lg md:text-xl">
                Let's kick things off by picking your perfect template for the {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan!
              </p>
              
              {/* Template Selection */}
              <div className="flex justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
                {templates.map((tpl) => (
                  <div
                    key={tpl.name}
                    className="relative cursor-pointer group transition-transform duration-300 hover:scale-[1.02] w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[500px] mx-auto"
                    onClick={() => handleTemplateSelect(tpl.name)}
                  >
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-[150px] sm:h-[180px] md:h-[200px] pointer-events-none z-[-1]"
                      style={{
                        background: 'radial-gradient(circle, #FFD700 0%, #FFB300 40%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(40px)',
                        opacity: 0.5,
                      }}
                    />
                    <div className="relative w-full h-[140px] sm:h-[160px] md:h-[200px] lg:h-[240px] xl:h-[300px] rounded-2xl overflow-hidden border shadow group-hover:shadow-[0_8px_30px_rgba(255,193,7,0.6)] transition-all">
                      <img
                        src={tpl.img}
                        alt={tpl.name}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(tpl.name);
                        }}
                        className="absolute top-0 right-0 bg-[#FFC300] text-white px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 shadow-md"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pattern Divider */}
              <div
                className="w-full h-[30px] sm:h-[40px] md:h-[50px] bg-no-repeat my-8 sm:my-10"
                style={{
                  backgroundImage: `url(${pattern})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </>
          ) : showPreview ? (
            <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md bg-black/30 pointer-events-auto p-4">
              <div
                className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px] lg:w-[900px] lg:h-[900px] rounded-full z-[-1]"
                style={{
                  background: `radial-gradient(circle, rgba(255, 193, 7, 0.7) 0%, rgba(255, 193, 7, 0.4) 40%, transparent 70%)`,
                  filter: 'blur(100px)',
                  opacity: 0.8,
                }}
              />
              <div className="relative rounded-2xl w-full max-w-8xl flex flex-col max-h-[calc(100vh-2rem)] mt-[1rem] sm:mt-[2rem] overflow-y-hidden bg-white">
                <button
                  onClick={handlePreviewBack}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gray-500 hover:bg-gray-600 rounded-full p-1.5 sm:p-2 transition-colors z-50"
                  aria-label="Close preview"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="white"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex-1 rounded-lg border border-gray-200 shadow-inner min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
                  <iframe
                    src={previewUrl}
                    title="Template Preview"
                    className="w-full h-full rounded-lg"
                    style={{ border: 'none', minHeight: '500px' }}
                  />
                </div>
                <div className="sticky bottom-4 sm:bottom-10 pt-4 pb-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                  <button
                    onClick={handlePreviewBack}
                    className="bg-[#CC9A00] text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-avenir-lt-std hover:bg-[#FFB300] transition-colors shadow-md text-sm sm:text-base md:text-lg w-full sm:w-auto"
                  >
                    Change my mind 
                  </button>
                  <button
                    onClick={handleConfirmTemplate}
                    className="bg-[#CC9A00] text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-avenir-lt-std hover:bg-[#FFD700] transition-colors shadow-md text-sm sm:text-base md:text-lg w-full sm:w-auto"
                  >
                    Confirm Plan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md bg-black/30 pointer-events-auto p-4">
              <div
                className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px] rounded-full z-[-1]"
                style={{
                  background: `radial-gradient(circle, rgba(255, 193, 7, 0.7) 0%, rgba(255, 193, 7, 0.4) 40%, transparent 70%)`,
                  filter: 'blur(100px)',
                  opacity: 0.8,
                }}
              />
              <div
                className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] bg-no-repeat bg-contain bg-center flex flex-col items-center justify-center text-center"
                style={{
                  backgroundImage: `url(${peacock})`,
                }}
              >
                <div className="mt-24 sm:mt-28 md:mt-32 lg:mt-40">
                  <h2 className="text-lg sm:text-xl md:text-2xl text-white font-avenir-lt-std">Great!</h2>
                  <p className="text-sm sm:text-base md:text-lg italic text-black mb-1 font-la-belle-aurore mt-4 sm:mt-6 md:mt-7">
                    Let's have fun editing
                  </p>
                  <button
                    onClick={handleEditClick}
                    className="bg-[#FFE180] text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full hover:bg-[#FFD700] transition font-avenir-lt-std text-xs sm:text-sm md:text-base mt-2"
                  >
                    Edit {getFormattedTemplateName()}
                  </button>
                </div>
              </div>
              <button
                onClick={handleChangeMind}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-gray-500 text-white p-1.5 sm:p-2 rounded-full font-avenir hover:bg-[#FFB300] transition-colors pointer-events-auto shadow-xl"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=La+Belle+Aurore&display=swap');
          @import url('https://fonts.cdnfonts.com/css/avenir-lt-std');

          .font-quesha {
            font-family: 'Playfair Display', serif;
          }

          .font-avenir {
            font-family: 'Montserrat', sans-serif;
          }

          .font-la-belle-aurore {
            font-family: 'La Belle Aurore', cursive;
          }

          .font-avenir-lt-std {
            font-family: 'Avenir LT Std', sans-serif;
          }

          /* Responsive adjustments */
          @media (max-width: 640px) {
            .responsive-container {
              padding-left: 1rem;
              padding-right: 1rem;
            }
          }

          @media (max-width: 768px) {
            iframe {
              min-height: 400px;
            }
          }

          @media (max-width: 1024px) {
            .preview-modal {
              margin-top: 1rem;
            }
          }
        `}
      </style>
    </>
  );
};

export default ShopCreatePage;