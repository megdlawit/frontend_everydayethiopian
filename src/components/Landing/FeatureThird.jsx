import React from "react";
import box from "../../Assests/images/box.svg";
import map from "../../Assests/images/map.svg";
import locate from "../../Assests/images/locate.svg";

const FeatureThird = () => {
  return (
    <>
      <style jsx>{`
        @keyframes horizontalMove {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(30vw);
          }
        }
        .animate-horizontal-move {
          animation: horizontalMove 12s ease-in-out forwards;
        }
        @keyframes mapPop {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-map-pop {
          animation: mapPop 1.5s ease-out forwards;
        }
        @keyframes locateFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-3px) scale(1.05);
          }
        }
        .animate-locate-float {
          animation: locateFloat 2s ease-in-out infinite;
        }
      `}</style>
      <section className="bg-[#0b1a1c] text-white py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-20 font-sans">
        {/* --- Container --- */}
        <h2 className="text-left text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-['Quesha'] mb-6 sm:mb-8 md:mb-10 lg:mb-12 tracking-wide text-[#d9ede1]">
          We Are Here To Make It Easy!
        </h2>
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#0C1B1E] border border-[#14282B] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
            {/* --- Section Title --- */}
           

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 relative">
              {/* --- Left Side: Text and Box --- */}
              <div className="flex flex-col items-start justify-center order-2 lg:order-1">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-4xl text-[#E2E2E2] mt-6 sm:mt-8 md:mt-10 lg:mt-10 font-light mb-4 sm:mb-6 text-left font-['Avenir LT Std'] leading-relaxed">
                  We pack and deliver <br className="hidden sm:block" /> your products safely.
                </p>
                <img
                  src={box}
                  alt="Box icon"
                  className="w-16 sm:w-20 md:w-24 lg:w-32 xl:w-40 object-contain mt-8 sm:mt-10 md:mt-12 lg:mt-[6rem] self-start animate-horizontal-move"
                />
              </div>

              {/* --- Right Side: Map --- */}
              <div className="relative order-1 lg:order-2 mx-auto max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-md xl:max-w-lg">
                <img
                  src={map}
                  alt="Map with pins"
                  className="w-full h-auto object-contain block animate-map-pop"
                />
                <img
                  src={locate}
                  alt="Locate icon"
                  className="absolute top-1/2 right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8 transform -translate-y-1/2 w-20 sm:w-24 md:w-38 lg:w-50 xl:w-60 animate-locate-float"
                />
              </div>
              <div className="col-span-1 lg:col-span-2 w-full h-2 sm:h-3 bg-[#CC9A00] order-3 self-start lg:self-auto mt-[-1rem] sm:mt-[-1.5rem] md:mt-[-2rem]"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeatureThird;