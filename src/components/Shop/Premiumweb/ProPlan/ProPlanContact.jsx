// Alternative version with all styles in the component
import React from "react";
import proPlanImage from "../../../../Assests/images/peacockl.png";
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp, FaTelegram, FaGlobe } from "react-icons/fa";

const SOCIAL_ICONS = [
  { name: "Facebook", component: FaFacebook },
  { name: "Instagram", component: FaInstagram },
  { name: "Twitter", component: FaTwitter },
  { name: "WhatsApp", component: FaWhatsapp },
  { name: "Telegram", component: FaTelegram },
  { name: "Website", component: FaGlobe },
];

const ProPlanContact = ({ shop }) => {
  const contactDescription = shop?.contactDescription || "Contact us for more information!";
  const socialMedias = shop?.socialMedias || [];

  return (
    <div className="relative flex justify-center items-center py-12 px-5 bg-gradient-to-br from-[#f5f3ef] to-white overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden lg:flex max-w-7xl w-full items-center justify-between relative z-10">
        <div className="flex-1 pr-10 text-center">
          <h1 className="text-5xl font-bold text-[#1C3B3E] mb-5" style={{ fontFamily: "'Quesha', serif" }}>
            Contact Us <span className="text-[#FAC50C]">Today</span> !
          </h1>
          <h4 className="text-xl text-gray-600 mb-8 font-light ml-20">
            {contactDescription}
          </h4>
          <div className="flex space-x-4 justify-center">
            {socialMedias.map((media, idx) => {
              const IconComp = SOCIAL_ICONS.find((ic) => ic.name === media.icon)?.component || FaGlobe;
              return (
                <a 
                  key={idx} 
                  href={media.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#FAC50C] hover:text-[#1C3B3E] transition-all duration-300 hover:-translate-y-1"
                >
                  <IconComp size={28} />
                </a>
              );
            })}
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img 
            src={proPlanImage} 
            alt="Decorative ProPlan" 
            className="max-w-lg w-full h-auto object-contain filter drop-shadow-lg" 
          />
        </div>
      </div>

      {/* Mobile & Tablet Layout */}
      <div className="lg:hidden w-full max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8">
          <div className="text-center md:text-left w-full md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[#1C3B3E]" style={{ fontFamily: "'Quesha', serif" }}>
              Contact Us <span className="text-[#FAC50C]">Today</span> !
            </h1>
            <h4 className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 font-light">
              {contactDescription}
            </h4>
            <div className="flex justify-center md:justify-start space-x-5 sm:space-x-6">
              {socialMedias.map((media, idx) => {
                const IconComp = SOCIAL_ICONS.find((ic) => ic.name === media.icon)?.component || FaGlobe;
                return (
                  <a 
                    key={idx} 
                    href={media.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#FAC50C] hover:text-[#1C3B3E] transition-colors duration-200"
                  >
                    <IconComp size={24} className="sm:w-7 sm:h-7" />
                  </a>
                );
              })}
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-6 md:mt-0">
            <img 
              src={proPlanImage} 
              alt="Decorative ProPlan" 
              className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProPlanContact;