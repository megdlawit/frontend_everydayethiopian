import React from "react";
import peacockL from "../../../../Assests/images/peacockl.png";
import '../../../Route/PeacockShopL/PeacockShopL.css';
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp, FaTelegram, FaGlobe } from "react-icons/fa";

const SOCIAL_ICONS = [
  { name: "Facebook", component: FaFacebook },
  { name: "Instagram", component: FaInstagram },
  { name: "Twitter", component: FaTwitter },
  { name: "WhatsApp", component: FaWhatsapp },
  { name: "Telegram", component: FaTelegram },
  { name: "Website", component: FaGlobe },
];

const GrowthPlanContact = ({ shop }) => {
  const contactDescription = shop?.contactDescription || "Contact us for more information!";
  const socialMedias = shop?.socialMedias || [];

  return (
    <div className="peacock-containerl">
      <div className="peacock-contentl">
        <div className="text-boxl">
          <h1 className="titlel">
            Contact Us <span className="highlight">Today</span> !
          </h1>
          <h4 className="descriptionl md:ml-20">
            {contactDescription}
          </h4>
          <div className="social-icons-container flex flex-wrap justify-center md:justify-start gap-4 mt-8">
            {socialMedias.map((media, idx) => {
              const IconComp = SOCIAL_ICONS.find((ic) => ic.name === media.icon)?.component || FaGlobe;
              return (
                <a 
                  key={idx} 
                  href={media.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-icon-link text-[#FAC50C] hover:text-[#1C3B3E] transition-all duration-300 bg-white/10 hover:bg-[#FAC50C] rounded-full p-3 flex items-center justify-center w-14 h-14 hover:scale-110 hover:shadow-lg"
                  aria-label={`Visit our ${media.icon}`}
                >
                  <IconComp size={24} />
                </a>
              );
            })}
          </div>
        </div>
        <div className="peacock-image-containerl">
          <img 
            src={peacockL} 
            alt="Decorative Peacock" 
            className="peacock-imagel w-full h-auto max-w-md" 
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default GrowthPlanContact;